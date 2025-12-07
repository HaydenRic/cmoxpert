import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { getPlatformStats, formatCurrency, PlatformStats } from '../lib/statsCache';

export default function PlatformStatsDisplay() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6 text-center animate-pulse">
        <div className="bg-slate-100 rounded-lg h-24"></div>
        <div className="bg-slate-100 rounded-lg h-24"></div>
        <div className="bg-slate-100 rounded-lg h-24"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-600">
        <p>Join our beta program</p>
      </div>
    );
  }

  // Show beta message if under 50 leads
  const isBeta = stats.total_leads < 50;

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div>
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="text-3xl font-bold text-slate_blue-600 mb-1">
            {isBeta ? '50+' : `${stats.total_leads}+`}
          </p>
          <p className="text-sm text-slate-600">
            {isBeta ? 'Companies in beta' : 'Audits completed'}
          </p>
        </div>
        <div>
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="text-3xl font-bold text-slate_blue-600 mb-1">
            {isBeta ? 'Beta' : formatCurrency(stats.total_waste_identified)}
          </p>
          <p className="text-sm text-slate-600">
            {isBeta ? 'Program active' : 'Waste identified'}
          </p>
        </div>
        <div>
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
          <p className="text-3xl font-bold text-slate_blue-600 mb-1">
            {isBeta ? '25%' : `${stats.avg_waste_percentage.toFixed(0)}%`}
          </p>
          <p className="text-sm text-slate-600">
            {isBeta ? 'Industry avg waste' : 'Average waste found'}
          </p>
        </div>
      </div>
      <p className="text-xs text-center text-slate-500 mt-4">
        Last updated: {new Date(stats.last_updated).toLocaleDateString()}
      </p>
    </div>
  );
}
