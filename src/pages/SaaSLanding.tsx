import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  PoundSterling,
  BarChart3,
  LineChart,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandLogo from '../components/BrandLogo';

export default function SaaSLanding() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    clientCount: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('beta_waitlist')
        .insert([{
          email: formData.email.toLowerCase().trim(),
          name: formData.name.trim(),
          company: formData.company.trim(),
          role: 'SaaS Consultant/Agency',
          client_count: formData.clientCount,
          heard_from: 'SaaS Landing Page'
        }]);

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('This email is already on the waitlist!');
        } else {
          setErrorMessage('Something went wrong. Please try again.');
        }
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch (err) {
      setErrorMessage('Network error. Please check your connection.');
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate_blue-900 via-slate_blue-800 to-charcoal-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to cmoxpert!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You're all set, {formData.name.split(' ')[0]}. Check your email for next steps.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-slate_blue-600 text-white rounded-xl font-semibold hover:bg-slate_blue-700 transition-colors"
            >
              Go to Login
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate_blue-900 via-slate_blue-800 to-charcoal-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-cream-100 transition-colors font-medium"
              >
                Sign In
              </Link>
              <a
                href="#beta-access"
                className="px-6 py-2 bg-earth_yellow-400 text-slate_blue-900 rounded-lg font-semibold hover:bg-earth_yellow-500 transition-colors"
              >
                Get Early Access
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Built for B2B SaaS Marketing Agencies & Consultants
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Manage All Your SaaS Clients<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-earth_yellow-400 to-tan-400">
              In One Dashboard
            </span>
          </h1>

          <p className="text-xl text-cream-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Track MRR, CAC, LTV, and churn across all your B2B SaaS clients.
            Stop jumping between payment platforms and spreadsheets.
            <strong className="text-white"> Get the full picture in seconds.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="#beta-access"
              className="px-8 py-4 bg-earth_yellow-400 text-slate_blue-900 rounded-xl font-bold text-lg hover:bg-earth_yellow-500 transition-colors inline-flex items-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
            <Link
              to="/demo"
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              View Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-cream-100 text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Managing Multiple SaaS Clients Is Painful
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">10+ Logins</h3>
              <p className="text-cream-100">
                Different payment platforms, Google Analytics, and CRMs for each client
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Manual Reporting</h3>
              <p className="text-cream-100">
                Spending 10+ hours/week copying metrics into spreadsheets
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Attribution</h3>
              <p className="text-cream-100">
                Can't prove which marketing channels drive MRR growth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            One Platform. All Your SaaS Clients.
          </h2>
          <p className="text-xl text-cream-100">
            See MRR, CAC, LTV, and churn for every client without switching tabs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-400/20">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <PoundSterling className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">SaaS Metrics Dashboard</h3>
            <p className="text-cream-100 mb-4">
              MRR, ARR, churn rate, LTV, and CAC across all clients. Updated in real-time from your payment platforms.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Automatic payment data sync (Stripe, PayPal, Paddle, Chargebee)</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Cohort analysis and retention tracking</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Compare clients against industry benchmarks</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl p-8 border border-green-400/20">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Marketing Attribution</h3>
            <p className="text-cream-100 mb-4">
              See exactly which channels drive trial signups and paid conversions for each client.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Multi-touch attribution models (first, last, linear, time-decay)</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Track trial-to-paid conversion by source</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Calculate CAC by channel automatically</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-400/20">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">MRR Forecasting</h3>
            <p className="text-cream-100 mb-4">
              AI-powered revenue predictions based on historical growth, churn, and expansion.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>3, 6, and 12-month MRR forecasts</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Scenario planning (what if churn improves 2%?)</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Confidence intervals and risk analysis</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-400/20">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Client Reporting</h3>
            <p className="text-cream-100 mb-4">
              Generate beautiful, branded reports for clients in seconds. Not hours.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>One-click report generation with AI summaries</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>White-label reports with your agency branding</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Share via link or schedule automatic delivery</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-cream-100">
            Pay based on how many SaaS clients you manage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">£199</span>
              <span className="text-cream-100">/month</span>
            </div>
            <p className="text-cream-100 mb-6">Perfect for solo consultants</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Up to 3 SaaS clients</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>All core features</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Payment platform integrations</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Email support</span>
              </li>
            </ul>
            <a
              href="#beta-access"
              className="block w-full py-3 bg-white/10 text-white text-center rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Start Free Trial
            </a>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border-2 border-blue-400/50 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">£399</span>
              <span className="text-cream-100">/month</span>
            </div>
            <p className="text-cream-100 mb-6">For growing agencies</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Up to 10 SaaS clients</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Everything in Starter</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>White-label reports</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Team collaboration</span>
              </li>
            </ul>
            <a
              href="#beta-access"
              className="block w-full py-3 bg-blue-500 text-white text-center rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Start Free Trial
            </a>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">Agency</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-white">£699</span>
              <span className="text-cream-100">/month</span>
            </div>
            <p className="text-cream-100 mb-6">For established agencies</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Up to 25 SaaS clients</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Everything in Professional</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start text-cream-100">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-400" />
                <span>API access</span>
              </li>
            </ul>
            <a
              href="#beta-access"
              className="block w-full py-3 bg-white/10 text-white text-center rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="beta-access" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-earth_yellow-400/20 to-tan-400/20 rounded-3xl p-12 border border-earth_yellow-400/30 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your 14-Day Free Trial
          </h2>
          <p className="text-xl text-cream-100 mb-8">
            Join agencies and consultants managing $100M+ in SaaS MRR
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cream-100/50 focus:outline-none focus:ring-2 focus:ring-earth_yellow-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Work Email"
                required
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cream-100/50 focus:outline-none focus:ring-2 focus:ring-earth_yellow-400"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Agency/Company Name"
                required
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cream-100/50 focus:outline-none focus:ring-2 focus:ring-earth_yellow-400"
              />
              <select
                name="clientCount"
                value={formData.clientCount}
                onChange={handleChange}
                required
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-earth_yellow-400"
              >
                <option value="">How many SaaS clients?</option>
                <option value="1-3">1-3 clients</option>
                <option value="4-10">4-10 clients</option>
                <option value="11-25">11-25 clients</option>
                <option value="25+">25+ clients</option>
              </select>
            </div>

            {errorMessage && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-earth_yellow-400 text-slate_blue-900 rounded-xl font-bold text-lg hover:bg-earth_yellow-500 transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Submitting...' : 'Start Free Trial'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>

            <p className="text-cream-100 text-sm mt-4">
              No credit card required. Cancel anytime.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-cream-100 text-sm mb-4 md:mb-0">
              © 2025 cmoxpert. Built for B2B SaaS agencies.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-cream-100 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-cream-100 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link to="/contact" className="text-cream-100 hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
