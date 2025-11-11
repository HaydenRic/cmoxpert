export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
export const PAYPAL_MODE = import.meta.env.VITE_PAYPAL_MODE || 'sandbox';

export type PaymentProcessor = 'stripe' | 'paypal';

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  paypalPlanId?: string;
  features: string[];
  clientLimit: number;
  recommended?: boolean;
  tier: 'founding' | 'starter' | 'professional' | 'agency';
}

export const BETA_PRICING_TIERS: PricingTier[] = [
  {
    id: 'founding',
    name: 'Founding User',
    price: 0,
    originalPrice: 399,
    interval: 'month',
    stripePriceId: '',
    paypalPlanId: '',
    tier: 'founding',
    clientLimit: -1,
    features: [
      '12 months completely free',
      'Lifetime 50% discount after',
      'Unlimited clients',
      'All production features',
      'Weekly founder access',
      'Priority support',
      'Influence product roadmap',
      'Named in product credits'
    ]
  },
  {
    id: 'starter',
    name: 'Early Adopter',
    price: 99,
    originalPrice: 199,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || '',
    paypalPlanId: import.meta.env.VITE_PAYPAL_PLAN_STARTER || '',
    tier: 'starter',
    clientLimit: 3,
    recommended: true,
    features: [
      '75% off standard pricing',
      'Price locked for 12 months',
      'Up to 3 clients',
      'All production features',
      'Priority support',
      'Early access to new features',
      'Beta community access'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 199,
    originalPrice: 399,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL || '',
    paypalPlanId: import.meta.env.VITE_PAYPAL_PLAN_PROFESSIONAL || '',
    tier: 'professional',
    clientLimit: 10,
    features: [
      '50% off standard pricing',
      'Price locked for 12 months',
      'Up to 10 clients',
      'All production features',
      'Priority support',
      'Early access to new features',
      'Beta community access'
    ]
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 399,
    originalPrice: 699,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_AGENCY || '',
    paypalPlanId: import.meta.env.VITE_PAYPAL_PLAN_AGENCY || '',
    tier: 'agency',
    clientLimit: 25,
    features: [
      '43% off standard pricing',
      'Price locked for 12 months',
      'Up to 25 clients',
      'All production features',
      'Priority support',
      'Early access to new features',
      'Beta community access',
      'White-label options (coming Q2)'
    ]
  }
];

export interface PayPalCheckoutData {
  email: string;
  name: string;
  planId: string;
  tier: string;
  successUrl: string;
  cancelUrl: string;
}

export function getPricingTier(tierName: string): PricingTier | undefined {
  return BETA_PRICING_TIERS.find(t => t.id === tierName || t.name === tierName);
}

export function formatPrice(price: number, interval: 'month' | 'year' = 'month'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);

  return interval === 'month' ? `${formatted}/mo` : `${formatted}/yr`;
}

export function calculateDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice === 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function loadPayPalScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    paypal?: any;
  }
}
