import { CheckCircle, Sparkles } from 'lucide-react';
import type { PricingTier } from '../lib/stripe';

interface PricingCardProps {
  tier: PricingTier;
  onSelect: (tier: PricingTier) => void;
  highlighted?: boolean;
}

export default function PricingCard({ tier, onSelect, highlighted = false }: PricingCardProps) {
  const discount = tier.originalPrice
    ? Math.round(((tier.originalPrice - tier.price) / tier.originalPrice) * 100)
    : 0;

  return (
    <div className={`relative bg-slate_blue-800/50 rounded-xl p-6 transition-all hover:scale-105 ${
      highlighted
        ? 'border-2 border-earth_yellow-500 shadow-xl'
        : 'border border-slate_blue-700'
    }`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-earth_yellow-500 to-earth_yellow-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
            <Sparkles className="w-4 h-4" />
            <span>RECOMMENDED</span>
          </span>
        </div>
      )}

      {tier.tier === 'founding' && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
            FOUNDING MEMBERS
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
        <div className="flex items-baseline justify-center space-x-2">
          <span className="text-4xl font-bold text-white">
            {tier.price === 0 ? 'FREE' : `$${tier.price}`}
          </span>
          {tier.price > 0 && <span className="text-cornsilk-400 text-lg">/mo</span>}
        </div>
        {tier.originalPrice && tier.originalPrice > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-cornsilk-500 line-through text-sm">
              ${tier.originalPrice}/mo normally
            </p>
            <p className="text-green-400 font-bold text-sm">
              Save {discount}%
            </p>
          </div>
        )}
        <p className="text-cornsilk-400 text-sm mt-2">
          {tier.clientLimit === -1
            ? 'Unlimited clients'
            : `Up to ${tier.clientLimit} client${tier.clientLimit === 1 ? '' : 's'}`
          }
        </p>
      </div>

      <ul className="space-y-3 mb-6">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-cornsilk-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(tier)}
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          highlighted
            ? 'bg-gradient-to-r from-earth_yellow-500 to-earth_yellow-600 text-white hover:shadow-lg'
            : tier.tier === 'founding'
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
            : 'bg-slate_blue-700 text-white hover:bg-slate_blue-600'
        }`}
      >
        {tier.tier === 'founding' ? 'Apply for Founding Access' : 'Get Started'}
      </button>

      {tier.tier === 'founding' && (
        <p className="text-cornsilk-500 text-xs text-center mt-3">
          First 10 users only
        </p>
      )}
    </div>
  );
}
