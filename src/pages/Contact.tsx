import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { trackFormSubmission, trackEvent } from '../components/Analytics';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  CheckCircle,
  User,
  Building,
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  Shield,
  UserCheck,
  Timer,
  Eye,
  PoundSterling,
  Zap,
  BarChart3,
  Brain,
  Activity,
  Star
} from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    projectType: 'growth-strategy',
    budget: '8k-20k',
    timeline: '1-3-months',
    message: '',
    currentChallenges: []
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    trackFormSubmission('contact_form', {
      project_type: formData.projectType,
      budget: formData.budget,
      timeline: formData.timeline,
      company: formData.company
    });
    
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      
      trackEvent('contact_form_completed', {
        form_type: 'contact',
        project_type: formData.projectType
      });
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleChallengeToggle = (challenge: string) => {
    setFormData({
      ...formData,
      currentChallenges: formData.currentChallenges.includes(challenge)
        ? formData.currentChallenges.filter(c => c !== challenge)
        : [...formData.currentChallenges, challenge]
    });
  };

  const challenges = [
    'Lead generation not meeting targets',
    'High customer acquisition costs', 
    'Low conversion rates',
    'Unclear marketing ROI',
    'Ineffective content strategy',
    'Poor brand positioning',
    'Limited marketing team expertise',
    'Competitive pressure'
  ];

  const services = [
    {
      icon: Brain,
      title: "AI Market Analysis",
      description: "Comprehensive market intelligence and competitive analysis powered by advanced AI algorithms",
      metric: "80% faster insights"
    },
    {
      icon: TrendingUp,
      title: "Growth Strategy",
      description: "Data-driven growth strategies with clear metrics and performance tracking for measurable results",
      metric: "3.2x average ROI"
    },
    {
      icon: Target,
      title: "Strategic Consulting",
      description: "Expert marketing guidance with transparent processes and direct access to senior-level expertise",
      metric: "Direct expert access"
    }
  ];

  const valueProps = [
    {
      icon: UserCheck,
      title: "Direct Expert Access",
      description: "Work directly with senior marketing strategists – no junior staff or account managers"
    },
    {
      icon: Shield,
      title: "Transparent Pricing",
      description: "Clear, upfront pricing with no hidden fees or surprise charges"
    },
    {
      icon: Timer,
      title: "Rapid Implementation",
      description: "See results in weeks, not months, with our proven sprint-based methodology"
    },
    {
      icon: BarChart3,
      title: "Data-Driven Results",
      description: "Every recommendation backed by real market data and competitive intelligence"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP Marketing",
      company: "TechFlow SaaS",
      content: "cmoxpert transformed our market research process. We now identify opportunities 80% faster and our strategic decisions are backed by real-time data.",
      rating: 5,
      avatar: "SC",
      metric: "80% faster insights"
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Growth",
      company: "DataSync Pro",
      content: "The competitive intelligence alone has prevented multiple pricing mistakes. The ROI was immediate and continues to compound.",
      rating: 5,
      avatar: "MR",
      metric: "3.2x ROI increase"
    },
    {
      name: "Jennifer Park",
      role: "CMO",
      company: "CloudScale Systems",
      content: "Finally, a platform that thinks strategically. It's like having a senior marketing consultant available 24/7 with perfect data recall.",
      rating: 5,
      avatar: "JP",
      metric: "24/7 availability"
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-cornsilk-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center border border-cream-200">
          <div className="w-16 h-16 bg-slate_blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-slate_blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Thank You!</h2>
          <p className="text-charcoal-600 mb-6 leading-relaxed">
            Your inquiry has been received. I'll personally review your requirements and get back to you within 24 hours to discuss how we can accelerate your marketing results.
          </p>
          <Link 
            to="/"
            className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cornsilk-50">
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-charcoal-900 text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-cream-200" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3">
              <BrandLogo />
              <div>
                <h1 className="text-xl font-bold text-charcoal-900">cmoxpert</h1>
                <p className="text-xs text-slate_blue-600">AI Marketing Co-Pilot</p>
              </div>
            </Link>
            
            <nav className="flex items-center space-x-6" role="navigation" aria-label="Header navigation">
              <Link 
                to="/" 
                className="text-charcoal-600 hover:text-charcoal-900 font-medium flex items-center space-x-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" tabIndex={-1}>
        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-white" aria-labelledby="contact-hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 id="contact-hero-heading" className="text-5xl font-bold text-charcoal-900 mb-6 leading-tight">
                Get Strategic Marketing Intelligence
                <span className="block text-slate_blue-600">That Drives Results</span>
              </h1>
              <p className="text-xl text-charcoal-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                Partner with AI-powered marketing intelligence designed for B2B SaaS companies. Get the strategic insights you need to outmaneuver competitors and accelerate growth.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-charcoal-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-slate_blue-600" />
                  <span>Free strategy consultation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-slate_blue-600" />
                  <span>Custom demo available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-slate_blue-600" />
                  <span>Results in 24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section className="py-16 bg-cornsilk-50" aria-labelledby="value-props-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="value-props-heading" className="text-3xl font-bold text-charcoal-900 text-center mb-12">
              Why Marketing Teams Choose cmoxpert
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valueProps.map((prop, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-cream-200 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <prop.icon className="w-6 h-6 text-slate_blue-700" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-900 mb-3">{prop.title}</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services & Contact Form */}
        <section className="py-20 bg-white" aria-labelledby="contact-form-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Services Overview */}
              <div className="space-y-8">
                <div>
                  <h2 id="contact-form-heading" className="text-3xl font-bold text-charcoal-900 mb-6">
                    How We Accelerate Your Growth
                  </h2>
                  <p className="text-lg text-charcoal-600 leading-relaxed">
                    Our AI-powered platform combines advanced market intelligence with strategic expertise to deliver actionable insights that drive measurable results.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {services.map((service, index) => (
                    <div key={index} className="bg-cornsilk-50 rounded-xl p-6 border border-cream-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <service.icon className="w-6 h-6 text-slate_blue-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-charcoal-900">{service.title}</h3>
                            <span className="text-xs font-medium text-slate_blue-700 bg-slate_blue-50 px-2 py-1 rounded-full">
                              {service.metric}
                            </span>
                          </div>
                          <p className="text-charcoal-600 leading-relaxed">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Results Preview */}
                <div className="bg-gradient-to-br from-slate_blue-50 to-charcoal-50 rounded-xl p-6 border border-slate_blue-100">
                  <h3 className="text-lg font-bold text-charcoal-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-slate_blue-600" />
                    Typical Engagement Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate_blue-700">3.2x</div>
                      <div className="text-sm text-charcoal-600">ROI Improvement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate_blue-700">80%</div>
                      <div className="text-sm text-charcoal-600">Time Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate_blue-700">65%</div>
                      <div className="text-sm text-charcoal-600">Conversion Increase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate_blue-700">24h</div>
                      <div className="text-sm text-charcoal-600">Response Time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-2xl border border-cream-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal-900 mb-3">Request Your Strategy Demo</h2>
                  <p className="text-charcoal-600">
                    Get a personalized demo showing how cmoxpert can accelerate your marketing results with AI-powered insights.
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Contact form">
                  <fieldset>
                    <legend className="sr-only">Contact Information</legend>
                    
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                          Full Name <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                            placeholder="John Smith"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                          Work Email <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                            placeholder="john@company.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                          Company Name <span className="text-red-500" aria-label="required">*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                            placeholder="Acme SaaS Ltd"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                            placeholder="+44 20 7123 4567"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                        Company Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="sr-only">Project Details</legend>
                    
                    {/* Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                          Service Type
                        </label>
                        <select
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                        >
                          <option value="growth-strategy">Growth Strategy</option>
                          <option value="market-analysis">Market Analysis</option>
                          <option value="competitive-intelligence">Competitive Intelligence</option>
                          <option value="platform-demo">Platform Demo</option>
                          <option value="consulting">Strategic Consulting</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                          Budget Range
                        </label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <select
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                          >
                            <option value="5k-10k">£5K - £10K</option>
                            <option value="10k-25k">£10K - £25K</option>
                            <option value="25k-50k">£25K - £50K</option>
                            <option value="50k+">£50K+</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                          Timeline
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                          <select
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                          >
                            <option value="immediate">Start immediately</option>
                            <option value="1-month">Within 1 month</option>
                            <option value="1-3-months">1-3 months</option>
                            <option value="planning">Just exploring</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* Current Challenges */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-charcoal-700 mb-3">
                      Current Marketing Challenges (select all that apply)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {challenges.map((challenge) => (
                        <label key={challenge} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-cornsilk-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.currentChallenges.includes(challenge)}
                            onChange={() => handleChallengeToggle(challenge)}
                            className="w-4 h-4 text-slate_blue-600 border-cream-300 rounded focus:ring-slate_blue-500"
                          />
                          <span className="text-sm text-charcoal-700">{challenge}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                      Tell us about your goals and current situation
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-charcoal-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-slate_blue-500 transition-all"
                        placeholder="Describe your current marketing challenges, goals, and what success looks like for your business. We'll provide specific recommendations tailored to your situation."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Request...</span>
                      </div>
                    ) : (
                      'Request Strategy Demo'
                    )}
                  </button>

                  <p className="text-xs text-charcoal-500 text-center mt-4 leading-relaxed">
                    We'll review your information and respond within 24 hours with a personalized demo and strategic recommendations for your specific situation.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-cornsilk-50" aria-labelledby="trust-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="trust-heading" className="text-3xl font-bold text-charcoal-900 text-center mb-12">
              Trusted by Leading B2B SaaS Companies
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-cream-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-tan-500 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-charcoal-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-500 to-charcoal-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-charcoal-900">{testimonial.name}</div>
                        <div className="text-sm text-charcoal-600">{testimonial.role}</div>
                        <div className="text-xs text-charcoal-500">{testimonial.company}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate_blue-700">{testimonial.metric}</div>
                      <div className="text-xs text-charcoal-500">achieved</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal-900 text-white py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <BrandLogo variant="text-only" />
              </div>
              <p className="text-charcoal-400 text-sm leading-relaxed">
                AI-powered marketing intelligence platform designed for B2B SaaS companies ready to outmaneuver competitors and accelerate growth.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <nav role="navigation" aria-label="Platform links">
                <ul className="space-y-3 text-sm text-charcoal-400">
                  <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                  <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
                </ul>
              </nav>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <nav role="navigation" aria-label="Resource links">
                <ul className="space-y-3 text-sm text-charcoal-400">
                  <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link to="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
                  <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                </ul>
              </nav>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <nav role="navigation" aria-label="Company links">
                <ul className="space-y-3 text-sm text-charcoal-400">
                  <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </nav>
            </div>
          </div>
          
          <div className="border-t border-charcoal-800 pt-8 text-center">
            <p className="text-sm text-charcoal-400">
              &copy; 2025 cmoxpert. All rights reserved. Built for B2B SaaS marketing teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}