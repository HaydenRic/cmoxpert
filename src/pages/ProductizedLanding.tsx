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
  AlertTriangle
} from 'lucide-react';

export default function ProductizedLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate_blue-600 to-slate_blue-800 opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Replace Your Marketing Agency
            </div>
            <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Agency-Quality Marketing
              <br />
              <span className="text-slate_blue-600">Without the Agency Price</span>
            </h1>
            <p className="text-2xl text-slate-600 mb-8 leading-relaxed">
              Get automated insights, strategic recommendations, and expert support
              for <strong>50-60% less</strong> than traditional marketing agencies
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/audit"
                className="bg-gradient-to-r from-slate_blue-600 to-slate_blue-700 hover:from-slate_blue-700 hover:to-slate_blue-800 text-white px-10 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center"
              >
                Get Free Marketing Audit
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/packages"
                className="bg-white hover:bg-slate-50 text-slate_blue-700 border-2 border-slate_blue-200 px-10 py-5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              No credit card required • See results in 60 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Marketing Agencies Are Broken
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              You know you need marketing help, but traditional agencies are expensive,
              slow, and inconsistent. Sound familiar?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-900">Traditional Agency</h3>
              </div>
              <ul className="space-y-4">
                {[
                  '£4,000-£12,000/month retainers',
                  '2-4 weeks for simple campaign changes',
                  'Inconsistent quality across team members',
                  'Requires constant management and check-ins',
                  'Hidden costs and scope creep',
                  'Junior staff doing the actual work',
                  'Generic strategies copied from other clients',
                  'No transparency into what theyre actually doing'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-red-900">
                    <X className="w-5 h-5 mr-3 flex-shrink-0 text-red-600 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-900">Our Platform</h3>
              </div>
              <ul className="space-y-4">
                {[
                  '£2,000-£8,000/month transparent pricing',
                  'Instant automated insights every week',
                  'Consistent AI-powered analysis quality',
                  'Self-service dashboard + expert support',
                  'All-inclusive - no surprise fees',
                  'Strategic recommendations from real data',
                  'Customized strategies for your business',
                  'Complete transparency with real-time reporting'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-green-900 font-medium">
                    <Check className="w-5 h-5 mr-3 flex-shrink-0 text-green-600 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/audit"
              className="inline-flex items-center text-slate_blue-600 hover:text-slate_blue-700 font-bold text-lg"
            >
              See how much you could save
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Automated analysis meets expert strategy. The best of both worlds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-200 hover:border-slate_blue-300 transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Automated Insights</h3>
              <p className="text-slate-600 mb-6">
                Connect your marketing platforms once. Every Monday, receive a comprehensive
                performance report showing whats working and whats not.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Weekly performance reports
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  ROI tracking across all channels
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Anomaly detection & alerts
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate_blue-300 hover:border-slate_blue-400 transition-all relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </span>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Strategic Recommendations</h3>
              <p className="text-slate-600 mb-6">
                AI analyzes your data and market trends to deliver actionable recommendations.
                Know exactly what to do next to improve results.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Budget reallocation advice
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Campaign optimization tips
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Competitive intelligence
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-200 hover:border-slate_blue-300 transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Expert Support</h3>
              <p className="text-slate-600 mb-6">
                Not just software. Get monthly strategy calls with real marketing experts
                who review your results and guide your decisions.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Monthly strategy sessions
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Quarterly business reviews
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Email & chat support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Compare Your Options
            </h2>
            <p className="text-xl text-slate-600">
              See why productized services are the future of marketing support
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-6 font-bold text-slate-900"></th>
                  <th className="py-4 px-6">
                    <div className="text-center">
                      <p className="font-bold text-red-900 mb-1">Traditional Agency</p>
                      <p className="text-sm text-slate-600">£4-12K/month</p>
                    </div>
                  </th>
                  <th className="py-4 px-6 bg-gradient-to-br from-green-50 to-green-100 rounded-t-xl">
                    <div className="text-center">
                      <p className="font-bold text-green-900 mb-1">Our Platform</p>
                      <p className="text-sm text-green-700">£2-8K/month</p>
                    </div>
                  </th>
                  <th className="py-4 px-6">
                    <div className="text-center">
                      <p className="font-bold text-slate-900 mb-1">DIY Tools</p>
                      <p className="text-sm text-slate-600">£160-800/month</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: 'Monthly Cost', agency: '£4,000 - £12,000', us: '£2,000 - £8,000', diy: '£160 - £800' },
                  { feature: 'Setup Time', agency: '4-6 weeks', us: '24 hours', diy: '2-4 weeks' },
                  { feature: 'Report Delivery', agency: '2-4 weeks', us: 'Automated weekly', diy: 'You build it' },
                  { feature: 'Strategic Guidance', agency: 'Yes', us: 'Yes', diy: 'No' },
                  { feature: 'Data Analysis', agency: 'Manual', us: 'Automated + AI', diy: 'Manual' },
                  { feature: 'Turnaround Time', agency: 'Slow', us: 'Instant', diy: 'Depends on you' },
                  { feature: 'Quality Consistency', agency: 'Varies', us: 'Consistent', diy: 'Varies' },
                  { feature: 'Scalability', agency: 'Limited', us: 'High', diy: 'Very limited' },
                  { feature: 'Contract Length', agency: '6-12 months', us: 'Month-to-month', diy: 'Monthly' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-slate-600">{row.agency}</td>
                    <td className="py-4 px-6 text-center font-bold text-green-900 bg-gradient-to-br from-green-50 to-green-100">
                      {row.us}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600">{row.diy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Growing Companies
            </h2>
            <p className="text-xl text-slate-300">
              Marketing leaders choose us over agencies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-5xl font-bold text-green-400 mb-2">£2M+</div>
              <p className="text-slate-300">Wasted ad spend identified and recovered</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-5xl font-bold text-green-400 mb-2">156%</div>
              <p className="text-slate-300">Average ROI improvement in 90 days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-5xl font-bold text-green-400 mb-2">24hrs</div>
              <p className="text-slate-300">From signup to first actionable insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate_blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Ready to Ditch Your Agency?
          </h2>
          <p className="text-2xl text-slate-600 mb-10">
            Start with a free marketing audit. See exactly where youre wasting money
            and how much you could save with our productized services.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Link
              to="/audit"
              className="bg-gradient-to-r from-slate_blue-600 to-slate_blue-700 hover:from-slate_blue-700 hover:to-slate_blue-800 text-white px-12 py-6 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center"
            >
              Get Free Audit (60 Seconds)
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
          </div>
          <p className="text-slate-500 mb-8">
            No credit card • No obligation • Instant results
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-slate-600">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-slate_blue-600" />
              <span>No long-term contracts</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-slate_blue-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-slate_blue-600" />
              <span>Results in 24 hours</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
