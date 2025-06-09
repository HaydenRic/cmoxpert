import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const createTimeoutPromise = (ms: number, operation: string) => {
    return new Promise((_, reject) => {
      const timeoutId = setTimeout(() => reject(new Error(`${operation} timeout after ${ms}ms`)), ms);
      return () => clearTimeout(timeoutId);
    });
  };

  const loadProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log('Loading profile for user:', userId, retryCount > 0 ? `(retry ${retryCount})` : '');
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Reduced timeout for faster feedback
      const timeoutPromise = createTimeoutPromise(10000, 'Profile loading');

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error loading profile:', error);
        
        // If it's a timeout and we haven't retried yet, try once more
        if (error.message?.includes('timeout') && retryCount === 0) {
          console.log('Retrying profile load...');
          return await loadProfile(userId, 1);
        }
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          console.log('Profile not found, creating new profile...');
          
          const createPromise = supabase
            .from('profiles')
            .insert([{
              id: userId,
              email: user?.email || '',
              role: 'user'
            }])
            .select()
            .single();

          const createTimeoutPromise = createTimeoutPromise(120000, 'Profile creation');

          try {
            const { data: newProfile, error: createError } = await Promise.race([createPromise, createTimeoutPromise]) as any;

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
            console.error('Profile creation timeout:', createErr);
            setError('Connection timeout while creating profile. Please check your internet connection.');
            return;
          }
        }
        
        // Handle other errors
        if (error.message?.includes('timeout')) {
          setError('Connection timeout. Please check your internet connection and try again.');
        } else {
          setError('Failed to load user profile. Please try refreshing the page.');
        }
        return;
      }

      console.log('Profile loaded:', data);
      setProfile(data);
      setError(null);
    } catch (error: any) {
      console.error('Error in loadProfile:', error);
      if (error.message?.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred while loading your profile.');
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Reduced timeout for faster feedback
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = createTimeoutPromise(8000, 'Session initialization');

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!mounted) return;

        console.log('Initial session:', session);
        if (error) {
          console.error('Error getting session:', error);
          if (error.message?.includes('timeout')) {
            setError('Connection timeout during authentication. Please check your internet connection.');
          } else {
            setError('Authentication error. Please try refreshing the page.');
          }
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Session initialization error:', error);
        if (mounted) {
          if (error.message?.includes('timeout')) {
            setError('Connection timeout during startup. Please check your internet connection.');
          } else {
            setError('Failed to initialize authentication. Please refresh the page.');
          }
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
      } else {
        setProfile(null);
        setError(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('Sign in result:', result);
      
      if (result.error) {
        setError(result.error.message);
      }
      
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'An error occurred during sign in';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation for now
        }
      });
      
      console.log('Sign up result:', result);
      
      if (result.error) {
        setError(result.error.message);
        return result;
      }
      
      // If signup is successful and we have a user, the trigger should create their profile
      // But let's add a fallback just in case
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
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'An error occurred during sign up';
      setError(errorMessage);
      return { error: { message: errorMessage } };
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