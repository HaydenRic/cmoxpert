import { Link } from 'react-router-dom';
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  Users,
  Shield,
  Award,
  CheckCircle,
  AlertTriangle,
  Rocket,
  Brain,
  LineChart,
  Star
} from 'lucide-react';
import { HorizonHero } from '../components/HorizonHero';

export default function ProductizedLanding() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <HorizonHero />
      {/* Spacer */}
      <div className="h-24"></div>

      {/* Problem Section with Side-by-Side Cards */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-10 leading-tight tracking-tighter">
              Marketing Agencies
              <br />
              <span className="text-horizon-200">
                Are Broken
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              You know you need marketing help, but traditional agencies are expensive, slow, and inconsistent
            </p>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Traditional Agency Card */}
            <div className="group bg-zinc-900/50 rounded-3xl p-10 shadow-card hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-zinc-800 hover:border-horizon-800">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mr-5">
                  <AlertTriangle className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">Traditional Agency</h3>
              </div>

              <ul className="space-y-4">
                {[
                  { text: '£4,000-£12,000/month retainers', icon: DollarSign },
                  { text: '2-4 weeks for simple campaign changes', icon: Clock },
                  { text: 'Inconsistent quality across team', icon: AlertTriangle },
                  { text: 'Requires constant management', icon: Users },
                  { text: 'Hidden costs and scope creep', icon: TrendingUp },
                  { text: 'Junior staff doing actual work', icon: Users },
                  { text: 'Generic strategies from templates', icon: BarChart3 },
                  { text: 'Zero transparency into activities', icon: X }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-300 font-medium">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-baltic-blue/20 flex items-center justify-center mr-4 mt-0.5">
                      <X className="w-4 h-4 text-baltic-blue" />
                    </div>
                    <span className="text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* cmoxpert Card */}
            <div className="group bg-horizon-900/20 rounded-3xl p-10 shadow-glow transition-all duration-500 transform hover:-translate-y-2 border border-horizon-700/50 relative overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {/* Best Value Badge */}
              <div className="absolute -top-3 -right-3">
                <div className="bg-white text-horizon-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Best Value
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mr-5 shadow-glow">
                    <CheckCircle className="w-8 h-8 text-horizon-700" />
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">cmoxpert Services</h3>
                </div>

                <ul className="space-y-4">
                  {[
                    { text: '£2,000-£8,000/month transparent pricing', icon: DollarSign },
                    { text: 'Weekly performance insights and tracking', icon: Zap },
                    { text: 'Consistent data-driven analysis', icon: Brain },
                    { text: 'Self-service dashboard + expert support', icon: Users },
                    { text: 'All-inclusive - no surprise fees', icon: Shield },
                    { text: 'Strategic recommendations from data', icon: LineChart },
                    { text: 'Customized strategies for YOUR business', icon: Target },
                    { text: 'Complete transparency & regular reports', icon: BarChart3 }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-100 font-bold">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-baltic-blue/30 flex items-center justify-center mr-4 mt-0.5">
                        <Check className="w-4 h-4 text-baltic-blue" />
                      </div>
                      <span className="text-lg">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/audit"
              className="group inline-flex items-center text-baltic-blue hover:text-ocean-teal font-bold text-xl transition-colors"
            >
              See how much you could save
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* How It Works - Timeline Design */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Fractional CMO expertise meets{' '}
              <span className="font-bold bg-gradient-to-r from-baltic-blue to-ocean-teal bg-clip-text text-transparent">
                data-driven insights
              </span>
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-zinc-900 rounded-3xl shadow-card p-10 border border-zinc-800 hover:border-zinc-700 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-3xl font-bold text-white mb-2">Automated Insights</h3>
                      <p className="text-slate-300 text-lg leading-relaxed">
                        Connect your marketing platforms once. Every Monday, receive comprehensive performance reports.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['Weekly performance reports', 'ROI tracking across all channels', 'Anomaly detection & alerts'].map((item, idx) => (
                      <li key={idx} className="flex items-center text-slate-300 font-medium">
                        <Check className="w-5 h-5 mr-3 text-baltic-blue flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-baltic-blue to-ocean-teal rounded-full flex items-center justify-center text-dark-bg-500 text-4xl font-black shadow-2xl shadow-baltic-blue/50 order-1 md:order-2">
                1
              </div>
            </div>

            {/* Connecting Line */}
            <div className="hidden md:block w-1 h-16 bg-gradient-to-b from-baltic-blue to-regal-navy mx-auto rounded-full shadow-lg shadow-baltic-blue/50"></div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-ocean-teal to-ocean-teal/70 rounded-full flex items-center justify-center text-dark-bg-500 text-4xl font-black shadow-2xl shadow-ocean-teal/50 order-1">
                2
              </div>

              <div className="flex-shrink-0 w-full md:w-1/2 order-2">
                <div className="bg-gradient-to-br from-dark-bg-700 to-dark-bg-600 rounded-3xl shadow-2xl p-10 border-2 border-ocean-teal/30 hover:border-ocean-teal/60 transition-all duration-500 transform hover:-translate-y-1 relative">
                  <div className="absolute -top-4 right-8">
                    <span className="bg-gradient-to-r from-regal-navy to-regal-navy/70 text-dark-bg-500 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-ocean-teal to-ocean-teal/60 rounded-2xl flex items-center justify-center shadow-xl shadow-ocean-teal/30">
                      <Target className="w-10 h-10 text-dark-bg-500" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-3xl font-bold text-white mb-2">Strategic Recommendations</h3>
                      <p className="text-slate-300 text-lg leading-relaxed">
                        Our experts analyze your data and deliver actionable next steps to improve results.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['Budget reallocation advice', 'Campaign optimization tips', 'Competitive intelligence'].map((item, idx) => (
                      <li key={idx} className="flex items-center text-slate-300 font-medium">
                        <Check className="w-5 h-5 mr-3 text-ocean-teal flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="hidden md:block w-1 h-16 bg-gradient-to-b from-ocean-teal to-regal-navy mx-auto rounded-full shadow-lg shadow-regal-navy/50"></div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-dark-bg-700 rounded-3xl shadow-2xl p-10 border-2 border-regal-navy/30 hover:border-regal-navy/60 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-regal-navy to-regal-navy/60 rounded-2xl flex items-center justify-center shadow-xl shadow-regal-navy/30">
                      <Users className="w-10 h-10 text-dark-bg-500" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-3xl font-bold text-white mb-2">Expert Support</h3>
                      <p className="text-slate-300 text-lg leading-relaxed">
                        Get monthly strategy calls with real marketing experts who guide your decisions.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['Monthly strategy sessions', 'Quarterly business reviews', 'Email & chat support'].map((item, idx) => (
                      <li key={idx} className="flex items-center text-slate-300 font-medium">
                        <Check className="w-5 h-5 mr-3 text-regal-navy flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-regal-navy to-regal-navy/70 rounded-full flex items-center justify-center text-dark-bg-500 text-4xl font-black shadow-2xl shadow-regal-navy/50 order-1 md:order-2">
                3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-br from-dark-bg-600 via-dark-bg-500 to-dark-bg-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Trusted by Growing Companies
            </h2>
            <p className="text-xl md:text-2xl text-slate-300">
              Marketing leaders choose us over agencies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: 'Expert', label: 'Fractional CMO Guidance', gradient: 'from-baltic-blue to-ocean-teal' },
              { value: 'Data-Driven', label: 'Strategic Recommendations', gradient: 'from-ocean-teal to-regal-navy' },
              { value: 'Transparent', label: 'Clear Reporting & Insights', gradient: 'from-regal-navy to-baltic-blue' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-dark-bg-700/60 backdrop-blur-lg rounded-3xl p-8 border border-baltic-blue/30 hover:border-baltic-blue/60 hover:bg-dark-bg-700 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
                <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-4`}>
                  {stat.value}
                </div>
                <p className="text-lg text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Final CTA Section */}
      <section className="py-32 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tighter">
            Ready to{' '}
            <span className="text-horizon-200">
              Ditch Your Agency?
            </span>
          </h2>

          <p className="text-2xl md:text-3xl text-slate-300 mb-12 leading-relaxed">
            Start with a free marketing audit. See exactly where you're wasting money and how much you could save.
          </p>

          <div className="mb-10">
            <Link
              to="/audit"
              className="group relative inline-flex items-center px-14 py-7 bg-white text-horizon-900 rounded-full font-black text-2xl shadow-glow hover:scale-105 hover:-translate-y-2 transition-all duration-500"
            >
              <Rocket className="w-8 h-8 mr-3 group-hover:rotate-12 transition-transform" />
              Get Free Audit
              <ArrowRight className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <p className="text-slate-400 mb-10 text-lg">
            <Shield className="w-5 h-5 inline mr-2" />
            No credit card • No obligation • Get started today
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-300">
            <div className="flex items-center bg-dark-bg-700 rounded-full px-6 py-3 shadow-lg border border-baltic-blue/30">
              <Shield className="w-5 h-5 mr-2 text-baltic-blue" />
              <span className="font-semibold">No long-term contracts</span>
            </div>
            <div className="flex items-center bg-dark-bg-700 rounded-full px-6 py-3 shadow-lg border border-ocean-teal/30">
              <Award className="w-5 h-5 mr-2 text-ocean-teal" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
            <div className="flex items-center bg-dark-bg-700 rounded-full px-6 py-3 shadow-lg border border-regal-navy/30">
              <Clock className="w-5 h-5 mr-2 text-regal-navy" />
              <span className="font-semibold">Fast onboarding</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-zinc-950 text-white py-16 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-baltic-blue to-ocean-teal bg-clip-text text-transparent">
                cmoxpert
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Tech-enabled fractional CMO services for growing companies
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4 text-lg text-white">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/packages" className="hover:text-baltic-blue transition-colors">Pricing</Link></li>
                <li><Link to="/audit" className="hover:text-baltic-blue transition-colors">Free Audit</Link></li>
                <li><Link to="/beta" className="hover:text-baltic-blue transition-colors">Platform Demo</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4 text-lg text-white">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/contact" className="hover:text-baltic-blue transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-baltic-blue transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-baltic-blue transition-colors">Terms</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-lg text-white">Get Started</h4>
              <Link
                to="/audit"
                className="inline-block bg-gradient-to-r from-baltic-blue to-ocean-teal hover:from-baltic-blue/90 hover:to-ocean-teal/90 text-dark-bg-500 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
              >
                Free Audit
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>© 2024 cmoxpert. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
          opacity: 0;
        }

        .bg-size-200 {
          background-size: 200%;
        }

        .bg-pos-100 {
          background-position: 100%;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
