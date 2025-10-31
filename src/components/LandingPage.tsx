import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { trackVideoPlay, trackEvent } from './Analytics';
import { BrandLogo } from './BrandLogo';
import { 
  Compass, 
  TrendingUp, 
  Zap, 
  Target, 
  Eye, 
  PoundSterling,
  Search,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Clock,
  BarChart3,
  Users,
  Globe,
  LogIn,
  UserCheck,
  Shield,
  Lightbulb,
  Timer,
  Rocket,
  MapPin,
  Layers,
  Gauge,
  Award,
  Calendar,
  Building,
  Briefcase,
  DollarSign,
  Code,
  Megaphone,
  FileText,
  BookOpen,
  Cpu,
  Database,
  Cloud,
  ShoppingCart,
  AlertCircle,
  Brain,
  Activity,
  Sparkles,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  views_count: number;
}

export function LandingPage() {
  const [email, setEmail] = useState('');
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFeaturedVideo();
  }, []);

  const loadFeaturedVideo = async () => {
    try {
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
      console.log('Could not load featured video:', error);
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

  // Core platform capabilities with data-driven focus
  const capabilities = [
    {
      icon: Brain,
      title: "AI Market Analysis",
      description: "Automated competitive intelligence and market opportunity identification",
      metric: "80% faster insights",
      color: "from-charcoal-500 to-slate_blue-600"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast market trends and demand patterns with machine learning",
      metric: "95% accuracy rate",
      color: "from-slate_blue-500 to-charcoal-600"
    },
    {
      icon: Target,
      title: "Strategic Positioning",
      description: "Data-driven positioning recommendations and messaging optimization",
      metric: "3.2x conversion lift",
      color: "from-tan-500 to-olive-600"
    },
    {
      icon: Eye,
      title: "Competitive Monitoring",
      description: "Real-time competitor tracking and market intelligence alerts",
      metric: "24/7 monitoring",
      color: "from-olive-500 to-tan-600"
    }
  ];

  // Key metrics and social proof
  const metrics = [
    { value: "150+", label: "B2B SaaS Companies", sublabel: "Trust our platform" },
    { value: "3.2x", label: "Average ROI Increase", sublabel: "Within 90 days" },
    { value: "80%", label: "Time Saved", sublabel: "On market research" },
    { value: "24/7", label: "Market Monitoring", sublabel: "Automated alerts" }
  ];

  // Feature grid with data visualization focus
  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Market Intelligence",
      description: "Monitor competitor moves, pricing changes, and market positioning with AI-powered alerts and comprehensive dashboards.",
      benefits: ["Automated competitor tracking", "Price monitoring alerts", "Market share analysis"]
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Transform raw market data into actionable strategic recommendations using advanced machine learning algorithms.",
      benefits: ["Predictive trend analysis", "Opportunity identification", "Risk assessment"]
    },
    {
      icon: Target,
      title: "Strategic Positioning",
      description: "Optimize your market position with data-driven messaging and competitive differentiation strategies.",
      benefits: ["Message optimization", "Positioning analysis", "Differentiation mapping"]
    },
    {
      icon: Rocket,
      title: "Growth Acceleration",
      description: "Implement proven growth strategies with clear metrics and performance tracking for measurable results.",
      benefits: ["Growth strategy development", "Performance tracking", "ROI optimization"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Centralize marketing intelligence and enable cross-functional collaboration with shared insights and reports.",
      benefits: ["Shared dashboards", "Team insights", "Collaborative planning"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance, ensuring your sensitive market data remains protected.",
      benefits: ["SOC 2 certified", "Data encryption", "Access controls"]
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-200" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <BrandLogo />
            
            <nav className="flex items-center space-x-6" role="navigation" aria-label="Header navigation">
              <Link 
                to="/auth" 
                className="text-charcoal-700 hover:text-charcoal-900 font-medium flex items-center space-x-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Request Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" tabIndex={-1}>
        {/* Hero Section */}
        <section className="pt-20 pb-32 bg-cream-100" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 id="hero-heading" className="text-6xl lg:text-7xl font-bold text-charcoal-900 leading-tight">
                    Transform Market Data Into
                    <span className="block text-slate_blue-600">Strategic Advantage</span>
                  </h1>
                  
                  <p className="text-2xl text-charcoal-600 leading-relaxed max-w-2xl font-medium">
                    The AI Marketing Co-Pilot for B2B SaaS teams who need to move faster and smarter than their competition.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <span>Request a Demo</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={handleLearnMore}
                    className="text-slate_blue-600 hover:text-slate_blue-700 px-10 py-5 rounded-xl font-semibold text-xl transition-all flex items-center justify-center space-x-2 hover:bg-slate_blue-50"
                  >
                    <span>Learn More</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-8 text-base text-charcoal-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-slate_blue-600" />
                    <span className="font-medium">Free strategy session</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-slate_blue-600" />
                    <span className="font-medium">Results in 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-slate_blue-600" />
                    <span className="font-medium">No long-term contracts</span>
                  </div>
                </div>
              </div>
              
              {/* Hero Visual - Strategic Intelligence Dashboard */}
              <div className="relative">
                {/* Main Dashboard Container */}
                <div className="bg-cream-100 rounded-3xl shadow-2xl border-2 border-cream-300 p-8 relative z-10 transform rotate-1">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-cream-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate_blue-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-charcoal-900 text-lg">Strategic Intelligence</h3>
                        <p className="text-sm text-charcoal-600">Live market analysis</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-charcoal-700">LIVE</span>
                    </div>
                  </div>
                  
                  {/* Strategic Metrics Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 border-2 border-slate_blue-100 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate_blue-700 uppercase tracking-wide">Competitive Edge</span>
                        <TrendingUp className="w-5 h-5 text-slate_blue-600" />
                      </div>
                      <div className="text-3xl font-black text-charcoal-900">+156%</div>
                      <div className="text-sm font-medium text-green-600">Market opportunity identified</div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border-2 border-charcoal-100 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-charcoal-700 uppercase tracking-wide">Intelligence Alerts</span>
                        <Eye className="w-5 h-5 text-charcoal-600" />
                      </div>
                      <div className="text-3xl font-black text-charcoal-900">12</div>
                      <div className="text-sm font-medium text-orange-600">Critical insights today</div>
                    </div>
                  </div>
                  
                  {/* Strategic Growth Visualization */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-cream-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-charcoal-900 uppercase tracking-wide">Strategic Growth</span>
                      <span className="text-sm font-medium text-charcoal-600">Last 90 days</span>
                    </div>
                    
                    {/* Enhanced SVG chart visualization */}
                    <div className="h-24 relative">
                      <svg className="w-full h-full" viewBox="0 0 320 96">
                        <defs>
                          <linearGradient id="strategicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#22333B" stopOpacity="0.4"/>
                            <stop offset="100%" stopColor="#22333B" stopOpacity="0.05"/>
                          </linearGradient>
                        </defs>
                        {/* Growth curve */}
                        <path
                          d="M0,70 Q80,50 160,30 Q240,15 320,10"
                          stroke="#22333B"
                          strokeWidth="3"
                          fill="none"
                        />
                        {/* Area fill */}
                        <path
                          d="M0,70 Q80,50 160,30 Q240,15 320,10 L320,96 L0,96 Z"
                          fill="url(#strategicGradient)"
                        />
                        {/* Data points */}
                        <circle cx="80" cy="50" r="4" fill="#22333B"/>
                        <circle cx="160" cy="30" r="4" fill="#22333B"/>
                        <circle cx="240" cy="15" r="4" fill="#22333B"/>
                        <circle cx="320" cy="10" r="5" fill="#22333B"/>
                      </svg>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-6 text-sm text-charcoal-500">
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>Q4</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-slate_blue-700">+340%</div>
                        <div className="text-xs font-medium text-charcoal-600">Strategic advantage</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Strategic Elements */}
                <div className="absolute -top-8 -right-8 w-20 h-20 bg-slate_blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-12">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-charcoal-900 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12">
                  <Zap className="w-8 h-8 text-cream-100" />
                </div>
                <div className="absolute top-1/2 -right-4 w-12 h-12 bg-cream-300 rounded-full flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-charcoal-700" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-16 bg-cornsilk-50 border-y border-cream-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-2">{metric.value}</div>
                  <div className="text-sm font-medium text-charcoal-700 mb-1">{metric.label}</div>
                  <div className="text-xs text-charcoal-500">{metric.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-charcoal-900 mb-4">
                AI-Powered Marketing Intelligence
              </h2>
              <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
                Transform raw market data into strategic insights with our advanced AI platform designed specifically for B2B SaaS marketing teams.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {capabilities.map((capability, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-xl p-8 shadow-lg border border-cream-200 hover:shadow-xl transition-all duration-300 h-full">
                    <div className={`w-14 h-14 bg-gradient-to-br ${capability.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <capability.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal-900 mb-3">{capability.title}</h3>
                    <p className="text-charcoal-600 mb-4 leading-relaxed">{capability.description}</p>
                    <div className="inline-flex items-center px-3 py-1 bg-slate_blue-50 text-slate_blue-700 rounded-full text-sm font-medium">
                      {capability.metric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-cornsilk-50" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-4xl font-bold text-charcoal-900 mb-4">
                Everything You Need for Strategic Marketing
              </h2>
              <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
                Comprehensive tools and insights to outmaneuver competitors and accelerate growth with data-driven decision making.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-cream-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-slate_blue-700" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 mb-3">{feature.title}</h3>
                  <p className="text-charcoal-600 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-charcoal-600">
                        <CheckCircle className="w-4 h-4 text-slate_blue-600 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Video Section */}
        {featuredVideo && (
          <section className="py-20 bg-white" aria-labelledby="demo-heading">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 id="demo-heading" className="text-4xl font-bold text-charcoal-900 mb-4">
                  See cmoxpert in Action
                </h2>
                <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
                  Watch how AI-powered market intelligence transforms strategic decision-making for B2B SaaS companies.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-2xl border border-cream-200 p-8">
                <div className="aspect-video bg-charcoal-900 rounded-xl overflow-hidden relative">
                  <video
                    src={featuredVideo.url}
                    controls
                    className="w-full h-full object-cover"
                    onPlay={handleVideoPlay}
                    poster="/api/placeholder/800/450"
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    <Eye className="w-3 h-3 inline mr-1" />
                    {featuredVideo.views_count} views
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-charcoal-900 mb-2">{featuredVideo.title}</h3>
                  {featuredVideo.description && (
                    <p className="text-charcoal-600">{featuredVideo.description}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Social Proof Section */}
        <section className="py-20 bg-cornsilk-50" aria-labelledby="testimonials-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="text-4xl font-bold text-charcoal-900 mb-4">
                Trusted by Marketing Leaders
              </h2>
              <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
                See how B2B SaaS companies are using cmoxpert to accelerate growth and outmaneuver competitors.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-cream-200 hover:shadow-xl transition-shadow duration-300">
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
                      <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-500 to-charcoal-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
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
                      <div className="text-xs text-charcoal-500">improvement</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Preview Section */}
        <section className="py-20 bg-white" aria-labelledby="platform-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="platform-heading" className="text-4xl font-bold text-charcoal-900 mb-4">
                Built for Modern Marketing Teams
              </h2>
              <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
                Intuitive interface designed for strategic thinking, not just data consumption. Access insights across all devices.
              </p>
            </div>

            {/* Device Mockups */}
            <div className="relative">
              <div className="grid lg:grid-cols-3 gap-8 items-end">
                {/* Desktop */}
                <div className="lg:col-span-2">
                  <div className="bg-charcoal-900 rounded-t-xl p-2">
                    <div className="bg-white rounded-lg p-6 min-h-[300px]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-charcoal-900">Competitive Analysis</h3>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate_blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate_blue-100 rounded-full flex items-center justify-center">
                              <Globe className="w-4 h-4 text-slate_blue-700" />
                            </div>
                            <div>
                              <div className="font-medium text-charcoal-900">Competitor A</div>
                              <div className="text-xs text-charcoal-500">competitor-a.com</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-charcoal-900">+23%</div>
                            <div className="text-xs text-green-600">Traffic growth</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-tan-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-tan-100 rounded-full flex items-center justify-center">
                              <Globe className="w-4 h-4 text-tan-700" />
                            </div>
                            <div>
                              <div className="font-medium text-charcoal-900">Competitor B</div>
                              <div className="text-xs text-charcoal-500">competitor-b.com</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-charcoal-900">-8%</div>
                            <div className="text-xs text-red-600">Traffic decline</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-charcoal-800 h-6 rounded-b-xl flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-charcoal-400" />
                  </div>
                </div>

                {/* Mobile */}
                <div className="mx-auto">
                  <div className="bg-charcoal-900 rounded-t-2xl p-2 w-48">
                    <div className="bg-white rounded-lg p-4 min-h-[200px]">
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-charcoal-900 text-sm">Mobile Dashboard</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-slate_blue-50 rounded p-2">
                          <div className="text-xs font-medium text-charcoal-900">Market Share</div>
                          <div className="text-lg font-bold text-slate_blue-700">23.4%</div>
                        </div>
                        <div className="bg-tan-50 rounded p-2">
                          <div className="text-xs font-medium text-charcoal-900">Alerts</div>
                          <div className="text-lg font-bold text-tan-700">7 new</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-charcoal-800 h-4 rounded-b-2xl flex items-center justify-center">
                    <Smartphone className="w-3 h-3 text-charcoal-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Detail Section */}
        <section className="py-20 bg-cornsilk-50" aria-labelledby="features-detail-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="features-detail-heading" className="text-4xl font-bold text-charcoal-900 mb-4">
                Complete Marketing Intelligence Suite
              </h2>
              <p className="text-xl text-charcoal-600 max-w-3xl mx-auto">
                Every tool you need to make data-driven marketing decisions and stay ahead of the competition.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-cream-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-slate_blue-700" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 mb-4">{feature.title}</h3>
                  <p className="text-charcoal-600 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-charcoal-600">
                        <CheckCircle className="w-4 h-4 text-slate_blue-600 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-slate_blue-600 to-charcoal-800" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Marketing Strategy?
            </h2>
            <p className="text-xl text-slate_blue-100 mb-8 max-w-3xl mx-auto">
              Join 150+ B2B SaaS companies using AI-powered market intelligence to outmaneuver competitors and accelerate growth.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-tan-600 to-olive-600 hover:from-tan-700 hover:to-olive-700 text-white px-6 py-3 rounded-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
                  >
                    Get Demo
                  </button>
                </div>
              </form>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate_blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-tan-300" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-tan-300" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-tan-300" />
                <span>Setup in 5 minutes</span>
              </div>
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
                <BrandLogo variant="text-only" theme="dark" />
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