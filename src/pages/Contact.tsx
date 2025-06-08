import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  PoundSterling
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
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
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
      icon: Target,
      title: "Strategic Planning",
      description: "Comprehensive marketing strategy and roadmap development with transparent sprint-based delivery"
    },
    {
      icon: TrendingUp,
      title: "Growth Optimization",
      description: "Revenue growth acceleration and funnel optimization with documented processes and clear metrics"
    },
    {
      icon: Building,
      title: "Team Leadership",
      description: "Marketing team guidance and capability building with 'look over my shoulder' transparency"
    }
  ];

  const antiAgencyValue = [
    {
      icon: UserCheck,
      title: "Direct Expert Access",
      description: "You work directly with me – no junior staff, no account managers, no diluted communication"
    },
    {
      icon: Shield,
      title: "Radical Transparency",
      description: "Every decision documented, every process visible, complete pricing clarity upfront"
    },
    {
      icon: Timer,
      title: "Sprint-Based Delivery",
      description: "Focused 2-week engagements with specific deliverables and measurable outcomes"
    },
    {
      icon: Eye,
      title: "Process Visibility",
      description: "Watch me work through challenges with recorded sessions and live collaboration"
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cornsilk-50 via-cornsilk-100 to-cornsilk-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-pakistan_green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-pakistan_green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Thank You!</h2>
          <p className="text-slate-600 mb-6">
            Your inquiry has been received. I'll personally review your requirements and get back to you within 24 hours to discuss how we can accelerate your marketing results together.
          </p>
          <Link 
            to="/"
            className="bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 hover:from-dark_moss_green-700 hover:to-pakistan_green-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cornsilk-50 via-cornsilk-100 to-cornsilk-200">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <BrandLogo />
              <div>
                <h1 className="text-xl font-bold text-slate-900">cmoxpert</h1>
                <p className="text-xs text-slate-500">AI Marketing Co-Pilot</p>
              </div>
            </Link>
            
            <Link 
              to="/" 
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Skip the Agency Overhead.<br/>
              <span className="bg-gradient-to-r from-tiger_s_eye-600 to-earth_yellow-600 bg-clip-text text-transparent">Get Direct Expert Access.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Partner with a fractional CMO who combines 15+ years of strategic expertise with AI-powered insights. No junior staff, no hidden fees, no lengthy contracts – just transparent, results-driven marketing leadership.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-pakistan_green-500" />
                <span>Direct access guaranteed</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-pakistan_green-500" />
                <span>Sprint-based delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-pakistan_green-500" />
                <span>Radical transparency</span>
              </div>
            </div>
          </div>

          {/* Anti-Agency Benefits */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why Choose the Anti-Agency Approach?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {antiAgencyValue.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-earth_yellow-100 to-tiger_s_eye-100 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-earth_yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Services Overview */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">How I Help B2B SaaS Companies</h2>
              
              <div className="space-y-6 mb-8">
                {services.map((service, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-earth_yellow-100 to-tiger_s_eye-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon className="w-6 h-6 text-earth_yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
                      <p className="text-slate-600">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-earth_yellow-50 to-tiger_s_eye-50 rounded-xl p-6 border border-earth_yellow-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Typical Engagement Results</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-earth_yellow-600">3.2x</div>
                    <div className="text-slate-600">Average ROI improvement</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-earth_yellow-600">65%</div>
                    <div className="text-slate-600">Lead quality increase</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-earth_yellow-600">40%</div>
                    <div className="text-slate-600">Faster growth velocity</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-earth_yellow-600">90%</div>
                    <div className="text-slate-600">Client satisfaction rate</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-cornsilk-50 to-cornsilk-100 rounded-xl border border-cornsilk-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-dark_moss_green-600" />
                  Transparent Pricing Promise
                </h3>
                <p className="text-slate-700 text-sm">
                  Project-based pricing with clear deliverables. No hidden fees, no surprise charges. 
                  Sprint engagements start at £4K with specific outcomes defined upfront. 
                  You'll know exactly what you're getting and when you'll get it.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Let's Discuss Your Growth Goals</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                        placeholder="Acme SaaS Ltd"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                        placeholder="+44 20 7123 4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                    placeholder="https://yourcompany.co.uk"
                  />
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Engagement Type
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                    >
                      <option value="growth-strategy">Growth Strategy Sprint</option>
                      <option value="demand-generation">Demand Generation Sprint</option>
                      <option value="brand-positioning">Brand Positioning Sprint</option>
                      <option value="sprint-based">Sprint-based Project</option>
                      <option value="full-engagement">Full CMO Partnership</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Budget Range
                      <span className="text-xs text-pakistan_green-600 block">Transparent pricing</span>
                    </label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                      >
                        <option value="4k-8k">£4K - £8K (Sprint)</option>
                        <option value="8k-20k">£8K - £20K/month</option>
                        <option value="20k-40k">£20K - £40K/month</option>
                        <option value="40k+">£40K+/month</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Timeline
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                      >
                        <option value="immediate">Start immediately</option>
                        <option value="2-weeks">2-week sprint</option>
                        <option value="1-3-months">1-3 months</option>
                        <option value="planning">Just planning</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Current Challenges */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Current Marketing Challenges (select all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {challenges.map((challenge) => (
                      <label key={challenge} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.currentChallenges.includes(challenge)}
                          onChange={() => handleChallengeToggle(challenge)}
                          className="w-4 h-4 text-earth_yellow-600 border-slate-300 rounded focus:ring-earth_yellow-500"
                        />
                        <span className="text-sm text-slate-700">{challenge}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tell me about your goals and current situation
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                      placeholder="Describe your current marketing challenges, goals, and what success looks like for your business. I'll personally review your situation and provide specific recommendations."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-tiger_s_eye-600 to-earth_yellow-600 hover:from-tiger_s_eye-700 hover:to-earth_yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Schedule Direct Strategy Discussion'
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Direct access guaranteed. I personally review every inquiry and respond within 24 hours with specific recommendations for your situation.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}