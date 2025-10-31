import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Compass, Mail, Lock, AlertCircle, ArrowLeft, Play } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDemoMode = searchParams.get('demo') === 'true';

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoInProgress, setDemoInProgress] = useState(false);

  const { signIn, signUp } = useAuth();

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

      const { error: signInError } = await signIn(demoEmail, demoPassword);

      if (!signInError) {
        navigate('/fraud-analysis');
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
    setLoading(true);
    setError('');

    try {
      const result = isSignIn
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.error) {
        setError(result.error.message);
      } else if (!isSignIn && result.data?.user && !result.data.session) {
        // Handle case where email confirmation is required
        setError('Please check your email and click the confirmation link to complete registration.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent transition-all"
                      placeholder="you@company.com"
                      required
                      aria-describedby="email-help"
                      autoComplete="email"
                    />
                    <div id="email-help" className="sr-only">Enter your email address to sign in or create an account</div>
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
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                      aria-describedby="password-help"
                      autoComplete={isSignIn ? "current-password" : "new-password"}
                    />
                    <div id="password-help" className="sr-only">
                      {isSignIn ? 'Enter your password' : 'Create a secure password for your account'}
                    </div>
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
  );
}