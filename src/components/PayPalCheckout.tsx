import { useState } from 'react';
import { X, CreditCard, Lock, ArrowRight } from 'lucide-react';
import type { PricingTier } from '../lib/paypal';
import { supabase } from '../lib/supabase';

interface PayPalCheckoutProps {
  tier: PricingTier;
  isOpen: boolean;
  onClose: () => void;
}

export default function PayPalCheckout({ tier, isOpen, onClose }: PayPalCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Please sign in to continue');
        setLoading(false);
        return;
      }

      if (!tier.paypalPlanId) {
        setError('PayPal plan not configured for this tier');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const checkoutData = {
        email: user.email,
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        planId: tier.paypalPlanId,
        tier: tier.id,
        successUrl: `${window.location.origin}/dashboard?checkout=success&processor=paypal`,
        cancelUrl: `${window.location.origin}/beta?checkout=canceled`
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-paypal-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkoutData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create PayPal subscription');
      }

      const { approvalUrl } = await response.json();

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        throw new Error('No approval URL returned');
      }
    } catch (err) {
      console.error('PayPal checkout error:', err);
      setError('Unable to process checkout. Please try again or contact support.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Subscribe to {tier.name}
          </h2>
          <p className="text-gray-600">
            Secure checkout powered by PayPal
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Plan</span>
            <span className="font-bold text-gray-900">{tier.name}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Clients</span>
            <span className="font-medium text-gray-900">
              {tier.clientLimit === -1 ? 'Unlimited' : `Up to ${tier.clientLimit}`}
            </span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-lg font-medium text-gray-900">Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${tier.price}/mo
              </div>
              {tier.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  ${tier.originalPrice}/mo
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>Continue with PayPal</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Secured by PayPal - Your payment info is safe</span>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Your subscription will auto-renew monthly.
        </p>
      </div>
    </div>
  );
}
