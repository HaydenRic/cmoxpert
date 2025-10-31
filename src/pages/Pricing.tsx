import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DemoBookingForm from '../components/DemoBookingForm';
import { SEOHead, pageMeta } from '../components/SEOHead';

interface PricingTier {
  id: string;
  tier_name: string;
  display_order: number;
  monthly_price_gbp: number | null;
  annual_price_gbp: number | null;
  features: {
    included: string[];
    highlighted: boolean;
  };
  max_monthly_spend: number | null;
}

export default function Pricing() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricingTiers();
  }, []);

  const loadPricingTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPricingTiers(data || []);
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Custom';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPrice = (tier: PricingTier) => {
    if (billingCycle === 'monthly') {
      return tier.monthly_price_gbp;
    }
    return tier.annual_price_gbp;
  };

  const getMonthlySavings = (tier: PricingTier) => {
    if (!tier.monthly_price_gbp || !tier.annual_price_gbp) return 0;
    const annualMonthly = tier.annual_price_gbp / 12;
    return tier.monthly_price_gbp - annualMonthly;
  };

  if (showBookingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowBookingForm(false)}
            className="mb-6 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            ← Back to Pricing
          </button>
          <DemoBookingForm />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead {...pageMeta.pricing} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the plan that fits your marketing spend. All plans include fraud detection,
            channel analytics, and compliance tools.
          </p>

          <div className="inline-flex items-center bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Save 10%
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier) => {
              const price = getPrice(tier);
              const savings = getMonthlySavings(tier);
              const isHighlighted = tier.features.highlighted;

              return (
                <div
                  key={tier.id}
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                    isHighlighted ? 'ring-4 ring-blue-500 relative' : 'border border-gray-200'
                  }`}
                >
                  {isHighlighted && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 font-semibold text-sm flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tier.tier_name}
                    </h3>

                    {tier.max_monthly_spend && (
                      <p className="text-sm text-gray-600 mb-4">
                        Up to {formatPrice(tier.max_monthly_spend)} monthly ad spend
                      </p>
                    )}

                    <div className="mb-6">
                      {price === null ? (
                        <div>
                          <div className="text-4xl font-bold text-gray-900">Custom</div>
                          <p className="text-sm text-gray-600 mt-1">Tailored to your needs</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-900">
                              {formatPrice(price)}
                            </span>
                            <span className="text-gray-600">
                              /{billingCycle === 'monthly' ? 'month' : 'year'}
                            </span>
                          </div>
                          {billingCycle === 'annual' && savings > 0 && (
                            <p className="text-sm text-green-600 font-semibold mt-1">
                              Save {formatPrice(savings)}/month
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setShowBookingForm(true)}
                      className={`w-full py-3 px-6 rounded-xl font-bold transition-all mb-6 ${
                        isHighlighted
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {price === null ? 'Contact Sales' : 'Start Free Trial'}
                    </button>

                    <div className="space-y-3">
                      {tier.features.included.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Not sure which plan is right for you?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book a free consultation and we'll help you calculate your exact ROI and recommend
            the best plan for your marketing spend.
          </p>
          <button
            onClick={() => setShowBookingForm(true)}
            className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            <span>Book Free Consultation</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">30 Days</div>
            <p className="text-gray-600">Free trial on all plans</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">No Lock-in</div>
            <p className="text-gray-600">Cancel anytime, no questions</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">10x ROI</div>
            <p className="text-gray-600">Average return in first year</p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">What happens after the trial?</h4>
              <p className="text-gray-600 text-sm">
                You'll automatically be moved to your chosen plan unless you cancel. We'll send
                reminders before any charges occur.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Can I change plans later?</h4>
              <p className="text-gray-600 text-sm">
                Yes! Upgrade or downgrade anytime. We'll prorate the difference and adjust your
                next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Is implementation included?</h4>
              <p className="text-gray-600 text-sm">
                Yes. All plans include full onboarding, integration support, and training for
                your team.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">What about data security?</h4>
              <p className="text-gray-600 text-sm">
                We're SOC 2 Type II certified and fully FCA compliant. Your data is encrypted at
                rest and in transit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
