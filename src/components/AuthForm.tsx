import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Compass, AlertCircle, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
// import clsx from 'clsx'; // Removed to simplify and rule out library issues
import { LoginSuccessModal } from './LoginSuccessModal';

interface ValidationError {
  field: 'email' | 'password';
  message: string;
}

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDemoMode = searchParams.get('demo') === 'true';

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [demoInProgress, setDemoInProgress] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const { signIn, signUp, clearLoginSuccess } = useAuth();

  const validateEmail = (email: string): boolean => {
    if (!email || email.trim() === '') {
      return false;
    }

    // Comprehensive email validation regex supporting all valid formats
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email.trim())) {
      return false;
    }

    // Additional validation checks
    const parts = email.trim().split('@');
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;

    // Local part validation
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;

    // Domain validation
    if (domain.length === 0 || domain.length > 253) return false;
    if (domain.startsWith('-') || domain.endsWith('-')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (!domain.includes('.')) return false;

    // Check TLD length (must be at least 2 characters)
    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) return false;

    return true;
  };

  const validatePassword = (password: string, isSignUp: boolean): string | null => {
    if (!password) {
      return 'Password is required';
    }

    if (isSignUp) {
      if (password.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      // Optional: Add more strength requirements
      // if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
      // if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
      // if (!/[0-9]/.test(password)) return 'Password must contain a number';
    }

    return null;
  };

  // Removed unused handlers to clean up code

  useEffect(() => {
    if (isDemoMode) {
      handleQuickDemo();
    }
  }, [isDemoMode]);

  const handleQuickDemo = async () => {
    setDemoInProgress(true);
    setError('');

    const demoEmail = `demo-${Date.now()}@cmoxpert-demo.com`;
    const demoPassword = 'DemoPassword123!';

    try {
      const { error: signUpError } = await signUp(demoEmail, demoPassword);

      if (signUpError) {
        setError('Could not create demo account. Please try manual sign up.');
        setDemoInProgress(false);
        return;
      }

      const result = await signIn(demoEmail, demoPassword);

      if (!result.error && result.success) {
        setSuccessEmail(demoEmail);
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } else {
        setError('Demo account created but sign in failed. Please try signing in manually.');
      }
    } catch (err) {
      setError('An error occurred while setting up your demo.');
    } finally {
      setDemoInProgress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);

    // Client-side validation
    const errors: ValidationError[] = [];

    // Validate email
    if (!email || !validateEmail(email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address'
      });
    }

    // Validate password
    const passwordError = validatePassword(password, !isSignIn);
    if (passwordError) {
      errors.push({
        field: 'password',
        message: passwordError
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      const result = isSignIn
        ? await signIn(trimmedEmail, password)
        : await signUp(trimmedEmail, password);

      if (result.error) {
        // Provide user-friendly error messages
        let errorMessage = result.error.message;

        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }

        setError(errorMessage);
      } else if (isSignIn && result.success) {
        setSuccessEmail(trimmedEmail);
        setShowSuccessModal(true);

        // Use a short delay for the success modal to be visible
        setTimeout(() => {
          // We check the profile role first, then fall back to email for hdnric@gmail.com
          // Note: profile might not be fully loaded yet here, so we reload or use the result data if available
          const isAdmin = trimmedEmail === 'hdnric@gmail.com';
          navigate(isAdmin ? '/admin' : '/dashboard');
        }, 1500);
      } else if (!isSignIn && result.data?.user) {
        if (result.data.session) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again or contact support if the problem persists.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    clearLoginSuccess();
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  if (demoInProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-horizon-900 via-horizon-800 to-horizon-700 flex items-center justify-center p-4">
        <div className="text-center bg-white/5 border border-white/10 shadow-glow rounded-xl p-12 max-w-md backdrop-blur-xl">
          <div className="w-16 h-16 bg-horizon-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Play className="w-8 h-8 text-horizon-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Setting Up Your Live Demo</h2>
          <p className="text-zinc-300 mb-6">Creating your demo account with pre-loaded data...</p>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-horizon-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-zinc-500 mt-4">This will only take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSuccessModal && (
        <LoginSuccessModal
          email={successEmail}
          onComplete={handleSuccessComplete}
        />
      )}

      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Home Link */}
          <nav className="mb-4" role="navigation" aria-label="Breadcrumb">
            <Link
              to="/"
              className="inline-flex items-center text-cornsilk-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </nav>

          <main id="main-content" role="main">
            {isDemoMode && (
              <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-green-800 font-semibold mb-1">
                  <Play className="w-5 h-5" />
                  <span>Live Demo Mode</span>
                </div>
                <p className="text-sm text-green-700">Preparing your demo account with sample data...</p>
              </div>
            )}

            {/* Logo and heading */}
            <header className="text-center mb-8" role="banner">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border border-white/20 rounded-2xl mb-6">
                <Compass className="w-8 h-8 text-horizon-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">cmoxpert</h1>
              <p className="text-zinc-300">Go from new client to indispensable strategist in record time</p>
            </header>

            {/* Form */}
            <section className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 relative z-50">
              <div className="mb-6">
                <h2 id="auth-form-heading" className="text-2xl font-bold text-white mb-2">
                  {isSignIn ? 'Welcome back' : 'Get started'}
                </h2>
                <p className="text-zinc-400">
                  {isSignIn ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>

              {error && (
                <div
                  className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center space-x-2"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                      Email address <span className="text-red-400" aria-label="required">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      autoFocus
                      required
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="none"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 bg-[#09090b] border ${validationErrors.find(ve => ve.field === 'email') ? 'border-red-500' : 'border-[#27272a]'} rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-500`}
                      style={{
                        color: '#ffffff',
                        backgroundColor: '#09090b',
                        WebkitTextFillColor: '#ffffff',
                        WebkitBoxShadow: '0 0 0 1000px #09090b inset',
                        transition: 'background-color 5000s ease-in-out 0s'
                      }}
                      placeholder="you@company.com"
                    />
                    {validationErrors.find(e => e.field === 'email') && (
                      <p id="email-error" className="text-red-500 text-xs mt-1">
                        {validationErrors.find(e => e.field === 'email')?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      required
                      spellCheck={false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 bg-[#09090b] border ${validationErrors.find(ve => ve.field === 'password') ? 'border-red-500' : 'border-[#27272a]'} rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-500`}
                      style={{
                        color: '#ffffff',
                        backgroundColor: '#09090b',
                        WebkitTextFillColor: '#ffffff',
                        WebkitBoxShadow: '0 0 0 1000px #09090b inset',
                        transition: 'background-color 5000s ease-in-out 0s'
                      }}
                      placeholder="••••••••"
                    />
                    {validationErrors.find(e => e.field === 'password') && (
                      <p id="password-error" className="text-red-500 text-xs mt-1">
                        {validationErrors.find(e => e.field === 'password')?.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'bg-horizon-600 hover:bg-horizon-500 text-white shadow-glow hover:shadow-xl'}`}
                  aria-describedby="submit-help"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading
                    ? (isSignIn ? 'Logging in...' : 'Creating account...')
                    : (isSignIn ? 'Log In' : 'Sign Up')
                  }
                </button>
                <div id="submit-help" className="sr-only">
                  {isSignIn ? 'Sign in to access your dashboard' : 'Create your account to get started'}
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSignIn(!isSignIn)}
                  className="text-horizon-400 hover:text-horizon-300 font-medium focus:outline-none focus:ring-2 focus:ring-horizon-500 focus:ring-offset-2 rounded transition-colors"
                  aria-describedby="toggle-help"
                >
                  {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
                <div id="toggle-help" className="sr-only">
                  Switch between sign in and sign up forms
                </div>
              </div>
            </section>
          </main>
        </div>
      </div >
    </>
  );
}