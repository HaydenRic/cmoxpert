import { supabase } from './supabase';

export interface Competitor {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  industry?: string;
  monitoring_enabled: boolean;
  last_funding_round?: string;
  last_funding_amount?: number;
  last_job_count?: number;
  last_check_at?: string;
  created_at: string;
}

export interface CompetitorAlert {
  id: string;
  competitor_id: string;
  user_id: string;
  alert_type: 'funding' | 'pricing_change' | 'product_launch' | 'hiring_surge' | 'market_move';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
  competitor?: Competitor;
}

export async function addCompetitor(data: {
  userId: string;
  name: string;
  domain: string;
  industry?: string;
}): Promise<{ success: boolean; competitor?: Competitor; error?: string }> {
  try {
    const { data: competitor, error } = await supabase
      .from('competitors')
      .insert({
        user_id: data.userId,
        name: data.name,
        domain: data.domain,
        industry: data.industry,
        monitoring_enabled: true
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, competitor };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCompetitors(userId: string): Promise<Competitor[]> {
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching competitors:', error);
    return [];
  }

  return data || [];
}

export async function getCompetitorAlerts(userId: string, limit = 50): Promise<CompetitorAlert[]> {
  const { data, error } = await supabase
    .from('competitor_alerts')
    .select(`
      *,
      competitor:competitors(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }

  return data || [];
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  await supabase
    .from('competitor_alerts')
    .update({ is_read: true })
    .eq('id', alertId);
}

export async function triggerCompetitiveScan(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/competitive-intelligence-scraper`;
    const { data: sessionData } = await supabase.auth.getSession();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId })
    });

    if (!response.ok) {
      throw new Error('Scan failed');
    }

    const result = await response.json();
    return {
      success: true,
      message: `Scanned ${result.scanned} competitors, created ${result.alerts_created} new alerts`
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCompetitor(competitorId: string): Promise<void> {
  await supabase
    .from('competitors')
    .delete()
    .eq('id', competitorId);
}

export async function toggleCompetitorMonitoring(
  competitorId: string,
  enabled: boolean
): Promise<void> {
  await supabase
    .from('competitors')
    .update({ monitoring_enabled: enabled })
    .eq('id', competitorId);
}
