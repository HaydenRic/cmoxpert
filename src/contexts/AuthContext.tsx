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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .abortSignal(controller.signal)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (error) {
          if (retryCount === 0) {
            setTimeout(() => loadProfile(userId, 1), 1000);
            return;
          }
          setError('Failed to load user profile. Please refresh the page.');
          return;
        }

        if (!data) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              email: user?.email || '',
              role: 'user'
            }])
            .select()
            .maybeSingle();

          if (createError) {
            setError('Failed to create user profile. Please refresh the page.');
            return;
          }

          setProfile(newProfile);
          setError(null);
          return;
        }

        setProfile(data);
        setError(null);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError' && retryCount === 0) {
          setTimeout(() => loadProfile(userId, 1), 1000);
          return;
        }
        setError('Connection timeout. Please check your internet connection.');
      }
    } catch (error: any) {
      setError('An unexpected error occurred while loading your profile.');
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        initTimeout = setTimeout(() => {
          if (mounted) {
            setLoading(false);
            setError('Connection timeout. Please refresh the page.');
          }
        }, 8000);

        const { data: { session }, error } = await supabase.auth.getSession();

        clearTimeout(initTimeout);

        if (!mounted) return;

        if (error) {
          setError('Authentication error. Please refresh the page.');
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
        if (mounted) {
          setError('Failed to initialize authentication. Please refresh the page.');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
        setUserContext(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setError(null);
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

      const result = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (result.error) {
        setError(result.error.message);
      }

      return result;
    } catch (error: any) {
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

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined
        }
      });

      if (result.error) {
        setError(result.error.message);
        return result;
      }

      if (result.data.user) {
        setTimeout(async () => {
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', result.data.user!.id)
              .maybeSingle();

            if (!existingProfile) {
              await supabase
                .from('profiles')
                .insert([{
                  id: result.data.user!.id,
                  email: result.data.user!.email!,
                  role: 'user'
                }]);
            }
          } catch (error) {
            // Silent fail, profile will be created on next sign in
          }
        }, 1000);
      }

      return result;
    } catch (error: any) {
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