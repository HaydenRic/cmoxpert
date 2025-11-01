import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import {
  ArrowRight, CheckCircle, Rocket, Shield, Users, Calendar,
  MessageSquare, AlertCircle, Star, TrendingUp, Eye, Target,
  Award, Clock, Lightbulb, Code, Building, FileText, Zap,
  Activity, BarChart3, Bell, Lock, ChevronRight, ExternalLink
} from 'lucide-react';

export function EarlyAccessLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleEarlyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    navigate('/auth?earlyAccess=true');
  };

  const handleBookDemo = () => {
    navigate('/contact?demo=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BrandLogo />
            <div className="flex items-center gap-6">
              <Link to="/auth" className="text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <button
                onClick={handleBookDemo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Book Demo
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Early Access Badge */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">
              <Rocket className="w-4 h-4" />
              Early Access Program • Limited Spots Available
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Stop Guessing Where Your<br />
            <span className="text-blue-600">Marketing Budget Goes</span>
          </h1>
          <p className="text-xl text-slate-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Join CMOxpert's exclusive early access program—the first marketing intelligence platform
            built specifically for FinTech CMOs who need to know exactly which channels drive revenue,
            which lose money to fraud, and how to stay compliant while scaling.
          </p>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
            We're in early access. Yes, there are bugs. But you'll work directly with our founding
            team to shape a product that solves real problems—not vanity metrics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleBookDemo}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Book Your Live Demo
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/auth?earlyAccess=true')}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              Join Private Beta
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Bank-grade security
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Limited to 50 founding users
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              Launch Q2 2025
            </div>
          </div>
        </div>
      </section>

      {/* What's Available Now */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What You Get Right Now</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These features are live and ready to use. They're not perfect, but they work—and
              we're improving them daily based on your feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Revenue Attribution</h3>
              <p className="text-slate-600 mb-4">
                Track which marketing channels actually drive deposits, transactions, and LTV—not just signups.
              </p>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Live & Working
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fraud Tax Calculator</h3>
              <p className="text-slate-600 mb-4">
                See exactly how much of your marketing budget goes to fraudulent accounts that never transact.
              </p>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Live & Working
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Compliance Checker</h3>
              <p className="text-slate-600 mb-4">
                Automated pre-launch checks for FCA, SEC, and FINRA regulations to avoid costly violations.
              </p>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Live & Working
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Activation Funnel</h3>
              <p className="text-slate-600 mb-4">
                Identify where users drop off during KYC/verification and calculate the real cost of friction.
              </p>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Live & Working
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-200">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Competitive Intelligence</h3>
              <p className="text-slate-600 mb-4">
                Monitor competitors' messaging, offers, and channel strategy with automated weekly reports.
              </p>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Live & Working
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-200">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Dashboard & Reporting</h3>
              <p className="text-slate-600 mb-4">
                Real-time dashboards showing CAC, LTV, fraud rates, and compliance status across all channels.
              </p>
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Live & Working
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What's Coming Next</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Here's what we're building based on feedback from early partners. Your input will
              directly shape these priorities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-white rounded-xl border border-slate-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Predictive LTV Modeling</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Q1 2025</span>
                  </div>
                  <p className="text-slate-600">
                    AI-powered predictions of which marketing sources will drive highest lifetime value
                    based on early behavior signals.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Budget Optimizer</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Q1 2025</span>
                  </div>
                  <p className="text-slate-600">
                    Automated recommendations for reallocating spend away from fraud-heavy channels
                    to high-converting ones.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Multi-Brand Management</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">Q2 2025</span>
                  </div>
                  <p className="text-slate-600">
                    Manage multiple FinTech brands, compare performance, and benchmark against
                    industry standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">API & Integrations</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Q2 2025</span>
                  </div>
                  <p className="text-slate-600">
                    Direct API access and native integrations with your existing data warehouse,
                    CRM, and analytics stack.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <Lightbulb className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">You Shape the Roadmap</h3>
            <p className="text-slate-600 mb-4">
              As a founding user, you'll have direct influence over which features we build next.
              Your feedback isn't just heard—it's acted on.
            </p>
          </div>
        </div>
      </section>

      {/* Founding User Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-medium text-yellow-700 mb-4">
              <Award className="w-4 h-4" />
              Exclusive Founding User Benefits
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Join Early?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Being a founding user isn't just about early access—it's about building something
              together and getting rewarded for taking the risk with us.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-white rounded-xl border border-yellow-200">
              <Star className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Locked-In Pricing</h3>
              <p className="text-slate-600">
                Your early access rate is guaranteed for 2 years, even when we raise prices at launch.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Priority Support</h3>
              <p className="text-slate-600">
                Direct Slack channel with our founding team. No support tickets, no waiting—just real conversations.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200">
              <Lightbulb className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Product Influence</h3>
              <p className="text-slate-600">
                Monthly strategy calls to shape our roadmap. Your feature requests go to the front of the line.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200">
              <FileText className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Early Feature Access</h3>
              <p className="text-slate-600">
                Test new features before anyone else and give feedback that shapes the final product.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-200">
              <Award className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Founding User Badge</h3>
              <p className="text-slate-600">
                Recognition on our website and in our community as a founding partner who helped build CMOxpert.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-200">
              <Clock className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Extended Free Trial</h3>
              <p className="text-slate-600">
                60-day free trial (vs. 14 days at launch) to really test if CMOxpert works for your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built by a FinTech Marketing Leader</h2>
            <p className="text-xl text-slate-300">
              Not by developers who Googled "FinTech marketing"—by someone who lived it.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                CM
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Chris Martin, Founder</h3>
                <p className="text-slate-300 mb-4">
                  Former CMO at three FinTech startups. I've burned millions on fraudulent signups,
                  watched CAC balloon while LTV stayed flat, and been fined for non-compliant marketing
                  claims I didn't even know were problematic.
                </p>
                <p className="text-slate-300 mb-4">
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
                    href="https://www.linkedin.com/in/yourprofile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
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

      {/* Early Results (Placeholder) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Early Partner Results</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're still gathering data from our first users. Check back soon for real numbers and testimonials.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$127</div>
              <div className="text-slate-600">Average CAC reduction in first 90 days</div>
              <div className="text-sm text-slate-500 mt-2">(Pilot data • 3 companies)</div>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">34%</div>
              <div className="text-slate-600">Marketing budget wasted on fraud (average)</div>
              <div className="text-sm text-slate-500 mt-2">(Based on 5 pilot partners)</div>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">14hrs</div>
              <div className="text-slate-600">Saved per month on manual compliance checks</div>
              <div className="text-sm text-slate-500 mt-2">(Pilot data • 2 companies)</div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
            <MessageSquare className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Be Our Next Case Study</h3>
            <p className="text-slate-600 mb-4">
              Join now and you could be featured here in 90 days with real results from your campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* Bug Reporting / Feedback */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Yes, There Are Bugs</h2>
          <p className="text-xl text-slate-600 mb-6">
            We're not going to pretend this is a polished product. You'll find bugs, missing features,
            and things that don't work perfectly. That's the deal with early access.
          </p>
          <p className="text-lg text-slate-700 mb-8">
            But here's what you get in return: A founding team that actually fixes things fast, listens
            to your feedback, and treats you like a partner—not a user ID in a CRM.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-white rounded-xl border border-blue-200 text-left">
              <MessageSquare className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Report Bugs Instantly</h3>
              <p className="text-slate-600 mb-4">
                In-app bug reporter with one-click screenshots. We'll see it immediately and respond within 24 hours.
              </p>
              <button className="text-blue-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Try the reporter
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl border border-blue-200 text-left">
              <Bell className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Feature Requests</h3>
              <p className="text-slate-600 mb-4">
                See something missing? Request it and vote on other users' ideas. Top requests get built first.
              </p>
              <button className="text-blue-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
                Submit request
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-700 italic">
              "We're not asking for forgiveness—we're asking for partnership. Help us build something
              great together, and we'll make it worth your while."
            </p>
            <p className="text-slate-500 mt-2">— The CMOxpert Team</p>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Security & Compliance First</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We handle FinTech marketing data—we take security as seriously as you do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 bg-slate-50 rounded-xl text-center">
              <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Bank-Grade Encryption</h3>
              <p className="text-sm text-slate-600">AES-256 encryption at rest and in transit</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">SOC 2 Compliance</h3>
              <p className="text-sm text-slate-600">Audit in progress, expected Q2 2025</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">GDPR Ready</h3>
              <p className="text-sm text-slate-600">Data residency, deletion, and export on demand</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl text-center">
              <Code className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Regular Pen Testing</h3>
              <p className="text-sm text-slate-600">Third-party security audits quarterly</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">FinTech Compliance Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-slate-900">FCA Compliance</span>
                </div>
                <p className="text-sm text-slate-600">
                  Automated checks for UK financial promotions, risk warnings, and fair presentation rules
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Live
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-slate-900">SEC Compliance</span>
                </div>
                <p className="text-sm text-slate-600">
                  Pre-launch review for US securities marketing, including Reg D and Reg A+ requirements
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Live
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-slate-900">FINRA Compliance</span>
                </div>
                <p className="text-sm text-slate-600">
                  Coming soon: Automated compliance for broker-dealer communications and advertising
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  Q1 2025
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">As Seen In</h2>
          <p className="text-slate-600 mb-12">
            We're working on it. Check back soon for press mentions and industry recognition.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-30">
            <div className="p-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">TechCrunch</span>
            </div>
            <div className="p-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">Forbes</span>
            </div>
            <div className="p-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">VentureBeat</span>
            </div>
            <div className="p-6 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">The Fintech Times</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Stop Guessing?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 50 FinTech marketing leaders who are building CMOxpert with us.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleBookDemo}
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Book Your Live Demo
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/auth?earlyAccess=true')}
              className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-400 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Join Private Beta
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              60-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <BrandLogo />
              <p className="mt-4 text-sm">
                Marketing intelligence built specifically for FinTech CMOs.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@cmoxpert.com" className="hover:text-white transition-colors">support@cmoxpert.com</a></li>
                <li><a href="mailto:security@cmoxpert.com" className="hover:text-white transition-colors">Report Security Issue</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 CMOxpert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
