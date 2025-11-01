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
  loginSuccess: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  skipLoading: () => void;
  clearLoginSuccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const clearError = () => setError(null);
  const skipLoading = () => setLoading(false);
  const clearLoginSuccess = () => setLoginSuccess(false);

  const loadProfile = async (userId: string, userEmail: string, retryCount = 0, maxRetries = 3) => {
    try {
      console.log('[AUTH] Loading profile for user:', userId, 'Email:', userEmail, 'Retry:', retryCount);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .abortSignal(controller.signal)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (error) {
          console.error('[AUTH] Profile query error:', error);

          // Retry with exponential backoff
          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
            console.log(`[AUTH] Retrying profile load in ${delay}ms...`);
            setTimeout(() => loadProfile(userId, userEmail, retryCount + 1, maxRetries), delay);
            return;
          }

          setError('Unable to load your profile. Please refresh the page or contact support.');
          return;
        }

        if (!data) {
          console.log('[AUTH] Profile not found, attempting to create...');

          // Try to use the database function to ensure profile exists
          const { data: functionResult, error: functionError } = await supabase
            .rpc('ensure_profile_exists', {
              user_id: userId,
              user_email: userEmail
            });

          if (functionError) {
            console.error('[AUTH] RPC ensure_profile_exists failed:', functionError);

            // Fallback to direct insert
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: userId,
                email: userEmail,
                role: 'user'
              }])
              .select()
              .maybeSingle();

            if (createError) {
              console.error('[AUTH] Profile creation failed:', createError);

              // One final retry
              if (retryCount < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                setTimeout(() => loadProfile(userId, userEmail, retryCount + 1, maxRetries), delay);
                return;
              }

              setError('Failed to create your profile. Please try signing in again or contact support.');
              return;
            }

            if (newProfile) {
              console.log('[AUTH] Profile created successfully via insert');
              setProfile(newProfile);
              setError(null);
              return;
            }
          }

          // Fetch the created profile
          const { data: createdProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (fetchError || !createdProfile) {
            console.error('[AUTH] Failed to fetch created profile:', fetchError);
            if (retryCount < maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
              setTimeout(() => loadProfile(userId, userEmail, retryCount + 1, maxRetries), delay);
              return;
            }
            setError('Profile creation issue. Please try signing in again.');
            return;
          }

          console.log('[AUTH] Profile loaded after creation');
          setProfile(createdProfile);
          setError(null);
          return;
        }

        console.log('[AUTH] Profile loaded successfully');
        setProfile(data);
        setError(null);
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('[AUTH] Profile load exception:', err);

        if (err.name === 'AbortError' && retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`[AUTH] Timeout, retrying in ${delay}ms...`);
          setTimeout(() => loadProfile(userId, userEmail, retryCount + 1, maxRetries), delay);
          return;
        }

        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          setTimeout(() => loadProfile(userId, userEmail, retryCount + 1, maxRetries), delay);
          return;
        }

        setError('Connection timeout. Please check your internet connection and try again.');
      }
    } catch (error: any) {
      console.error('[AUTH] Unexpected profile load error:', error);
      setError('An unexpected error occurred. Please try again or contact support.');
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Initializing authentication...');

        // Increased timeout for slower connections
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('[AUTH] Timeout reached, proceeding without authentication');
            setLoading(false);
            setError('Connection timeout. You can continue without authentication or refresh the page.');
          }
        }, 15000);

        console.log('[AUTH] Fetching session from Supabase...');
        const { data: { session }, error } = await supabase.auth.getSession();

        clearTimeout(initTimeout);

        if (!mounted) {
          console.log('[AUTH] Component unmounted, aborting');
          return;
        }

        if (error) {
          console.error('[AUTH] Session fetch error:', error);
          setError('Authentication error. You can continue without authentication.');
          setLoading(false);
          return;
        }

        console.log('[AUTH] Session retrieved:', session ? 'User logged in' : 'No active session');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[AUTH] Loading user profile...');
          await loadProfile(session.user.id, session.user.email || '');
        }

        console.log('[AUTH] Authentication initialization complete');
        setLoading(false);
      } catch (error: any) {
        console.error('[AUTH] Initialization error:', error);
        if (mounted) {
          setError('Failed to initialize authentication. You can continue without authentication.');
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
        await loadProfile(session.user.id, session.user.email || '');
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
        return result;
      }

      if (result.data.session) {
        setLoginSuccess(true);
      }

      return { ...result, success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during sign in';
      setError(errorMessage);
      return { error: { message: errorMessage }, success: false };
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
      await loadProfile(user.id, user.email || '');
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAdmin: profile?.role === 'admin',
    error,
    loginSuccess,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearError,
    skipLoading,
    clearLoginSuccess,
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