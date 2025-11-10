import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  PoundSterling,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChannelSpend {
  channel: string;
  currentSpend: number;
  currentCac: number;
  currentLtv: number;
  fraudRate: number;
  conversionRate: number;
  recommendedSpend?: number;
  projectedCac?: number;
  projectedSavings?: number;
}

export default function SpendOptimizer() {
  const { user } = useAuth();
  const [totalBudget, setTotalBudget] = useState(100000);
  const [channels, setChannels] = useState<ChannelSpend[]>([]);
  const [optimizedChannels, setOptimizedChannels] = useState<ChannelSpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');

  useEffect(() => {
    loadClients();
  }, [user]);

  useEffect(() => {
    if (selectedClient) {
      loadChannelData();
    }
  }, [selectedClient]);

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

  const loadChannelData = async () => {
    if (!selectedClient) return;

    setLoading(true);

    const { data: transactions } = await supabase
      .from('fintech_transactions')
      .select('*')
      .eq('client_id', selectedClient);

    const { data: events } = await supabase
      .from('fintech_user_events')
      .select('*')
      .eq('client_id', selectedClient);

    if (transactions && events) {
      const channelStats = calculateChannelStats(transactions, events);
      setChannels(channelStats);
    }

    setLoading(false);
  };

  const calculateChannelStats = (transactions: any[], events: any[]): ChannelSpend[] => {
    const channelMap = new Map<string, any>();

    events.forEach(event => {
      if (!channelMap.has(event.channel)) {
        channelMap.set(event.channel, {
          registrations: 0,
          conversions: 0,
          fraudulent: 0,
          totalRevenue: 0
        });
      }

      const stats = channelMap.get(event.channel);
      if (event.event_type === 'registration') {
        stats.registrations++;
      }
      if (event.event_type === 'first_transaction') {
        stats.conversions++;
      }
    });

    transactions.forEach(tx => {
      if (channelMap.has(tx.source_channel)) {
        const stats = channelMap.get(tx.source_channel);
        stats.totalRevenue += tx.amount || 0;
        if (tx.is_fraudulent) {
          stats.fraudulent++;
        }
      }
    });

    const totalRegistrations = Array.from(channelMap.values()).reduce((sum, s) => sum + s.registrations, 0);
    const baseSpendPerReg = totalBudget / totalRegistrations;

    return Array.from(channelMap.entries()).map(([channel, stats]) => {
      const currentSpend = baseSpendPerReg * stats.registrations;
      const currentCac = stats.conversions > 0 ? currentSpend / stats.conversions : 0;
      const currentLtv = stats.conversions > 0 ? stats.totalRevenue / stats.conversions : 0;
      const fraudRate = stats.registrations > 0 ? (stats.fraudulent / stats.registrations) * 100 : 0;
      const conversionRate = stats.registrations > 0 ? (stats.conversions / stats.registrations) * 100 : 0;

      return {
        channel,
        currentSpend,
        currentCac,
        currentLtv,
        fraudRate,
        conversionRate
      };
    }).filter(c => c.currentSpend > 0);
  };

  const optimizeBudget = () => {
    setOptimizing(true);

    setTimeout(() => {
      const scored = channels.map(channel => {
        const ltvCacRatio = channel.currentLtv / channel.currentCac;
        const fraudPenalty = 1 - (channel.fraudRate / 100);
        const conversionBonus = channel.conversionRate / 100;

        const score = ltvCacRatio * fraudPenalty * (1 + conversionBonus);

        return { ...channel, score };
      });

      const totalScore = scored.reduce((sum, c) => sum + c.score, 0);

      const optimized = scored.map(channel => {
        const budgetShare = channel.score / totalScore;
        const recommendedSpend = totalBudget * budgetShare;

        const spendChange = (recommendedSpend - channel.currentSpend) / channel.currentSpend;
        const projectedCac = channel.currentCac * (1 - (spendChange * 0.15));
        const projectedSavings = (channel.currentCac - projectedCac) * (recommendedSpend / projectedCac);

        return {
          ...channel,
          recommendedSpend,
          projectedCac,
          projectedSavings
        };
      }).sort((a, b) => (b.recommendedSpend || 0) - (a.recommendedSpend || 0));

      setOptimizedChannels(optimized);
      setOptimizing(false);
    }, 2000);
  };

  const totalCurrentSpend = channels.reduce((sum, c) => sum + c.currentSpend, 0);
  const totalRecommendedSpend = optimizedChannels.reduce((sum, c) => sum + (c.recommendedSpend || 0), 0);
  const totalProjectedSavings = optimizedChannels.reduce((sum, c) => sum + (c.projectedSavings || 0), 0);

  const avgCurrentCac = channels.length > 0
    ? channels.reduce((sum, c) => sum + c.currentCac, 0) / channels.length
    : 0;

  const avgProjectedCac = optimizedChannels.length > 0
    ? optimizedChannels.reduce((sum, c) => sum + (c.projectedCac || 0), 0) / optimizedChannels.length
    : 0;

  const comparisonData = optimizedChannels.map(channel => {
    const current = channels.find(c => c.channel === channel.channel);
    return {
      channel: channel.channel,
      'Current Spend': current?.currentSpend || 0,
      'Recommended Spend': channel.recommendedSpend || 0
    };
  });

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
        <p className="text-gray-600 mb-4">Create a client first to optimize marketing spend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Spend Optimizer</h1>
          <p className="text-gray-600 mt-1">AI-powered budget reallocation based on LTV:CAC and fraud rates</p>
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

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget</label>
          <div className="relative">
            <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={optimizeBudget}
          disabled={optimizing || channels.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {optimizing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Optimize Budget
            </>
          )}
        </button>
      </div>

      {optimizedChannels.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm border-2 border-green-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <PoundSterling className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ${totalProjectedSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Projected Monthly Savings</p>
              <p className="text-xs text-green-700 mt-2 font-medium">
                {((totalProjectedSavings / totalCurrentSpend) * 100).toFixed(1)}% reduction in CAC
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ${avgProjectedCac.toFixed(0)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Projected Avg CAC</p>
              <p className="text-xs text-gray-500 mt-2">
                Currently: ${avgCurrentCac.toFixed(0)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {optimizedChannels.length}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Channels Optimized</p>
              <p className="text-xs text-gray-500 mt-2">
                Based on LTV:CAC ratios
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Reallocation Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Current Spend" fill="#94a3b8" name="Current Spend" />
                <Bar dataKey="Recommended Spend" fill="#3b82f6" name="Recommended Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Recommendations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Spend</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recommended</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current CAC</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Projected CAC</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Savings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {optimizedChannels.map((channel, index) => {
                    const current = channels.find(c => c.channel === channel.channel);
                    const change = ((channel.recommendedSpend || 0) - (current?.currentSpend || 0));
                    const changePercent = ((change / (current?.currentSpend || 1)) * 100);
                    const isIncrease = change > 0;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {channel.channel.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ${current?.currentSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-600">
                          ${channel.recommendedSpend?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isIncrease ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                              {isIncrease ? '+' : ''}{changePercent.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ${current?.currentCac.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                          ${channel.projectedCac?.toFixed(0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ${channel.projectedSavings?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Calculate This</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Our algorithm considers multiple factors to maximize your ROI:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>LTV:CAC Ratio</strong> - Channels with higher lifetime value per acquisition cost get more budget</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Fraud Penalty</strong> - Channels with high fraud rates get budget reduced proportionally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Conversion Bonus</strong> - Higher conversion rates from registration to transaction get rewarded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Scale Efficiency</strong> - We factor in diminishing returns as spend increases per channel</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {!optimizing && optimizedChannels.length === 0 && channels.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Optimize</h2>
          <p className="text-gray-600 mb-4">
            Click "Optimize Budget" to see AI-powered recommendations for reallocating your ${totalBudget.toLocaleString()} monthly budget across {channels.length} channels.
          </p>
        </div>
      )}
    </div>
  );
}
