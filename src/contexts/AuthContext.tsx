import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
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
  signIn: (email: string, password: string) => Promise<{ error: unknown; success?: boolean }>;
  signUp: (email: string, password: string) => Promise<{ error: unknown }>;
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

  const loadProfile = async (userId: string, userEmail: string, retryCount = 0, maxRetries = 2) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .abortSignal(controller.signal)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (error) {
          if (retryCount < maxRetries) {
            setTimeout(() => loadProfile(userId, userEmail, retryCount + 1, maxRetries), 1000);
            return;
          }
          setError('Unable to load profile');
          return;
        }

        if (!data) {
          console.log('[AUTH] Profile not found, attempting to create...');

          // Try to use the database function to ensure profile exists
          const { error: functionError } = await supabase
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
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        console.error('[AUTH] Profile load exception:', err);

        const errAny = err as { name?: string };
        if (errAny.name === 'AbortError' && retryCount < maxRetries) {
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
    } catch (error: unknown) {
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

        // Fast timeout for better UX
        initTimeout = setTimeout(() => {
          if (mounted) {
            setLoading(false);
            setError('Connection timeout');
          }
        }, 5000);

        const { data: { session }, error } = await supabase.auth.getSession();

        clearTimeout(initTimeout);

        if (!mounted) return;

        if (error) {
          setError('Authentication error');
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id, session.user.email || '');
        }

        setLoading(false);
      } catch (error: unknown) {
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
        const errorMessage = result.error.message;
        setError(errorMessage);

        if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid')) {
          toast.error('Invalid email or password. Please try again.', {
            icon: '✕',
          });
        } else if (errorMessage.includes('Email not confirmed')) {
          toast.error('Please verify your email before signing in.', {
            icon: 'ℹ',
          });
        } else {
          toast.error(errorMessage, {
            icon: '✕',
          });
        }

        return result;
      }

      if (result.data.session) {
        setLoginSuccess(true);
        toast.success('Welcome back! Redirecting to dashboard...', {
          icon: '✓',
          duration: 3000,
        });
      }

      return { ...result, success: true };
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'An error occurred during sign in';
      setError(errorMessage);
      toast.error('Login failed. Please try again.', {
        icon: '✕',
      });
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
        const errorMessage = result.error.message;
        setError(errorMessage);

        if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
          toast.error('Email already registered. Try logging in instead.', {
            icon: 'ℹ',
            style: {
              background: '#f59e0b',
              color: '#fff',
            },
          });
        } else {
          toast.error(errorMessage, {
            icon: '✕',
          });
        }

        return result;
      }

      if (result.data.user) {
        toast.success('Account created successfully! Welcome to CMOxPert', {
          icon: '🎉',
          duration: 3000,
        });

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
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'An error occurred during sign up';
      setError(errorMessage);
      toast.error('Sign up failed. Please try again.', {
        icon: '✕',
      });
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
    } catch (error: unknown) {
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