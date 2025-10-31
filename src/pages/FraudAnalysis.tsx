import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SEOHead, pageMeta } from '../components/SEOHead';
import {
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface FraudMetrics {
  total_marketing_spend: number;
  fraud_waste: number;
  fraud_rate: number;
  clean_cac: number;
  dirty_cac: number;
  cac_improvement: number;
  by_channel: ChannelMetrics[];
  recommendations: string[];
}

interface ChannelMetrics {
  channel: string;
  spend: number;
  fraud_rate: number;
  fraud_waste: number;
  clean_cac: number;
  registrations: number;
  fraud_count: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function FraudAnalysis() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
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
      loadMetrics();
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

  const loadMetrics = async () => {
    if (!selectedClient) return;

    setAnalyzing(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-fraud-impact`;
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: selectedClient,
          date_range: dateRange
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading fraud metrics:', error);
    } finally {
      setAnalyzing(false);
    }
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
    if (!metrics) return;

    const csvContent = [
      ['Channel', 'Spend', 'Fraud Rate', 'Fraud Waste', 'Clean CAC'],
      ...metrics.by_channel.map(c => [
        c.channel,
        c.spend.toFixed(2),
        (c.fraud_rate * 100).toFixed(2) + '%',
        c.fraud_waste.toFixed(2),
        c.clean_cac.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-analysis-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</h2>
        <p className="text-gray-600 mb-4">Create a client first to start analyzing fraud patterns.</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead {...pageMeta.fraudAnalysis} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud Tax Analysis</h1>
          <p className="text-gray-600 mt-1">Track marketing spend wasted on fraudulent users by channel</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportData}
            disabled={!metrics}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={loadMetrics}
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

        {timeRange === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {analyzing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing fraud patterns across channels...</p>
        </div>
      )}

      {!analyzing && metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-600">
                  {(metrics.fraud_rate * 100).toFixed(1)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ${metrics.fraud_waste.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Fraud Waste</p>
              <p className="text-xs text-gray-500 mt-2">
                Marketing spend on fraudulent users
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ${metrics.total_marketing_spend.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Marketing Spend</p>
              <p className="text-xs text-gray-500 mt-2">
                Across all channels in period
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">
                  -${metrics.cac_improvement.toFixed(0)}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ${metrics.clean_cac.toFixed(0)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Clean CAC</p>
              <p className="text-xs text-gray-500 mt-2">
                After removing fraud waste
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Dirty</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ${metrics.dirty_cac.toFixed(0)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">CAC Before Cleanup</p>
              <p className="text-xs text-gray-500 mt-2">
                Including fraudulent users
              </p>
            </div>
          </div>

          {metrics.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {metrics.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Waste by Channel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.by_channel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(0)}`} />
                  <Bar dataKey="fraud_waste" fill="#ef4444" name="Fraud Waste" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Rate by Channel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.by_channel}
                    dataKey="fraud_count"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.channel}: ${(entry.fraud_rate * 100).toFixed(1)}%`}
                  >
                    {metrics.by_channel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
                      Total Spend
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fraud Waste
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fraud Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clean CAC
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrations
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.by_channel.map((channel, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {channel.channel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        ${channel.spend.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-medium">
                        ${channel.fraud_waste.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          channel.fraud_rate > 0.25
                            ? 'bg-red-100 text-red-800'
                            : channel.fraud_rate > 0.15
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {(channel.fraud_rate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        ${channel.clean_cac.toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {channel.registrations.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!analyzing && !metrics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">
            No fraud data found for the selected period. Try a different date range or ensure events are being tracked.
          </p>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry Analysis
          </button>
        </div>
      )}
    </div>
    </>
  );
}
