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
  Sparkles,
  Rocket,
  Brain,
  LineChart,
  Star
} from 'lucide-react';

export default function ProductizedLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Animated Gradient Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 min-h-[90vh] flex items-center">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-transparent to-teal-500/30 animate-pulse"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-bold shadow-xl animate-fade-in-up">
              <Sparkles className="w-4 h-4 mr-2" />
              Tech-Enabled Fractional CMO Services
            </div>

            {/* Main Headline with better typography */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight animate-fade-in-up animation-delay-200">
              Strategic Marketing
              <br />
              <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Leadership, Simplified
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 leading-relaxed max-w-4xl mx-auto font-light animate-fade-in-up animation-delay-400">
              Get expert strategic guidance combined with comprehensive reporting at a fraction of the cost of traditional agencies
            </p>

            {/* CTA Buttons with animations */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-600">
              <Link
                to="/audit"
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 inline-flex items-center"
              >
                <span className="relative z-10 flex items-center">
                  Get Free Marketing Audit
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              </Link>

              <Link
                to="/packages"
                className="px-10 py-5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                View Pricing
              </Link>
            </div>

            {/* Trust line */}
            <p className="text-sm text-blue-200 animate-fade-in-up animation-delay-800">
              <Shield className="w-4 h-4 inline mr-2" />
              No credit card required • Get started in minutes
            </p>
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 py-6">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-teal-300">Expert</div>
                <div className="text-sm text-blue-200">CMO Guidance</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-teal-300">Weekly</div>
                <div className="text-sm text-blue-200">Performance Reports</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-teal-300">Custom</div>
                <div className="text-sm text-blue-200">Strategies</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-teal-300">Transparent</div>
                <div className="text-sm text-blue-200">Pricing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Problem Section with Side-by-Side Cards */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
              Marketing Agencies
              <br />
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Are Broken
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              You know you need marketing help, but traditional agencies are expensive, slow, and inconsistent
            </p>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Traditional Agency Card */}
            <div className="group bg-gradient-to-br from-red-50 via-orange-50 to-red-50 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-red-200">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-red-900">Traditional Agency</h3>
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
                  <li key={idx} className="flex items-start text-red-900 font-medium">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 flex items-center justify-center mr-4 mt-0.5">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* cmoxpert Card */}
            <div className="group bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-emerald-300 relative overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {/* Best Value Badge */}
              <div className="absolute -top-3 -right-3">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center">
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Best Value
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-emerald-900">cmoxpert Services</h3>
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
                    <li key={idx} className="flex items-start text-emerald-900 font-bold">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-300 flex items-center justify-center mr-4 mt-0.5">
                        <Check className="w-4 h-4 text-emerald-700" />
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
              className="group inline-flex items-center text-blue-600 hover:text-blue-700 font-bold text-xl transition-colors"
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
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
              Fractional CMO expertise meets{' '}
              <span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                data-driven insights
              </span>
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-slate-200 hover:border-blue-300 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-3xl font-bold text-slate-900 mb-2">Automated Insights</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Connect your marketing platforms once. Every Monday, receive comprehensive performance reports.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['Weekly performance reports', 'ROI tracking across all channels', 'Anomaly detection & alerts'].map((item, idx) => (
                      <li key={idx} className="flex items-center text-slate-700 font-medium">
                        <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl order-1 md:order-2">
                1
              </div>
            </div>

            {/* Connecting Line */}
            <div className="hidden md:block w-1 h-16 bg-gradient-to-b from-blue-600 to-green-600 mx-auto rounded-full"></div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl order-1">
                2
              </div>

              <div className="flex-shrink-0 w-full md:w-1/2 order-2">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl p-10 border-2 border-green-300 hover:border-green-400 transition-all duration-500 transform hover:-translate-y-1 relative">
                  <div className="absolute -top-4 right-8">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-3xl font-bold text-slate-900 mb-2">Strategic Recommendations</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Our experts analyze your data and deliver actionable next steps to improve results.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['Budget reallocation advice', 'Campaign optimization tips', 'Competitive intelligence'].map((item, idx) => (
                      <li key={idx} className="flex items-center text-slate-700 font-medium">
                        <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="hidden md:block w-1 h-16 bg-gradient-to-b from-green-600 to-purple-600 mx-auto rounded-full"></div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-slate-200 hover:border-purple-300 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <div className="ml-6">
                      <h3 className="text-3xl font-bold text-slate-900 mb-2">Expert Support</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Get monthly strategy calls with real marketing experts who guide your decisions.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['Monthly strategy sessions', 'Quarterly business reviews', 'Email & chat support'].map((item, idx) => (
                      <li key={idx} className="flex items-center text-slate-700 font-medium">
                        <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-2xl order-1 md:order-2">
                3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Trusted by Growing Companies
            </h2>
            <p className="text-xl md:text-2xl text-blue-200">
              Marketing leaders choose us over agencies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: 'Expert', label: 'Fractional CMO Guidance', gradient: 'from-green-400 to-emerald-500' },
              { value: 'Data-Driven', label: 'Strategic Recommendations', gradient: 'from-blue-400 to-cyan-500' },
              { value: 'Transparent', label: 'Clear Reporting & Insights', gradient: 'from-purple-400 to-pink-500' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
                <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-4`}>
                  {stat.value}
                </div>
                <p className="text-lg text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-tight">
            Ready to{' '}
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Ditch Your Agency?
            </span>
          </h2>

          <p className="text-2xl md:text-3xl text-slate-600 mb-12 leading-relaxed">
            Start with a free marketing audit. See exactly where you're wasting money and how much you could save.
          </p>

          <div className="mb-10">
            <Link
              to="/audit"
              className="group relative inline-flex items-center px-14 py-7 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-size-200 hover:bg-pos-100 text-white rounded-2xl font-black text-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
            >
              <Rocket className="w-8 h-8 mr-3 group-hover:rotate-12 transition-transform" />
              Get Free Audit
              <ArrowRight className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity blur-2xl"></div>
            </Link>
          </div>

          <p className="text-slate-500 mb-10 text-lg">
            <Shield className="w-5 h-5 inline mr-2" />
            No credit card • No obligation • Get started today
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600">
            <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-semibold">No long-term contracts</span>
            </div>
            <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
            <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-semibold">Fast onboarding</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                cmoxpert
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Tech-enabled fractional CMO services for growing companies
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/packages" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/audit" className="hover:text-white transition-colors">Free Audit</Link></li>
                <li><Link to="/beta" className="hover:text-white transition-colors">Platform Demo</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Get Started</h4>
              <Link
                to="/audit"
                className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
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
