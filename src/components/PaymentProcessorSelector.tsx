import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import type { PricingTier, PaymentProcessor } from '../lib/stripe';
import StripeCheckout from './StripeCheckout';
import PayPalCheckout from './PayPalCheckout';

interface PaymentProcessorSelectorProps {
  tier: PricingTier;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentProcessorSelector({ tier, isOpen, onClose }: PaymentProcessorSelectorProps) {
  const [selectedProcessor, setSelectedProcessor] = useState<PaymentProcessor | null>(null);

  const handleProcessorSelect = (processor: PaymentProcessor) => {
    setSelectedProcessor(processor);
  };

  const handleBack = () => {
    setSelectedProcessor(null);
  };

  if (!isOpen) return null;

  if (selectedProcessor === 'stripe') {
    return <StripeCheckout tier={tier} isOpen={true} onClose={onClose} />;
  }

  if (selectedProcessor === 'paypal') {
    return <PayPalCheckout tier={tier} isOpen={true} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Payment Method
          </h2>
          <p className="text-gray-600">
            Select how you'd like to pay for {tier.name}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => handleProcessorSelect('stripe')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900">Credit Card (Stripe)</h3>
                  <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => handleProcessorSelect('paypal')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900">PayPal</h3>
                  <p className="text-sm text-gray-600">PayPal account or card</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-gray-600 hover:text-gray-900 py-3 font-medium transition-colors"
        >
          Cancel
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Both payment methods are secure and encrypted. Your subscription will auto-renew monthly.
        </p>
      </div>
    </div>
  );
}
