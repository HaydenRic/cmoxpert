import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Users,
  Target,
  Clock,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  Award,
  DollarSign,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandLogo from '../components/BrandLogo';

export default function BetaLanding() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
    clientCount: '',
    heardFrom: ''
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
          role: formData.role,
          client_count: formData.clientCount,
          heard_from: formData.heardFrom
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
              You're on the list!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thanks for joining the beta program, {formData.name.split(' ')[0]}. We'll be in touch within 48 hours.
            </p>
            <div className="bg-earth_yellow-50 border border-earth_yellow-200 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-bold text-slate_blue-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-slate_blue-800">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>We'll review your application</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>You'll receive an invite email with login details</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Schedule an optional onboarding call</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Start managing your clients</span>
                </li>
              </ul>
            </div>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-slate_blue-600 hover:text-charcoal-900 font-medium transition-colors"
            >
              <span>Back to home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate_blue-900 via-slate_blue-800 to-charcoal-900">
      <header className="sticky top-0 z-50 bg-slate_blue-900/80 backdrop-blur-xl border-b border-slate_blue-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/">
              <BrandLogo theme="dark" size="md" variant="text-only" />
            </Link>
            <Link
              to="/auth"
              className="text-cornsilk-100 hover:text-earth_yellow-300 font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,172,143,0.15),transparent_50%)]"></div>

        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2 mb-6 animate-pulse">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Early Access Beta • Save 10-15 Hours/Week</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Stop Juggling<br />
                  <span className="bg-gradient-to-r from-earth_yellow-400 to-tan-400 bg-clip-text text-transparent">
                    Spreadsheets
                  </span><br />
                  For Every Client
                </h1>

                <p className="text-xl text-cornsilk-300 mb-8 leading-relaxed">
                  One dashboard to manage all your FinTech clients. Track performance, prove ROI, and generate professional reports without the manual busywork.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center space-x-2 text-cornsilk-200">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="font-medium">Save 10-15 hrs/week</span>
                  </div>
                  <div className="flex items-center space-x-2 text-cornsilk-200">
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="font-medium">First 10 users FREE</span>
                  </div>
                  <div className="flex items-center space-x-2 text-cornsilk-200">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="font-medium">Production ready</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Client Portfolio Management</div>
                      <div className="text-sm text-cornsilk-400">Production-ready</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Revenue Attribution</div>
                      <div className="text-sm text-cornsilk-400">6 models including ML</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Fraud Impact Analysis</div>
                      <div className="text-sm text-cornsilk-400">With your data</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Compliance Checking</div>
                      <div className="text-sm text-cornsilk-400">FCA, SEC, FINRA rules</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate_blue-800/50 border border-slate_blue-700 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Award className="w-6 h-6 text-earth_yellow-400" />
                    <span className="font-bold text-white text-lg">Beta Program Benefits</span>
                  </div>
                  <ul className="space-y-2 text-cornsilk-300">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span><strong>First 10 users:</strong> Free for 12 months + lifetime 50% discount</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span><strong>Next 40 users:</strong> £79/month (75% off standard pricing)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Direct feedback to founder, shape product direction</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Priority support and early access to new features</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Join the Beta Program
                    </h2>
                    <p className="text-gray-600">
                      Limited spots available for early access
                    </p>
                  </div>

                  {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@company.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Acme Consulting"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        id="role"
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select your role...</option>
                        <option value="fractional-cmo">Fractional CMO</option>
                        <option value="consultant">Marketing Consultant</option>
                        <option value="agency-owner">Agency Owner</option>
                        <option value="agency-team">Agency Team Member</option>
                        <option value="in-house">In-House Marketing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="clientCount" className="block text-sm font-medium text-gray-700 mb-1">
                        How many FinTech clients do you manage? *
                      </label>
                      <select
                        id="clientCount"
                        name="clientCount"
                        required
                        value={formData.clientCount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="0">None yet (starting out)</option>
                        <option value="1-2">1-2 clients</option>
                        <option value="3-5">3-5 clients</option>
                        <option value="6-10">6-10 clients</option>
                        <option value="11-25">11-25 clients</option>
                        <option value="25+">25+ clients</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="heardFrom" className="block text-sm font-medium text-gray-700 mb-1">
                        How did you hear about us?
                      </label>
                      <select
                        id="heardFrom"
                        name="heardFrom"
                        value={formData.heardFrom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter/X</option>
                        <option value="referral">Referral</option>
                        <option value="search">Google Search</option>
                        <option value="community">Community/Slack</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                    >
                      {status === 'loading' ? (
                        <span>Joining waitlist...</span>
                      ) : (
                        <>
                          <span>Join Beta Waitlist</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      By joining, you agree to our{' '}
                      <Link to="/terms" className="text-earth_yellow-700 hover:underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-earth_yellow-700 hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                </div>

                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 text-cornsilk-300 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Your data is secure and never shared</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 px-4 border-t border-slate_blue-700/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                What's Ready in Beta
              </h2>
              <p className="text-xl text-cornsilk-300 max-w-3xl mx-auto">
                Honest about what works today vs. what's coming soon
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate_blue-800/50 border border-green-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-white text-lg">Client Portfolio Management</h3>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">READY</span>
                </div>
                <p className="text-cornsilk-400 mb-3">
                  Multi-client dashboard, full-text search, health scores, contract tracking, meeting notes. Fully functional.
                </p>
              </div>

              <div className="bg-slate_blue-800/50 border border-green-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-white text-lg">Revenue Attribution</h3>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">READY</span>
                </div>
                <p className="text-cornsilk-400 mb-3">
                  6 attribution models including ML-based Shapley and Markov Chain. Deal tracking, pipeline analysis.
                </p>
              </div>

              <div className="bg-slate_blue-800/50 border border-green-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-white text-lg">Compliance Checking</h3>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">READY</span>
                </div>
                <p className="text-cornsilk-400 mb-3">
                  FCA, SEC, FINRA rule checking. Regex-based pattern matching with severity ratings and fix suggestions.
                </p>
              </div>

              <div className="bg-slate_blue-800/50 border border-green-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-white text-lg">Fraud Impact Analysis</h3>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">READY</span>
                </div>
                <p className="text-cornsilk-400 mb-3">
                  Channel-level fraud rates, clean vs. dirty CAC, fraud waste calculation. Bring your fraud data.
                </p>
              </div>

              <div className="bg-slate_blue-800/50 border border-earth_yellow-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-earth_yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-earth_yellow-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-white text-lg">AI-Assisted Playbooks</h3>
                  <span className="px-2 py-0.5 bg-earth_yellow-500/20 text-earth_yellow-400 text-xs font-bold rounded">BETA</span>
                </div>
                <p className="text-cornsilk-400 mb-3">
                  Templates work great today. AI generation available if you add OpenAI API key (optional).
                </p>
              </div>

              <div className="bg-slate_blue-800/50 border border-earth_yellow-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-earth_yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-earth_yellow-400" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-white text-lg">Data Integrations</h3>
                  <span className="px-2 py-0.5 bg-earth_yellow-500/20 text-earth_yellow-400 text-xs font-bold rounded">BETA</span>
                </div>
                <p className="text-cornsilk-400 mb-3">
                  OAuth flows working for Google Ads, Meta Ads. Basic sync implemented, being refined.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-tiger_s_eye-900/20 border border-earth_yellow-700/50 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-earth_yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-earth_yellow-300 text-lg mb-2">Coming in Q2 2025</h3>
                  <p className="text-cornsilk-200 mb-3">
                    We're actively building these features based on beta user feedback:
                  </p>
                  <ul className="text-cornsilk-200 space-y-1 text-sm">
                    <li>• Automated workflow execution</li>
                    <li>• Real-time fraud detection API integration</li>
                    <li>• Advanced competitive intelligence automation</li>
                    <li>• PDF/Excel report exports</li>
                    <li>• Scheduled reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 px-4 border-t border-slate_blue-700/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-earth_yellow-500/20 border border-earth_yellow-400/30 rounded-full px-4 py-2 mb-6">
              <DollarSign className="w-5 h-5 text-earth_yellow-400" />
              <span className="text-earth_yellow-300 font-semibold">Limited Beta Pricing</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6">
              Lock In Your Beta Rate
            </h2>
            <p className="text-xl text-cornsilk-300 mb-12 max-w-2xl mx-auto">
              Early access users get significant discounts. Pricing locked for 12 months minimum.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate_blue-800/50 border-2 border-earth_yellow-500/50 rounded-xl p-6 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-earth_yellow-500 to-earth_yellow-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    FOUNDING
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">FREE</div>
                <div className="text-cornsilk-400 mb-4">First 10 users only</div>
                <ul className="space-y-2 text-sm text-cornsilk-300 text-left">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>12 months free</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>50% lifetime discount</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Unlimited clients</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Weekly founder access</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate_blue-800/50 border border-slate_blue-700 rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">£79<span className="text-lg text-cornsilk-400">/mo</span></div>
                <div className="text-cornsilk-400 mb-4">Next 40 users</div>
                <ul className="space-y-2 text-sm text-cornsilk-300 text-left">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>75% discount</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Price locked 12 months</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Up to 10 clients</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate_blue-800/50 border border-slate_blue-700 rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">£159<span className="text-lg text-cornsilk-400">/mo</span></div>
                <div className="text-cornsilk-400 mb-4">Beta access</div>
                <ul className="space-y-2 text-sm text-cornsilk-300 text-left">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>50% discount</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Price locked 12 months</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Up to 10 clients</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Beta community</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-cornsilk-400 text-sm">
              Standard pricing after beta: Starting at £319/month. Beta users keep their rate.
            </p>
          </div>
        </section>

        <section className="relative py-20 px-4 border-t border-slate_blue-700/50 bg-charcoal-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Built by a FinTech Marketing Leader</h2>
              <p className="text-xl text-cream-200">
                Not by developers who Googled "FinTech marketing"—by someone who lived it.
              </p>
            </div>

            <div className="bg-charcoal-800 rounded-xl p-8 border border-slate_blue-700">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-slate_blue-600 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  HR
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Hayden Richards, Founder</h3>
                  <p className="text-cream-200 mb-4">
                    Former CMO at three FinTech startups. I've burned millions on fraudulent signups,
                    watched CAC balloon while LTV stayed flat, and been fined for non-compliant marketing
                    claims I didn't even know were problematic.
                  </p>
                  <p className="text-cream-200 mb-4">
                    CMOxpert exists because I got tired of flying blind. Every FinTech marketing dashboard
                    shows signups and clicks—but none showed me which channels drove actual deposits, which
                    ones just attracted fraudsters, or whether my latest campaign would get me in trouble
                    with the FCA.
                  </p>
                  <p className="text-slate-300">
                    I'm building the tool I wish I had. It's not perfect yet, but it's real, it's honest,
                    and it solves problems that matter. If that resonates, let's talk.
                  </p>
                  <div className="mt-6">
                    <a
                      href="https://www.linkedin.com/in/haydenrichards/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-slate_blue-400 hover:text-cream-100 transition-colors"
                    >
                      Connect on LinkedIn
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 px-4 border-t border-slate_blue-700/50 bg-slate_blue-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Early Partner Results</h2>
              <p className="text-xl text-cornsilk-300 max-w-3xl mx-auto">
                We're still gathering data from our first users. Check back soon for real numbers and testimonials.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate_blue-800/50 border border-slate_blue-700 rounded-xl text-center hover:border-green-500 transition-all">
                <Clock className="w-8 h-8 text-earth_yellow-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-earth_yellow-400 mb-2">10-15hrs</div>
                <div className="text-cornsilk-300">Saved per week on manual reporting</div>
                <div className="text-sm text-cornsilk-500 mt-2">(Early user feedback)</div>
              </div>

              <div className="p-6 bg-slate_blue-800/50 border border-slate_blue-700 rounded-xl text-center hover:border-green-500 transition-all">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-green-400 mb-2">6+</div>
                <div className="text-cornsilk-300">Attribution models including ML-based</div>
                <div className="text-sm text-cornsilk-500 mt-2">(Production ready today)</div>
              </div>

              <div className="p-6 bg-slate_blue-800/50 border border-slate_blue-700 rounded-xl text-center hover:border-green-500 transition-all">
                <Shield className="w-8 h-8 text-tan-400 mx-auto mb-3" />
                <div className="text-4xl font-bold text-tan-400 mb-2">FCA+SEC</div>
                <div className="text-cornsilk-300">Built-in compliance checking</div>
                <div className="text-sm text-cornsilk-500 mt-2">(FINRA rules included)</div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-slate_blue-800/50 border border-slate_blue-700 rounded-xl text-center">
              <MessageSquare className="w-8 h-8 text-earth_yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Be Our Next Case Study</h3>
              <p className="text-cornsilk-300 mb-4">
                Join now and you could be featured here in 90 days with real results from your campaigns.
              </p>
            </div>
          </div>
        </section>

        <section className="relative py-20 px-4 border-t border-slate_blue-700/50 bg-charcoal-800">
          <div className="max-w-4xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-earth_yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Yes, There Are Bugs</h2>
            <p className="text-xl text-cornsilk-300 mb-6">
              We're not going to pretend this is a polished product. You'll find bugs, missing features,
              and things that don't work perfectly. That's the deal with beta.
            </p>
            <p className="text-lg text-cornsilk-200 mb-8">
              But here's what you get in return: A founding team that actually fixes things fast, listens
              to your feedback, and treats you like a partner—not a user ID in a CRM.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-slate_blue-900/50 border border-slate_blue-700 rounded-xl text-left">
                <MessageSquare className="w-8 h-8 text-earth_yellow-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Report Bugs Instantly</h3>
                <p className="text-cornsilk-300 mb-4">
                  In-app bug reporter with one-click screenshots. We'll see it immediately and respond within 24 hours.
                </p>
              </div>

              <div className="p-6 bg-slate_blue-900/50 border border-slate_blue-700 rounded-xl text-left">
                <Bell className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Feature Requests</h3>
                <p className="text-cornsilk-300 mb-4">
                  See something missing? Request it and vote on other users' ideas. Top requests get built first.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate_blue-900/50 border border-slate_blue-700 rounded-xl">
              <p className="text-cornsilk-200 italic">
                "We're not asking for forgiveness—we're asking for partnership. Help us build something
                great together, and we'll make it worth your while."
              </p>
              <p className="text-cornsilk-400 mt-2">— The cmoxpert Team</p>
            </div>
          </div>
        </section>

        <section className="relative py-20 px-4 bg-gradient-to-br from-earth_yellow-600 to-tiger_s_eye-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join the Beta?
            </h2>
            <p className="text-xl text-cornsilk-100 mb-10 max-w-2xl mx-auto">
              Core features are production-ready. Help shape what comes next.
            </p>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-2 bg-white text-earth_yellow-700 px-12 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            >
              <span>Join Beta Waitlist</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-slate_blue-900 border-t border-slate_blue-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <BrandLogo theme="dark" size="md" variant="text-only" />
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-cornsilk-300 hover:text-cornsilk-100 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate_blue-600">•</span>
              <Link to="/terms" className="text-cornsilk-300 hover:text-cornsilk-100 transition-colors">
                Terms of Service
              </Link>
              <span className="text-slate_blue-600">•</span>
              <Link to="/contact" className="text-cornsilk-300 hover:text-cornsilk-100 transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-slate_blue-500 text-sm">
              © 2025 cmoxpert. Beta program - core features production-ready.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
