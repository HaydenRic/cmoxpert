import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  FileCheck,
  Link as LinkIcon,
  CreditCard,
  TrendingDown,
  Filter,
  Download,
  RefreshCw,
  Target,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  drop_off_rate: number;
  avg_time_to_next?: number;
}

interface ChannelFunnel {
  channel: string;
  stages: FunnelStage[];
  total_started: number;
  total_completed: number;
  completion_rate: number;
}

const STAGE_COLORS = {
  registration: '#3b82f6',
  kyc_started: '#8b5cf6',
  kyc_passed: '#10b981',
  bank_linked: '#f59e0b',
  first_transaction: '#ef4444'
};

const STAGE_ICONS = {
  registration: Users,
  kyc_started: FileCheck,
  kyc_passed: FileCheck,
  bank_linked: LinkIcon,
  first_transaction: CreditCard
};

export default function ActivationFunnel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [funnelData, setFunnelData] = useState<ChannelFunnel[]>([]);
  const [overallFunnel, setOverallFunnel] = useState<FunnelStage[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clients, setClients] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');

  useEffect(() => {
    loadClients();
  }, [user]);

  useEffect(() => {
    if (selectedClient) {
      loadFunnelData();
    }
  }, [selectedClient, dateRange]);

  const loadClients = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('id, name, industry')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClients(data);
      if (data.length > 0) {
        setSelectedClient(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadFunnelData = async () => {
    if (!selectedClient) return;

    setAnalyzing(true);
    try {
      const { data: events, error } = await supabase
        .from('fintech_user_events')
        .select('*')
        .eq('client_id', selectedClient)
        .gte('event_timestamp', dateRange.start_date)
        .lte('event_timestamp', dateRange.end_date)
        .order('event_timestamp', { ascending: true });

      if (error) throw error;

      if (events && events.length > 0) {
        processActivationData(events);
      }
    } catch (error) {
      console.error('Error loading funnel data:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const processActivationData = (events: any[]) => {
    const userJourneys = new Map();
    const channelData = new Map();

    events.forEach(event => {
      if (!userJourneys.has(event.user_id)) {
        userJourneys.set(event.user_id, {
          channel: event.channel,
          stages: new Set(),
          timestamps: {}
        });
      }

      const journey = userJourneys.get(event.user_id);
      journey.stages.add(event.event_type);
      journey.timestamps[event.event_type] = new Date(event.event_timestamp);
    });

    const overall = {
      registration: 0,
      kyc_started: 0,
      kyc_passed: 0,
      bank_linked: 0,
      first_transaction: 0
    };

    userJourneys.forEach(journey => {
      if (!channelData.has(journey.channel)) {
        channelData.set(journey.channel, {
          registration: 0,
          kyc_started: 0,
          kyc_passed: 0,
          bank_linked: 0,
          first_transaction: 0
        });
      }

      const channelStats = channelData.get(journey.channel);

      if (journey.stages.has('registration')) {
        channelStats.registration++;
        overall.registration++;
      }
      if (journey.stages.has('kyc_started')) {
        channelStats.kyc_started++;
        overall.kyc_started++;
      }
      if (journey.stages.has('kyc_passed')) {
        channelStats.kyc_passed++;
        overall.kyc_passed++;
      }
      if (journey.stages.has('bank_linked')) {
        channelStats.bank_linked++;
        overall.bank_linked++;
      }
      if (journey.stages.has('first_transaction')) {
        channelStats.first_transaction++;
        overall.first_transaction++;
      }
    });

    const overallStages: FunnelStage[] = [
      { stage: 'Registration', count: overall.registration, percentage: 100, drop_off_rate: 0 },
      {
        stage: 'KYC Started',
        count: overall.kyc_started,
        percentage: (overall.kyc_started / overall.registration) * 100,
        drop_off_rate: ((overall.registration - overall.kyc_started) / overall.registration) * 100
      },
      {
        stage: 'KYC Passed',
        count: overall.kyc_passed,
        percentage: (overall.kyc_passed / overall.registration) * 100,
        drop_off_rate: ((overall.kyc_started - overall.kyc_passed) / overall.kyc_started) * 100
      },
      {
        stage: 'Bank Linked',
        count: overall.bank_linked,
        percentage: (overall.bank_linked / overall.registration) * 100,
        drop_off_rate: ((overall.kyc_passed - overall.bank_linked) / overall.kyc_passed) * 100
      },
      {
        stage: 'First Transaction',
        count: overall.first_transaction,
        percentage: (overall.first_transaction / overall.registration) * 100,
        drop_off_rate: ((overall.bank_linked - overall.first_transaction) / overall.bank_linked) * 100
      }
    ];

    setOverallFunnel(overallStages);

    const channelFunnels: ChannelFunnel[] = Array.from(channelData.entries()).map(([channel, stats]) => {
      const stages: FunnelStage[] = [
        { stage: 'Registration', count: stats.registration, percentage: 100, drop_off_rate: 0 },
        {
          stage: 'KYC Started',
          count: stats.kyc_started,
          percentage: (stats.kyc_started / stats.registration) * 100,
          drop_off_rate: ((stats.registration - stats.kyc_started) / stats.registration) * 100
        },
        {
          stage: 'KYC Passed',
          count: stats.kyc_passed,
          percentage: (stats.kyc_passed / stats.registration) * 100,
          drop_off_rate: ((stats.kyc_started - stats.kyc_passed) / stats.kyc_started) * 100
        },
        {
          stage: 'Bank Linked',
          count: stats.bank_linked,
          percentage: (stats.bank_linked / stats.registration) * 100,
          drop_off_rate: ((stats.kyc_passed - stats.bank_linked) / stats.kyc_passed) * 100
        },
        {
          stage: 'First Transaction',
          count: stats.first_transaction,
          percentage: (stats.first_transaction / stats.registration) * 100,
          drop_off_rate: ((stats.bank_linked - stats.first_transaction) / stats.bank_linked) * 100
        }
      ];

      return {
        channel,
        stages,
        total_started: stats.registration,
        total_completed: stats.first_transaction,
        completion_rate: (stats.first_transaction / stats.registration) * 100
      };
    });

    setFunnelData(channelFunnels);
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | 'custom') => {
    setTimeRange(range);
    if (range !== 'custom') {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      setDateRange({
        start_date: format(subDays(new Date(), days), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  };

  const exportData = () => {
    if (overallFunnel.length === 0) return;

    const csvContent = [
      ['Stage', 'Count', 'Percentage', 'Drop-off Rate'],
      ...overallFunnel.map(s => [
        s.stage,
        s.count.toString(),
        s.percentage.toFixed(2) + '%',
        s.drop_off_rate.toFixed(2) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activation-funnel-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</h2>
        <p className="text-gray-600 mb-4">Create a client first to start analyzing activation funnels.</p>
      </div>
    );
  }

  const overallCompletionRate = overallFunnel.length > 0
    ? (overallFunnel[overallFunnel.length - 1].percentage)
    : 0;

  const biggestDropOff = overallFunnel.length > 0
    ? overallFunnel.reduce((max, stage) => stage.drop_off_rate > max.drop_off_rate ? stage : max)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activation Funnel</h1>
          <p className="text-gray-600 mt-1">Track user journey from registration to first transaction</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportData}
            disabled={overallFunnel.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={loadFunnelData}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} {client.industry ? `(${client.industry})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleTimeRangeChange('7d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => handleTimeRangeChange('30d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => handleTimeRangeChange('90d')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {analyzing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing activation funnel...</p>
        </div>
      )}

      {!analyzing && overallFunnel.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {overallFunnel[0]?.count.toLocaleString() || 0}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Total Registrations</p>
              <p className="text-xs text-gray-500 mt-2">
                Users who started the journey
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">
                  {overallCompletionRate.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {overallFunnel[overallFunnel.length - 1]?.count.toLocaleString() || 0}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Completed Activation</p>
              <p className="text-xs text-gray-500 mt-2">
                Users with first transaction
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-600">
                  {biggestDropOff?.drop_off_rate.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {biggestDropOff?.stage || 'N/A'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Biggest Drop-off</p>
              <p className="text-xs text-gray-500 mt-2">
                Stage with highest abandonment
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Overall Activation Funnel</h3>
            <div className="space-y-4">
              {overallFunnel.map((stage, index) => {
                const StageIcon = STAGE_ICONS[stage.stage.toLowerCase().replace(' ', '_') as keyof typeof STAGE_ICONS] || Target;
                return (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ backgroundColor: `${Object.values(STAGE_COLORS)[index]}20` }}>
                        <StageIcon className="w-6 h-6" style={{ color: Object.values(STAGE_COLORS)[index] }} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              {stage.count.toLocaleString()} users ({stage.percentage.toFixed(1)}%)
                            </span>
                            {stage.drop_off_rate > 0 && (
                              <span className="text-sm text-red-600 font-medium">
                                -{stage.drop_off_rate.toFixed(1)}% drop-off
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${stage.percentage}%`,
                              backgroundColor: Object.values(STAGE_COLORS)[index]
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {index < overallFunnel.length - 1 && (
                      <div className="ml-6 my-2 pl-6 border-l-2 border-gray-200 h-4"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {funnelData.length > 0 && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate by Channel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="completion_rate" fill="#10b981" name="Completion Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Channel Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Started
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {funnelData.map((channel, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {channel.channel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {channel.total_started.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {channel.total_completed.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              channel.completion_rate > 40
                                ? 'bg-green-100 text-green-800'
                                : channel.completion_rate > 25
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {channel.completion_rate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {!analyzing && overallFunnel.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">
            No activation data found for the selected period. User events will appear here once tracked.
          </p>
          <button
            onClick={loadFunnelData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry Analysis
          </button>
        </div>
      )}
    </div>
  );
}
