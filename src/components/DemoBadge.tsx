import { featureFlags } from '../lib/featureFlags';
import { AlertCircle } from 'lucide-react';

export function DemoBadge() {
  if (!featureFlags.DEMO_MODE) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-sm font-semibold z-50 shadow-lg flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      DEMO MODE - Sample data only
    </div>
  );
}
