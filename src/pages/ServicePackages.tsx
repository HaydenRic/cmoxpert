import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Check,
  Shield,
  Zap,
  Crown,
  ArrowRight,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServicePackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  deliverables: Array<{
    type: string;
    name: string;
    cadence: string;
  }>;
  client_limit: number;
  is_active: boolean;
  sort_order: number;
}

interface ClientSubscription {
  id: string;
  package_id: string;
  status: string;
  billing_cycle: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  service_packages: ServicePackage;
}

export function ServicePackages() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<ClientSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
      loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [packagesResult, subscriptionResult] = await Promise.all([
        supabase
          .from('service_packages')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        user ? supabase
          .from('client_subscriptions')
          .select(`
            *,
            service_packages(*)
          `)
          .eq('status', 'active')
          .maybeSingle() : Promise.resolve({ data: null })
      ]);

      if (packagesResult.data) {
        setPackages(packagesResult.data);
      }

      if (subscriptionResult.data) {
        setCurrentSubscription(subscriptionResult.data as ClientSubscription);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (packageId: string) => {
    setSubscribing(packageId);
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!client) {
        alert('Please create a client profile first');
        return;
      }

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'annual' ? 12 : 1));

      const { error } = await supabase
        .from('client_subscriptions')
        .insert({
          client_id: client.id,
          package_id: packageId,
          billing_cycle: billingCycle,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString()
        });

      if (error) throw error;

      alert('Successfully subscribed! Redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe: ' + error.message);
    } finally {
      setSubscribing(null);
    }
  };

  const formatPrice = (pence: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pence / 100);
  };

  const getPackageIcon = (index: number) => {
    const icons = [Shield, Zap, Crown];
    return icons[index] || Shield;
  };

  const getPackageColor = (index: number) => {
    const colors = [
      { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', accent: 'bg-blue-600', text: 'text-blue-600' },
      { bg: 'from-green-50 to-green-100', border: 'border-green-200', accent: 'bg-green-600', text: 'text-green-600' },
      { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', accent: 'bg-purple-600', text: 'text-purple-600' }
    ];
    return colors[index] || colors[0];
  };

  const getSavings = (monthly: number, annual: number) => {
    const monthlyCost = monthly * 12;
    const savings = ((monthlyCost - annual) / monthlyCost) * 100;
    return Math.round(savings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Replace Your Agency
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Marketing Services, Productized
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Get the strategic marketing support you need without the agency overhead.
            Automated insights, expert recommendations, and transparent pricing.
          </p>
        </div>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-900">
                    Active Subscription: {currentSubscription.service_packages.name}
                  </h3>
                  <p className="text-sm text-green-700">
                    Renews on {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                    {currentSubscription.cancel_at_period_end && ' (Cancels at end of period)'}
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'annual' ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
            Annual
          </span>
          {billingCycle === 'annual' && packages[0] && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
              Save {getSavings(packages[0].monthly_price, packages[0].annual_price)}%
            </span>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => {
            const Icon = getPackageIcon(index);
            const colors = getPackageColor(index);
            const price = billingCycle === 'monthly' ? pkg.monthly_price : pkg.annual_price;
            const isPopular = index === 1;
            const isCurrentPlan = currentSubscription?.package_id === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl p-8 ${
                  isPopular ? 'shadow-2xl scale-105 z-10' : 'shadow-lg'
                } transition-all hover:shadow-xl`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-sm font-bold shadow-lg">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.accent} rounded-2xl mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{pkg.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-slate-900">{formatPrice(price)}</span>
                    <span className="text-slate-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-sm text-slate-500">
                      {formatPrice(pkg.monthly_price)}/mo billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className={`w-5 h-5 ${colors.text} mr-3 flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Deliverables */}
                {pkg.deliverables && pkg.deliverables.length > 0 && (
                  <div className="pt-6 border-t-2 border-slate-200 mb-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Key Deliverables
                    </h4>
                    <div className="space-y-2">
                      {pkg.deliverables.slice(0, 3).map((deliverable, idx) => (
                        <div key={idx} className="flex items-start text-xs text-slate-600">
                          <Calendar className="w-3 h-3 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>{deliverable.name}</strong> ({deliverable.cadence})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(pkg.id)}
                  disabled={subscribing !== null || isCurrentPlan || !!currentSubscription}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center ${
                    isCurrentPlan
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : currentSubscription
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
                      : `${colors.accent} hover:opacity-90 text-white`
                  }`}
                >
                  {subscribing === pkg.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : currentSubscription ? (
                    'Cancel Current to Switch'
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>

                {pkg.client_limit && (
                  <p className="text-xs text-center text-slate-500 mt-3">
                    Limited to {pkg.client_limit} clients
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Why Choose Productized Services?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Traditional Agency</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>£4,000-£12,000/month</li>
                <li>Slow turnaround times</li>
                <li>Inconsistent quality</li>
                <li>Requires constant management</li>
                <li>Hidden costs & scope creep</li>
              </ul>
            </div>
            <div className="text-center border-4 border-green-200 rounded-2xl p-6 -mt-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Our Platform</h3>
              <ul className="text-sm text-green-800 space-y-2 font-medium">
                <li>✓ £2,000-£8,000/month</li>
                <li>✓ Weekly performance metrics</li>
                <li>✓ Consistent expert-driven quality</li>
                <li>✓ Self-service + expert support</li>
                <li>✓ Transparent, all-inclusive pricing</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">DIY Analytics Tools</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>£160-£800/month</li>
                <li>Requires technical expertise</li>
                <li>Time-consuming setup</li>
                <li>Data only, no strategy</li>
                <li>You do all the work</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-slate-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Done-For-You Strategy</h3>
                <p className="text-slate-600">
                  We analyze your data, identify opportunities, and deliver actionable recommendations.
                  You get the insights without doing the work.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-slate-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Predictable Pricing</h3>
                <p className="text-slate-600">
                  No surprise invoices, no scope creep. One flat monthly fee covers everything.
                  Cancel anytime with no penalties.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Not sure which package is right for you?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Book a free 15-minute consultation to discuss your marketing needs and get a personalized recommendation.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/contact"
              className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-lg font-bold transition-colors"
            >
              Schedule Consultation
            </Link>
            <Link
              to="/pricing"
              className="bg-transparent hover:bg-white/10 text-white border-2 border-white px-8 py-4 rounded-lg font-bold transition-colors"
            >
              View Full Comparison
            </Link>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            Have questions about our productized services?
          </p>
          <Link
            to="/support"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Visit our FAQ
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
