import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { setUserContext, clearUserContext } from '../lib/monitoring';

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  skipLoading: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  const skipLoading = () => setLoading(false);

  const loadProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log('Loading profile for user:', userId, retryCount > 0 ? `(retry ${retryCount})` : '');
      
      // Use AbortController for better timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .abortSignal(controller.signal)
          .single();

        clearTimeout(timeoutId);

        if (error) {
          console.error('Error loading profile:', error);
          
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
            console.log('Profile not found, creating new profile...');
            
            const createController = new AbortController();
            const createTimeoutId = setTimeout(() => createController.abort(), 15000);
            
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                  id: userId,
                  email: user?.email || '',
                  role: 'user'
                }])
                .select()
                .abortSignal(createController.signal)
                .single();

              clearTimeout(createTimeoutId);

              if (createError) {
                console.error('Error creating profile:', createError);
                setError('Failed to create user profile. Please try refreshing the page.');
                return;
              }

              console.log('Profile created:', newProfile);
              setProfile(newProfile);
              setError(null);
              return;
            } catch (createErr) {
              clearTimeout(createTimeoutId);
              console.error('Profile creation failed:', createErr);
              setError('Failed to create profile. Please try again.');
              return;
            }
          }
          
          // For other errors, retry once
          if (retryCount === 0) {
            console.log('Retrying profile load...');
            setTimeout(() => loadProfile(userId, 1), 2000);
            return;
          }
          
          setError('Failed to load user profile. Please try refreshing the page.');
          return;
        }

        console.log('Profile loaded:', data);
        setProfile(data);
        setError(null);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.error('Profile loading timeout');
          if (retryCount === 0) {
            console.log('Retrying after timeout...');
            setTimeout(() => loadProfile(userId, 1), 2000);
            return;
          }
          setError('Connection timeout. Please check your internet connection.');
        } else {
          console.error('Profile loading error:', err);
          setError('Failed to load profile. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error in loadProfile:', error);
      setError('An unexpected error occurred while loading your profile.');
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set a maximum initialization time
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization taking too long, proceeding without session');
            setLoading(false);
            setError('Connection timeout. You can still use the app, but some features may be limited.');
          }
        }, 15000);

        // Use AbortController for session initialization
        const controller = new AbortController();
        const sessionTimeout = setTimeout(() => controller.abort(), 10000);

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          clearTimeout(sessionTimeout);
          clearTimeout(initTimeout);
          
          if (!mounted) return;

          console.log('Initial session:', session);
          if (error) {
            console.error('Error getting session:', error);
            setError('Authentication error. Please try refreshing the page.');
            setLoading(false);
            return;
          }

          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadProfile(session.user.id);
          }
          
          setLoading(false);
        } catch (err: any) {
          clearTimeout(sessionTimeout);
          clearTimeout(initTimeout);
          
          if (!mounted) return;
          
          if (err.name === 'AbortError') {
            console.error('Session initialization timeout');
            setError('Connection timeout. Please check your internet connection.');
          } else {
            console.error('Session initialization error:', err);
            setError('Failed to initialize authentication. Please refresh the page.');
          }
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Failed to initialize authentication. Please refresh the page.');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
        // Set user context for error reporting
        setUserContext(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setError(null);
        // Clear user context on logout
        clearUserContext();
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for sign in
      
      try {
        const result = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        clearTimeout(timeoutId);
        console.log('Sign in result:', result);
        
        if (result.error) {
          setError(result.error.message);
        }
        
        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          const errorMessage = 'Sign in timeout. Please check your connection and try again.';
          setError(errorMessage);
          return { error: { message: errorMessage } };
        }
        throw err;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'An error occurred during sign in';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      try {
        const result = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: undefined // Disable email confirmation for now
          }
        });
        
        clearTimeout(timeoutId);
        console.log('Sign up result:', result);
        
        if (result.error) {
          setError(result.error.message);
          return result;
        }
        
        // If signup is successful and we have a user, the trigger should create their profile
        if (result.data.user) {
          setTimeout(async () => {
            try {
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', result.data.user!.id)
                .single();

              if (!existingProfile) {
                console.log('Creating profile manually...');
                await supabase
                  .from('profiles')
                  .insert([{
                    id: result.data.user!.id,
                    email: result.data.user!.email!,
                    role: 'user'
                  }]);
              }
            } catch (error) {
              console.error('Error ensuring profile exists:', error);
            }
          }, 1000);
        }
        
        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          const errorMessage = 'Sign up timeout. Please check your connection and try again.';
          setError(errorMessage);
          return { error: { message: errorMessage } };
        }
        throw err;
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'An error occurred during sign up';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError('Error signing out. Please try again.');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setError(null);
      await loadProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAdmin: profile?.role === 'admin',
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearError,
    skipLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}