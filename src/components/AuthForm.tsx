import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Compass, Mail, Lock, AlertCircle, ArrowLeft, Play, CheckCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
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

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setValidationErrors([]);

    // Real-time validation feedback
    if (newEmail.length > 0) {
      const isValid = validateEmail(newEmail);
      setEmailValid(isValid);
    } else {
      setEmailValid(null);
    }
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setValidationErrors([]);
  };

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
          navigate('/fraud-analysis');
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
      } else if (!isSignIn && result.data?.user && !result.data.session) {
        setError('Account created successfully! You can now sign in.');
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
      <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-slate_blue-800 to-slate_blue-900 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-2xl p-12 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Play className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Setting Up Your Live Demo</h2>
          <p className="text-gray-600 mb-6">Creating your demo account with pre-loaded data...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">This will only take a few seconds</p>
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

      <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-slate_blue-800 to-slate_blue-900 flex items-center justify-center p-4">
        {/* Skip to main content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white text-slate-900 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>

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

        <main id="main-content" role="main" tabIndex={-1}>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cream-100 rounded-2xl shadow-lg mb-6">
              <Compass className="w-8 h-8 text-slate_blue-800" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">cmoxpert</h1>
            <p className="text-cornsilk-200">Go from new client to indispensable strategist in record time</p>
          </header>

          {/* Form */}
          <section className="bg-white rounded-xl shadow-2xl p-8" aria-labelledby="auth-form-heading">
            <div className="mb-6">
              <h2 id="auth-form-heading" className="text-2xl font-bold text-slate-900 mb-2">
                {isSignIn ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="text-slate-600">
                {isSignIn ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>

            {error && (
              <div 
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <fieldset>
                <legend className="sr-only">Authentication Credentials</legend>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email address <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={clsx(
                        "w-full pl-10 pr-10 py-3 border rounded-lg transition-all",
                        validationErrors.some(e => e.field === 'email')
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : emailValid === true
                          ? "border-green-500 focus:ring-2 focus:ring-green-500"
                          : "border-slate-300 focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                      )}
                      placeholder="you@company.com"
                      required
                      aria-describedby="email-help email-error"
                      autoComplete="email"
                    />
                    {emailValid === true && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    <div id="email-help" className="sr-only">Enter your email address to sign in or create an account</div>
                    {validationErrors.find(e => e.field === 'email') && (
                      <p id="email-error" className="text-red-600 text-sm mt-1">
                        {validationErrors.find(e => e.field === 'email')?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password <span className="text-red-500" aria-label="required">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={clsx(
                        "w-full pl-10 pr-4 py-3 border rounded-lg transition-all",
                        validationErrors.some(e => e.field === 'password')
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : "border-slate-300 focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                      )}
                      placeholder="••••••••"
                      required
                      aria-describedby="password-help password-error"
                      autoComplete={isSignIn ? "current-password" : "new-password"}
                    />
                    <div id="password-help" className="sr-only">
                      {isSignIn ? 'Enter your password' : 'Create a secure password (at least 8 characters)'}
                    </div>
                    {validationErrors.find(e => e.field === 'password') && (
                      <p id="password-error" className="text-red-600 text-sm mt-1">
                        {validationErrors.find(e => e.field === 'password')?.message}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'w-full py-3 px-4 rounded-lg font-medium transition-all',
                  'bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800',
                  'text-white shadow-lg hover:shadow-xl',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-describedby="submit-help"
              >
                {loading ? 'Please wait...' : isSignIn ? 'Sign in' : 'Create account'}
              </button>
              <div id="submit-help" className="sr-only">
                {isSignIn ? 'Sign in to access your dashboard' : 'Create your account to get started'}
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-tan-400 hover:text-tan-300 font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
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
    </div>
    </>
  );
}