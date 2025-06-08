import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
  AlertCircle
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
      console.error('Error loading featured video:', error);
    }
  };

  const trackVideoView = async (videoId: string) => {
    try {
      await supabase
        .from('video_views')
        .insert([{
          video_id: videoId,
          ip_address: 'anonymous', // In production, you might want to get actual IP
          user_agent: navigator.userAgent
        }]);
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleContactCMO = () => {
    navigate('/contact');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    navigate('/auth');
  };

  const handleVideoPlay = () => {
    if (featuredVideo) {
      trackVideoView(featuredVideo.id);
    }
  };

  const features = [
    {
      icon: Eye,
      title: "Real-Time Competitive Intelligence",
      description: "Monitor competitor moves, pricing changes, and market positioning 24/7 with AI-powered alerts.",
      color: "bg-dark_moss_green-500"
    },
    {
      icon: TrendingUp,
      title: "Predictive Demand Generation",
      description: "Identify market opportunities before your competitors with predictive analytics and trend forecasting.",
      color: "bg-pakistan_green-500"
    },
    {
      icon: Target,
      title: "Dynamic Messaging Optimization",
      description: "AI-powered A/B testing and messaging optimization that adapts in real-time to market responses.",
      color: "bg-tiger_s_eye-500"
    },
    {
      icon: PoundSterling,
      title: "Adaptive Pricing Recommendations",
      description: "Get data-driven pricing strategies that maximize revenue while staying competitive.",
      color: "bg-pakistan_green-500"
    },
    {
      icon: Search,
      title: "Micro-Niche Identification",
      description: "Discover untapped market segments and underserved customer needs with precision targeting.",
      color: "bg-earth_yellow-500"
    },
    {
      icon: BarChart3,
      title: "Automated Market Analysis",
      description: "Generate comprehensive market reports in minutes, not weeks, with our advanced AI engine.",
      color: "bg-tiger_s_eye-500"
    }
  ];

  const antiAgencyBenefits = [
    {
      icon: UserCheck,
      title: "Direct Access to Expertise",
      description: "No junior account managers. No diluted communication. You work directly with me, every single time."
    },
    {
      icon: Shield,
      title: "Radical Transparency",
      description: "Crystal-clear pricing, documented processes, and 'look over my shoulder' visibility into every decision."
    },
    {
      icon: Timer,
      title: "Sprint-Based Delivery",
      description: "Focused 2-week marketing sprints that tackle specific challenges and deliver tangible results quickly."
    },
    {
      icon: Lightbulb,
      title: "Agile Partnership",
      description: "Adaptable engagement models that scale with your needs – no rigid contracts or unnecessary overhead."
    }
  ];

  const gtmPhases = [
    {
      icon: MapPin,
      phase: "01",
      title: "Market Intelligence & Positioning",
      duration: "Week 1",
      description: "Deep competitor analysis, market sizing, and unique value proposition development",
      deliverables: ["Competitive landscape map", "Market opportunity assessment", "Value proposition framework"]
    },
    {
      icon: Target,
      phase: "02", 
      title: "Audience Definition & Messaging",
      duration: "Week 2",
      description: "Precise ICP definition, messaging hierarchy, and channel strategy development",
      deliverables: ["Ideal customer profiles", "Messaging architecture", "Channel priority matrix"]
    },
    {
      icon: Rocket,
      phase: "03",
      title: "Launch Strategy & Execution",
      duration: "Week 3-4",
      description: "Launch sequence planning, content creation, and performance tracking setup",
      deliverables: ["90-day launch plan", "Content calendar", "KPI dashboard"]
    },
    {
      icon: Gauge,
      phase: "04",
      title: "Optimization & Scale",
      duration: "Week 5-8",
      description: "Performance analysis, conversion optimization, and growth acceleration tactics",
      deliverables: ["Performance report", "Optimization roadmap", "Scale strategy"]
    }
  ];

  const gtmBenefits = [
    {
      icon: Clock,
      title: "8-Week Timeline",
      description: "Complete GTM strategy and initial execution in just 8 weeks"
    },
    {
      icon: Award,
      title: "Proven Framework",
      description: "Battle-tested methodology used by 50+ successful B2B SaaS launches"
    },
    {
      icon: Shield,
      title: "Risk Mitigation",
      description: "Reduce launch risk by 70% through systematic market validation"
    },
    {
      icon: TrendingUp,
      title: "Faster Results",
      description: "Achieve product-market fit 3x faster than traditional approaches"
    }
  ];

  // Micro-niche ICPs for cmoxpert
  const targetICPs = [
    {
      icon: Code,
      category: "Developer Tools SaaS",
      title: "API & Infrastructure Platforms",
      description: "B2B SaaS companies serving developers with APIs, infrastructure tools, or development platforms",
      challenges: ["Technical buyers with long evaluation cycles", "Bottom-up adoption strategies", "Developer community building"],
      opportunity: "£2.5M+ ARR potential",
      companies: "10-50 employees"
    },
    {
      icon: Shield,
      category: "Cybersecurity SaaS",
      title: "SME Security Solutions",
      description: "Cybersecurity platforms targeting 50-500 employee companies with compliance requirements",
      challenges: ["High-stakes purchase decisions", "Complex stakeholder buy-in", "Regulatory compliance messaging"],
      opportunity: "£5M+ ARR potential", 
      companies: "20-100 employees"
    },
    {
      icon: Database,
      category: "Data & Analytics SaaS",
      title: "Vertical-Specific Analytics",
      description: "Data platforms built for specific industries like healthcare, fintech, or logistics",
      challenges: ["Industry-specific positioning", "Data privacy concerns", "ROI demonstration"],
      opportunity: "£3M+ ARR potential",
      companies: "15-75 employees"
    },
    {
      icon: Users,
      category: "HR & People Ops SaaS",
      title: "Remote-First Workforce Tools",
      description: "HR technology for distributed teams, focusing on engagement, performance, and culture",
      challenges: ["People-centric value props", "Cultural fit messaging", "Manager vs. employee personas"],
      opportunity: "£4M+ ARR potential",
      companies: "25-150 employees"
    },
    {
      icon: Briefcase,
      category: "Professional Services SaaS", 
      title: "Industry-Specific Workflows",
      description: "SaaS tools designed for specific professional services like legal, accounting, or consulting",
      challenges: ["Traditional industry adoption", "Workflow disruption concerns", "Professional credibility"],
      opportunity: "£2M+ ARR potential",
      companies: "10-50 employees"
    },
    {
      icon: ShoppingCart,
      category: "E-commerce Infrastructure",
      title: "Merchant & Seller Tools",
      description: "Backend SaaS solutions for e-commerce operations, inventory, logistics, or marketplace sellers",
      challenges: ["Transaction-based value propositions", "Integration complexity", "Multi-channel strategies"],
      opportunity: "£6M+ ARR potential",
      companies: "20-100 employees"
    }
  ];

  const microNicheBenefits = [
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Focus on highly specific market segments with tailored messaging and positioning strategies"
    },
    {
      icon: Gauge,
      title: "Faster Market Penetration", 
      description: "Dominate smaller, well-defined markets before expanding to adjacent segments"
    },
    {
      icon: DollarSign,
      title: "Higher Conversion Rates",
      description: "Industry-specific expertise leads to more relevant solutions and better prospect engagement"
    },
    {
      icon: Rocket,
      title: "Reduced Competition",
      description: "Operate in spaces too niche for large agencies but too specific for generalist consultants"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP Marketing, TechFlow SaaS",
      content: "cmoxpert cut our market research time by 80% and helped us identify 3 new revenue streams we never saw coming.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Head of Growth, DataSync Pro",
      content: "The competitive intelligence alone has saved us from 2 major pricing mistakes. ROI was immediate.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Jennifer Park",
      role: "CMO, CloudScale Systems",
      content: "Finally, a tool that thinks like a seasoned strategist. It's like having a senior marketing consultant on-demand.",
      rating: 5,
      avatar: "JP"
    }
  ];

  const stats = [
    { value: "3.2x", label: "Average Revenue Growth" },
    { value: "80%", label: "Time Saved on Research" },
    { value: "150+", label: "B2B SaaS Companies" },
    { value: "24/7", label: "Market Monitoring" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pakistan_green-900 to-dark_moss_green-600 rounded-lg flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">cmoxpert</h1>
                <p className="text-xs text-slate-500">AI Marketing Co-Pilot</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/auth" 
                className="text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 hover:from-dark_moss_green-700 hover:to-pakistan_green-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-pakistan_green-900 via-dark_moss_green-800 to-dark_moss_green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/20">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Expert Partnership
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Turn Market Data Into 
                <span className="bg-gradient-to-r from-earth_yellow-400 to-tiger_s_eye-400 bg-clip-text text-transparent"> Strategic Advantage</span>
              </h1>
              
              <p className="text-xl text-white mb-8 leading-relaxed">
                <strong className="text-white">You get me, and only me.</strong> <span className="text-cornsilk-200">No junior account managers, no diluted communication, no bait-and-switch. Just direct access to expert-level marketing intelligence powered by AI, delivered with radical transparency.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-earth_yellow-600 to-tiger_s_eye-600 hover:from-earth_yellow-700 hover:to-tiger_s_eye-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Start Your Strategy Session</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => {
                    const videoSection = document.getElementById('demo-video');
                    videoSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center space-x-2 backdrop-blur-sm"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>

                <button
                  onClick={handleContactCMO}
                  className="bg-gradient-to-r from-tiger_s_eye-600 to-earth_yellow-600 hover:from-tiger_s_eye-700 hover:to-earth_yellow-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Fractional CMO</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-cornsilk-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-earth_yellow-400" />
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-earth_yellow-400" />
                  <span>Results in 5 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-earth_yellow-400" />
                  <span>Direct expert access</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-earth_yellow-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Market Opportunity Detected</p>
                        <p className="text-sm text-cornsilk-300">Direct expert analysis</p>
                      </div>
                    </div>
                    <div className="text-earth_yellow-400 font-bold">+32% ROI</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <p className="text-2xl font-bold text-white">156%</p>
                      <p className="text-sm text-cornsilk-300">Growth Potential</p>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <p className="text-2xl font-bold text-white">4.2x</p>
                      <p className="text-sm text-cornsilk-300">Market Share</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-earth_yellow-500/20 rounded-lg border border-earth_yellow-400/30">
                    <p className="text-sm font-medium text-earth_yellow-200 mb-2">Transparent Recommendation</p>
                    <p className="text-sm text-white">Sprint focus: Target "enterprise security" segment. 14-day timeline with clear deliverables.</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-earth_yellow-400 to-earth_yellow-600 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-tiger_s_eye-400 to-tiger_s_eye-600 rounded-full flex items-center justify-center shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anti-Agency Section */}
      <section className="py-20 bg-gradient-to-br from-pakistan_green-900 via-dark_moss_green-900 to-tiger_s_eye-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              The Anti-Agency Approach
            </h2>
            <p className="text-xl text-cornsilk-200 max-w-3xl mx-auto">
              Tired of agency overhead, junior execution, and opaque processes? Get direct access to expert-level marketing strategy with radical transparency and agile delivery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {antiAgencyBenefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{benefit.title}</h3>
                <p className="text-cornsilk-200 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Sprint-Based Engagement Model</h3>
              <p className="text-cornsilk-200 mb-6 max-w-2xl">
                Instead of long-term contracts with unclear deliverables, engage in focused 2-week "marketing sprints" that tackle specific challenges with measurable outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">2 weeks</div>
                  <div className="text-sm text-cornsilk-200">Sprint duration</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">Clear ROI</div>
                  <div className="text-sm text-cornsilk-200">Measurable results</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-cornsilk-200">Transparency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Go-to-Market as a Service Section */}
      <section className="py-20 bg-gradient-to-br from-cornsilk-50 via-earth_yellow-50 to-tiger_s_eye-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-earth_yellow-100 text-earth_yellow-900 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              Signature Methodology
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Go-to-Market as a Service
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Launch new products or enter new markets with confidence using my proven 8-week GTM framework. Designed specifically for B2B SaaS companies ready to accelerate growth without the typical launch risks.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-earth_yellow-500" />
                <span>8-week delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-earth_yellow-500" />
                <span>Risk mitigation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-earth_yellow-500" />
                <span>Proven framework</span>
              </div>
            </div>
          </div>

          {/* GTM Phases */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">The 4-Phase GTM Framework</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {gtmPhases.map((phase, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 relative">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-tiger_s_eye-500 to-earth_yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{phase.phase}</span>
                  </div>
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-earth_yellow-100 to-tiger_s_eye-100 rounded-lg flex items-center justify-center mb-4">
                    <phase.icon className="w-6 h-6 text-earth_yellow-600" />
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-earth_yellow-600 font-medium mb-1">{phase.duration}</div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">{phase.title}</h4>
                    <p className="text-slate-600 text-sm mb-4">{phase.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-slate-900 mb-2">Key Deliverables:</h5>
                    <ul className="space-y-1">
                      {phase.deliverables.map((deliverable, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start">
                          <CheckCircle className="w-3 h-3 text-pakistan_green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GTM Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {gtmBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-earth_yellow-200">
                <div className="w-12 h-12 bg-gradient-to-br from-earth_yellow-100 to-tiger_s_eye-100 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-earth_yellow-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h4>
                <p className="text-slate-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* GTM Pricing & CTA */}
          <div className="bg-gradient-to-r from-tiger_s_eye-600 to-earth_yellow-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Launch with Confidence?</h3>
            <p className="text-cornsilk-100 mb-6 max-w-2xl mx-auto">
              Get your complete Go-to-Market strategy and initial execution in just 8 weeks. Transparent pricing, clear deliverables, direct expert access.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">£18K</div>
                <div className="text-sm text-cornsilk-200">Complete GTM Package</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">8 weeks</div>
                <div className="text-sm text-cornsilk-200">Strategy to execution</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">4 phases</div>
                <div className="text-sm text-cornsilk-200">Systematic approach</div>
              </div>
            </div>

            <button
              onClick={handleContactCMO}
              className="bg-white text-tiger_s_eye-600 hover:bg-tiger_s_eye-50 px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center space-x-2"
            >
              <Rocket className="w-5 h-5" />
              <span>Start Your GTM Strategy</span>
            </button>
            
            <p className="text-xs text-cornsilk-200 mt-4">
              Includes: Market analysis, competitive positioning, messaging framework, launch plan, and first 90 days of execution support
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cornsilk-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              AI That Thinks Like Your Best Strategist
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every feature is designed to give B2B SaaS companies the strategic intelligence they need to outmaneuver competition and capture market opportunities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-slate-200 group">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-video" className="py-20 bg-gradient-to-br from-pakistan_green-900 via-dark_moss_green-800 to-dark_moss_green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              See cmoxpert In Action
            </h2>
            <p className="text-xl text-cornsilk-200 max-w-2xl mx-auto">
              Watch how leading B2B SaaS companies use our AI to identify opportunities and execute winning strategies.
            </p>
            {featuredVideo && (
              <p className="text-sm text-cornsilk-300 mt-2">
                {featuredVideo.views_count} views
              </p>
            )}
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="rounded-2xl shadow-2xl aspect-video overflow-hidden">
              {featuredVideo ? (
                <video
                  src={featuredVideo.url}
                  title={featuredVideo.title}
                  className="w-full h-full object-cover"
                  controls
                  onPlay={handleVideoPlay}
                  poster="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300">Demo video coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Micro-Niche ICP Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-dark_moss_green-100 text-dark_moss_green-900 rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Micro-Niche Specialization
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Who Benefits from cmoxpert?
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8">
              We specialize in micro-niches within B2B SaaS, targeting specific segments where generalist agencies struggle and specialized expertise creates massive competitive advantages. Each niche gets tailored strategies based on deep industry understanding.
            </p>
          </div>

          {/* Micro-Niche Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {microNicheBenefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-cornsilk-50 to-earth_yellow-50 rounded-xl p-6 border border-earth_yellow-100">
                <div className="w-12 h-12 bg-gradient-to-br from-earth_yellow-100 to-tiger_s_eye-100 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-earth_yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Target ICPs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {targetICPs.map((icp, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-dark_moss_green-100 to-pakistan_green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <icp.icon className="w-6 h-6 text-dark_moss_green-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {icp.companies}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-dark_moss_green-600 font-medium mb-1">{icp.category}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{icp.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{icp.description}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Key Challenges:</h4>
                  <ul className="space-y-1">
                    {icp.challenges.map((challenge, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start">
                        <AlertCircle className="w-3 h-3 text-earth_yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-pakistan_green-600">{icp.opportunity}</div>
                      <div className="text-xs text-slate-500">Revenue potential</div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-pakistan_green-100 to-dark_moss_green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-pakistan_green-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Why Micro-Niche CTA */}
          <div className="mt-16 bg-gradient-to-r from-dark_moss_green-50 to-pakistan_green-50 rounded-2xl p-8 border border-dark_moss_green-100">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Don't See Your Niche?</h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                We're continuously expanding into new micro-niches within B2B SaaS. If you're in a specialized market that requires deep industry expertise, let's discuss how we can develop a tailored approach for your segment.
              </p>
              <button
                onClick={handleContactCMO}
                className="bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 hover:from-dark_moss_green-700 hover:to-pakistan_green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>Discuss Your Niche</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Future Social Proof) */}
      <section className="py-20 bg-gradient-to-br from-cornsilk-50 via-cornsilk-100 to-cornsilk-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Beta Program Success Stories
            </h2>
            <p className="text-xl text-slate-600">
              Early results from our closed beta with select B2B SaaS companies
            </p>
          </div>
          
          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-cornsilk-200">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-earth_yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-dark_moss_green-500 to-pakistan_green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-slate-500 bg-white/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-slate-200">
              *Results from closed beta program. Full launch coming soon with expanded capabilities and enhanced AI features.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Marketing Strategy?
          </h2>
          <p className="text-xl text-cornsilk-100 mb-8">
            Join the B2B SaaS leaders who use cmoxpert to stay ahead of the competition
          </p>
          
          <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Get Your Expert Strategy Session</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth_yellow-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 hover:from-dark_moss_green-700 hover:to-pakistan_green-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Schedule Direct Consultation
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4">
              Direct access guaranteed. No junior staff. Crystal-clear pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-dark_moss_green-600 to-pakistan_green-600 rounded-lg flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">cmoxpert</h3>
                <p className="text-xs text-slate-400">AI Marketing Co-Pilot</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 cmoxpert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}