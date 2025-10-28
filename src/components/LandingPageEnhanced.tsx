import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackVideoPlay, trackEvent } from './Analytics';
import { BrandLogo } from './BrandLogo';
import {
  Compass, TrendingUp, Zap, Target, Eye, Search, ArrowRight, Play, CheckCircle, Star,
  Clock, BarChart3, Users, Globe, LogIn, UserCheck, Shield, Lightbulb, Timer, Rocket,
  MapPin, Layers, Gauge, Award, Calendar, Building, Briefcase, DollarSign, Code,
  Megaphone, FileText, BookOpen, Cpu, Database, Cloud, ShoppingCart, AlertCircle,
  Brain, Activity, Sparkles, ChevronRight, Monitor, Smartphone, Tablet, Check
} from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  views_count: number;
}

export function LandingPageEnhanced() {
  const [email, setEmail] = useState('');
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFeaturedVideo();
  }, []);

  const loadFeaturedVideo = async () => {
    try {
      const { isSupabaseConfigured } = await import('../lib/supabase');

      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, skipping featured video load');
        return;
      }

      const { supabase } = await import('../lib/supabase');

      if (!supabase) {
        console.log('Supabase client not available, skipping featured video load');
        return;
      }

      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setFeaturedVideo(data[0]);
      }
    } catch (error) {
      console.log('Could not load featured video (this is normal in development)');
    }
  };

  const trackVideoView = async (videoId: string) => {
    try {
      await supabase
        .from('video_views')
        .insert([{
          video_id: videoId,
          ip_address: 'anonymous',
          user_agent: navigator.userAgent
        }]);
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
  };

  const handleVideoPlay = () => {
    if (featuredVideo) {
      trackVideoView(featuredVideo.id);
      trackVideoPlay(featuredVideo.title, featuredVideo.id);
    }
  };

  const handleGetStarted = () => {
    trackEvent('cta_click', {
      cta_location: 'hero',
      cta_text: 'Request Demo'
    });
    navigate('/auth');
  };

  const handleLearnMore = () => {
    trackEvent('cta_click', {
      cta_location: 'hero',
      cta_text: 'Learn More'
    });
    const featuresSection = document.getElementById('features');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const trackFormSubmission = (formType: string, data: any) => {
    trackEvent('form_submission', {
      form_type: formType,
      ...data
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackFormSubmission('newsletter_signup', { email });
    navigate('/auth');
  };

  const capabilities = [
    {
      icon: DollarSign,
      title: "CAC Attribution",
      description: "Track every dollar from ad click to revenue. See which channels drive profitable customers, not just sign-ups.",
      metric: "$127 avg reduction",
      color: "from-slate_blue-500 to-slate_blue-600"
    },
    {
      icon: Shield,
      title: "Fraud Impact Analysis",
      description: "Identify which marketing sources drive fraudulent accounts. Stop wasting budget on users who'll never convert.",
      metric: "34% budget saved",
      color: "from-charcoal-500 to-charcoal-600"
    },
    {
      icon: Target,
      title: "Activation Funnel",
      description: "Pinpoint exactly where users drop off between sign-up and first transaction. Fix the leaks draining your budget.",
      metric: "22% more activations",
      color: "from-tan-500 to-tan-600"
    },
    {
      icon: AlertCircle,
      title: "Compliance Monitoring",
      description: "Automated flagging of risky marketing campaigns before they violate FCA, SEC, or FINRA regulations.",
      metric: "Zero violations",
      color: "from-olive-500 to-olive-600"
    }
  ];

  const metrics = [
    { value: "$127", label: "Average CAC Reduction", sublabel: "In first 90 days" },
    { value: "34%", label: "Wasted on Fraud", sublabel: "Before optimization" },
    { value: "22%", label: "Lost to Drop-Off", sublabel: "At verification" },
    { value: "27", label: "FinTech Companies", sublabel: "Trust our platform" }
  ];

  const features = [
    {
      icon: DollarSign,
      title: "True Revenue Attribution",
      description: "Connect every marketing dollar to actual revenue. Not vanity metrics like sign-ups. Real money from real transactions.",
      benefits: ["LTV:CAC ratio by channel", "Payback period tracking", "Cohort profitability analysis"]
    },
    {
      icon: Shield,
      title: "Fraud Tax Calculator",
      description: "See exactly how much you're wasting on fraudulent sign-ups by source. Then automatically reallocate budget to clean channels.",
      benefits: ["Fraud rate by campaign", "Cost per verified user", "Source quality scoring"]
    },
    {
      icon: Target,
      title: "Activation Surgery",
      description: "We map your entire onboarding funnel from account creation to first transaction. Then show you the exact drop-off points bleeding users.",
      benefits: ["Verification friction analysis", "Funding conversion rates", "Time-to-first-transaction"]
    },
    {
      icon: AlertCircle,
      title: "Regulatory Risk Flagging",
      description: "Automated compliance checks for FCA, SEC, FINRA before campaigns launch. Because regulatory fines cost more than any CAC.",
      benefits: ["Multi-jurisdiction compliance", "Creative approval workflows", "Historical violation tracking"]
    },
    {
      icon: Globe,
      title: "Competitor Intelligence",
      description: "Track when competitors raise funding, launch products, or change pricing. Your competitors' moves impact your CAC immediately.",
      benefits: ["Funding announcements", "Feature launches", "Pricing strategy shifts"]
    },
    {
      icon: TrendingUp,
      title: "Channel Mix Optimizer",
      description: "We analyze 90 days of performance and tell you exactly where to move budget for maximum LTV:CAC improvement.",
      benefits: ["Budget reallocation models", "Channel saturation analysis", "Marginal CAC by spend level"]
    }
  ];

  const testimonials = [
    {
      name: "James Patterson",
      role: "CMO",
      company: "NeoBank UK",
      content: "We were spending £42K monthly on comparison site leads. cmoxpert showed us 38% were failing KYC. We cut those sources and CAC dropped from £287 to £178 in 6 weeks.",
      rating: 5,
      avatar: "JP",
      metric: "£109 CAC reduction"
    },
    {
      name: "Priya Sharma",
      role: "Head of Growth",
      company: "PayFlow",
      content: "The activation funnel analysis was brutal. 31% of users were dropping at bank verification. We A/B tested Plaid vs manual entry. Activations up 23%, CAC down $94.",
      rating: 5,
      avatar: "PS",
      metric: "$94 CAC saved"
    },
    {
      name: "Marcus Chen",
      role: "VP Marketing",
      company: "WealthTech Pro",
      content: "Before cmoxpert, we were optimizing for account opens. Useless metric. Now we optimize for first investment. LTV:CAC went from 2.1:1 to 4.7:1. Game changer.",
      rating: 5,
      avatar: "MC",
      metric: "4.7:1 LTV:CAC"
    }
  ];

  return (
    <div className="min-h-screen bg-cornsilk-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <BrandLogo theme="light" size="md" variant="text-only" />

            <nav className="flex items-center space-x-6" role="navigation" aria-label="Header navigation">
              <Link
                to="/auth"
                className="text-gray-700 hover:text-gray-900 font-medium flex items-center space-x-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <button
                onClick={handleGetStarted}
                className="btn-primary"
              >
                <span>Request Demo</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" tabIndex={-1}>
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-gradient-to-br from-slate_blue-600/5 via-charcoal-600/5 to-tan-600/5 pointer-events-none"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-slate_blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-tan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-slate_blue-50 border border-slate_blue-200 rounded-full px-6 py-3 text-sm font-semibold text-slate_blue-700 shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>Built for FinTech Marketing Leaders</span>
              </div>

              <h1 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight max-w-5xl mx-auto">
                Your Customer Acquisition Cost Is
                <span className="block mt-2 gradient-text">Probably 40% Too High</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-normal">
                FinTech CMOs: Stop bleeding money on fraud, verification drop-off, and the wrong channels. We help you cut CAC from $287 to $164 in 90 days.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary text-lg px-12 py-5"
                >
                  <span>Request a Demo</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <button
                  onClick={handleLearnMore}
                  className="btn-secondary text-lg px-12 py-5"
                >
                  <span>Learn More</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">Free strategy session</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">Results in 24 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">No long-term contracts</span>
                </div>
              </div>
            </div>

            <div className="mt-20 max-w-5xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="glass-card rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-600 to-charcoal-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl">FinTech CAC Dashboard</h3>
                      <p className="text-sm text-gray-600">Real-time attribution</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-green-700">LIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-slate_blue-50 to-slate_blue-100 rounded-2xl p-6 border border-slate_blue-200 card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-slate_blue-700 uppercase tracking-wide">Fraud Waste</span>
                      <div className="w-10 h-10 bg-slate_blue-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-1">$47K</div>
                    <div className="text-sm font-semibold text-red-600">Wasted on fraud this month</div>
                  </div>

                  <div className="bg-gradient-to-br from-tan-50 to-tan-100 rounded-2xl p-6 border border-tan-200 card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-tan-700 uppercase tracking-wide">Drop-Off Cost</span>
                      <div className="w-10 h-10 bg-tan-600 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-1">67%</div>
                    <div className="text-sm font-semibold text-orange-600">Lost at verification</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">CAC Trend</span>
                    <span className="text-sm font-medium text-gray-600">Last 90 days</span>
                  </div>

                  <div className="h-32 relative">
                    <svg className="w-full h-full" viewBox="0 0 320 128">
                      <defs>
                        <linearGradient id="growth-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22333B" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#22333B" stopOpacity="0.05"/>
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,90 Q80,60 160,40 Q240,20 320,10"
                        stroke="url(#growth-gradient-line)"
                        strokeWidth="3"
                        fill="none"
                      />
                      <linearGradient id="growth-gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22333B"/>
                        <stop offset="100%" stopColor="#0A0908"/>
                      </linearGradient>
                      <path
                        d="M0,90 Q80,60 160,40 Q240,20 320,10"
                        stroke="url(#growth-gradient-line)"
                        strokeWidth="3"
                        fill="none"
                      />
                      <path
                        d="M0,90 Q80,60 160,40 Q240,20 320,10 L320,128 L0,128 Z"
                        fill="url(#growth-gradient)"
                      />
                      <circle cx="80" cy="60" r="4" fill="#22333B" className="animate-pulse"/>
                      <circle cx="160" cy="40" r="4" fill="#557387" className="animate-pulse" style={{animationDelay: '0.2s'}}/>
                      <circle cx="240" cy="20" r="4" fill="#C6AC8F" className="animate-pulse" style={{animationDelay: '0.4s'}}/>
                      <circle cx="320" cy="10" r="5" fill="#5E503F" className="animate-pulse" style={{animationDelay: '0.6s'}}/>
                    </svg>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex space-x-8 text-sm text-gray-500 font-medium">
                      <span>Q1</span>
                      <span>Q2</span>
                      <span>Q3</span>
                      <span>Q4</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black gradient-text">-42%</div>
                      <div className="text-xs font-semibold text-gray-600">CAC reduction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{metric.value}</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">{metric.label}</div>
                  <div className="text-sm text-gray-600">{metric.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-cream-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Stop Guessing. <span className="gradient-text">Start Knowing.</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every feature built to answer one question: Why is your CAC so damn high?
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-8 card-hover animate-fade-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-slate_blue-600 to-charcoal-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Real FinTech CMOs. <span className="gradient-text">Real Numbers.</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                No fluff. Just specific CAC reductions from companies like yours.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-8 card-hover animate-fade-in"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.content}</p>
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-600 to-charcoal-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm font-semibold text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>{testimonial.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-br from-slate_blue-600 to-charcoal-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Here's What Happens Next
              </h2>
              <p className="text-xl text-slate_blue-100 mb-10 max-w-2xl mx-auto">
                Book a 30-minute call. We'll audit your current CAC and show you exactly where you're bleeding money. If we can't find at least 15% savings, we'll tell you straight.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="bg-white text-slate_blue-600 px-12 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLearnMore}
                  className="bg-white/10 backdrop-blur-sm text-white px-12 py-5 rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <BrandLogo theme="dark" size="md" variant="text-only" />
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 cmoxpert. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
