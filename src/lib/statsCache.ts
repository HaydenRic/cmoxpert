import { supabase } from './supabase';

export interface PlatformStats {
  total_leads: number;
  total_waste_identified: number;
  avg_waste_percentage: number;
  total_clients: number;
  last_updated: string;
}

let cachedStats: PlatformStats | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getPlatformStats(): Promise<PlatformStats> {
  const now = Date.now();

  // Return cached stats if still valid
  if (cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedStats;
  }

  try {
    // Fetch audit submissions
    const { data: audits, error: auditsError } = await supabase
      .from('marketing_audits')
      .select('monthly_ad_spend, audit_results');

    if (auditsError) throw auditsError;

    // Fetch client count from profiles
    const { count: clientCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (clientsError) throw clientsError;

    // Calculate stats
    const totalLeads = audits?.length || 0;
    let totalWaste = 0;
    let totalSpend = 0;

    audits?.forEach(audit => {
      if (audit.audit_results?.estimated_waste) {
        totalWaste += audit.audit_results.estimated_waste;
      }
      if (audit.monthly_ad_spend) {
        totalSpend += audit.monthly_ad_spend;
      }
    });

    const avgWastePercentage = totalSpend > 0
      ? (totalWaste / totalSpend) * 100
      : 0;

    const stats: PlatformStats = {
      total_leads: totalLeads,
      total_waste_identified: totalWaste,
      avg_waste_percentage: avgWastePercentage,
      total_clients: clientCount || 0,
      last_updated: new Date().toISOString()
    };

    // Update cache
    cachedStats = stats;
    cacheTimestamp = now;

    return stats;
  } catch (error) {
    console.error('Error fetching platform stats:', error);

    // Return fallback stats if query fails
    return {
      total_leads: 0,
      total_waste_identified: 0,
      avg_waste_percentage: 0,
      total_clients: 0,
      last_updated: new Date().toISOString()
    };
  }
}

export function clearStatsCache() {
  cachedStats = null;
  cacheTimestamp = 0;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function getStatsDisplayText(stats: PlatformStats) {
  const MIN_THRESHOLD = 50;

  if (stats.total_leads < MIN_THRESHOLD) {
    return {
      leadsText: `Join ${Math.max(50, stats.total_leads)}+ companies`,
      wasteText: 'Beta Program',
      avgWasteText: 'Industry Avg: 25%',
      showBetaBadge: true
    };
  }

  return {
    leadsText: `${stats.total_leads}+ Audits Completed`,
    wasteText: formatCurrency(stats.total_waste_identified),
    avgWasteText: `${stats.avg_waste_percentage.toFixed(0)}% Avg Waste`,
    showBetaBadge: false
  };
}
