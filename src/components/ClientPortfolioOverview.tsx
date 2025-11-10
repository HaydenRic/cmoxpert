import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Activity,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  industry: string;
  status: string;
  health_status: string;
  health_score: number;
  company_size: string;
  contact_person?: string;
  contract_value: number;
  monthly_spend: number;
  onboarding_status: string;
  next_meeting_date?: string;
  last_report_date?: string;
  notes_count: number;
  created_at: string;
}

interface PortfolioStats {
  totalClients: number;
  activeClients: number;
  totalMRR: number;
  avgHealthScore: number;
  clientsNeedingAttention: number;
  upcomingMeetings: number;
  pendingOnboarding: number;
  reportsThisMonth: number;
}

interface HealthDistribution {
  thriving: number;
  stable: number;
  needs_attention: number;
  critical: number;
}

export function ClientPortfolioOverview() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalClients: 0,
    activeClients: 0,
    totalMRR: 0,
    avgHealthScore: 0,
    clientsNeedingAttention: 0,
    upcomingMeetings: 0,
    pendingOnboarding: 0,
    reportsThisMonth: 0
  });
  const [healthDist, setHealthDist] = useState<HealthDistribution>({
    thriving: 0,
    stable: 0,
    needs_attention: 0,
    critical: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_churned', false)
        .order('health_score', { ascending: false });

      if (error) throw error;

      const clientsList = clientsData || [];
      setClients(clientsList);

      const totalMRR = clientsList.reduce((sum, c) => sum + (c.contract_value || 0), 0);
      const avgHealth = clientsList.length > 0
        ? clientsList.reduce((sum, c) => sum + (c.health_score || 0), 0) / clientsList.length
        : 0;

      const needsAttention = clientsList.filter(
        c => c.health_status === 'needs_attention' || c.health_status === 'critical'
      ).length;

      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingMeetings = clientsList.filter(c => {
        if (!c.next_meeting_date) return false;
        const meetingDate = new Date(c.next_meeting_date);
        return meetingDate >= today && meetingDate <= weekFromNow;
      }).length;

      const pendingOnboarding = clientsList.filter(
        c => c.onboarding_status === 'pending' || c.onboarding_status === 'in_progress'
      ).length;

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const { count: reportCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      const distribution: HealthDistribution = {
        thriving: clientsList.filter(c => c.health_status === 'thriving').length,
        stable: clientsList.filter(c => c.health_status === 'stable').length,
        needs_attention: clientsList.filter(c => c.health_status === 'needs_attention').length,
        critical: clientsList.filter(c => c.health_status === 'critical').length
      };

      setStats({
        totalClients: clientsList.length,
        activeClients: clientsList.filter(c => c.status === 'active').length,
        totalMRR,
        avgHealthScore: Math.round(avgHealth),
        clientsNeedingAttention: needsAttention,
        upcomingMeetings,
        pendingOnboarding,
        reportsThisMonth: reportCount || 0
      });

      setHealthDist(distribution);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'thriving': return 'text-green-600 bg-green-50';
      case 'stable': return 'text-blue-600 bg-blue-50';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'thriving': return <TrendingUp className="w-5 h-5" />;
      case 'stable': return <CheckCircle className="w-5 h-5" />;
      case 'needs_attention': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <TrendingDown className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalClients}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeClients} active</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Briefcase className="w-6 h-6 text-slate-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total MRR</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${stats.totalMRR.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Monthly recurring</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgHealthScore}</p>
              <p className="text-xs text-gray-500 mt-1">Out of 100</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Need Attention</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.clientsNeedingAttention}</p>
              <p className="text-xs text-gray-500 mt-1">Require action</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Client Health Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Thriving</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{healthDist.thriving}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Stable</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{healthDist.stable}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Needs Attention</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{healthDist.needs_attention}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Critical</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{healthDist.critical}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming Meetings</p>
                <p className="text-lg font-semibold text-gray-800">{stats.upcomingMeetings} this week</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Onboarding</p>
                <p className="text-lg font-semibold text-gray-800">{stats.pendingOnboarding} clients</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reports This Month</p>
                <p className="text-lg font-semibold text-gray-800">{stats.reportsThisMonth} generated</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-slate-800">Client Portfolio</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Meeting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.industry}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getHealthColor(client.health_status)}`}>
                        {getHealthIcon(client.health_status)}
                        {client.health_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{client.health_score}</span>
                      <span className="text-xs text-gray-500">/100</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${client.contract_value?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.next_meeting_date
                        ? format(new Date(client.next_meeting_date), 'MMM dd, yyyy')
                        : 'Not scheduled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {client.notes_count || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
