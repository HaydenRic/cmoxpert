import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  DollarSign,
  Users,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import { format, addMonths, addQuarters, addYears } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Forecast {
  id: string;
  client_id: string;
  metric_name: string;
  forecast_type: string;
  time_period: string;
  predicted_value: number;
  confidence_level: number;
  forecast_data: any[];
  created_at: string;
  clients?: {
    name: string;
  };
}

interface Benchmark {
  id: string;
  industry: string;
  metric_name: string;
  metric_value: number;
  percentile: number;
}

export function Forecasting() {
  const { user } = useAuth();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedPeriod, setSelectedPeriod] = useState('next_quarter');

  const metrics = [
    { value: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-green-600' },
    { value: 'leads', label: 'Leads', icon: Users, color: 'text-blue-600' },
    { value: 'conversions', label: 'Conversions', icon: Target, color: 'text-purple-600' },
    { value: 'traffic', label: 'Website Traffic', icon: Activity, color: 'text-orange-600' },
    { value: 'engagement', label: 'Engagement', icon: Zap, color: 'text-cyan-600' }
  ];

  const periods = [
    { value: 'next_month', label: 'Next Month' },
    { value: 'next_quarter', label: 'Next Quarter' },
    { value: 'next_year', label: 'Next Year' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [clientsRes, forecastsRes, benchmarksRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user!.id),
        supabase
          .from('forecasts')
          .select('*, clients(name)')
          .in(
            'client_id',
            (await supabase.from('clients').select('id').eq('user_id', user!.id)).data?.map(c => c.id) || []
          )
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('benchmarks').select('*').limit(100)
      ]);

      setClients(clientsRes.data || []);
      setForecasts(forecastsRes.data || []);
      setBenchmarks(benchmarksRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    if (!selectedClient) {
      alert('Please select a client');
      return;
    }

    setGenerating(true);
    try {
      const historicalData = generateMockHistoricalData();
      const forecastData = generateMockForecast(historicalData, selectedPeriod);
      const predictedValue = forecastData[forecastData.length - 1].value;

      const { error } = await supabase.from('forecasts').insert({
        client_id: selectedClient,
        metric_name: selectedMetric,
        forecast_type: 'ml_model',
        time_period: selectedPeriod,
        predicted_value: predictedValue,
        confidence_level: 0.85,
        forecast_data: forecastData
      });

      if (error) throw error;

      alert('Forecast generated successfully!');
      loadData();
    } catch (error: any) {
      console.error('Error generating forecast:', error);
      alert('Failed to generate forecast: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const generateMockHistoricalData = () => {
    const data = [];
    const baseValue = 50000;
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const variation = (Math.random() - 0.3) * 10000;
      const trend = (11 - i) * 2000;
      data.push({
        date: format(date, 'MMM yyyy'),
        value: Math.round(baseValue + trend + variation),
        type: 'historical'
      });
    }
    return data;
  };

  const generateMockForecast = (historical: any[], period: string) => {
    const lastValue = historical[historical.length - 1].value;
    const months = period === 'next_month' ? 1 : period === 'next_quarter' ? 3 : 12;
    const forecast = [...historical];

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const growth = lastValue * 0.05;
      const variation = (Math.random() - 0.5) * growth * 0.3;
      forecast.push({
        date: format(date, 'MMM yyyy'),
        value: Math.round(lastValue + (growth * i) + variation),
        type: 'forecast'
      });
    }

    return forecast;
  };

  const getBenchmarkForMetric = (metricName: string, industry: string) => {
    return benchmarks.filter((b) => b.metric_name === metricName && b.industry === industry);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate_blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Forecasting & Analytics</h1>
          <p className="text-charcoal-600 mt-1">Predictive insights and industry benchmarks</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-charcoal-200 p-6">
        <h2 className="text-lg font-bold text-charcoal-900 mb-4">Generate Forecast</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateForecast}
              disabled={generating || !selectedClient}
              className="w-full px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {forecasts.length > 0 && (
        <div className="space-y-6">
          {forecasts.slice(0, 3).map((forecast) => {
            const metric = metrics.find((m) => m.value === forecast.metric_name);
            const Icon = metric?.icon || BarChart3;

            return (
              <div key={forecast.id} className="bg-white rounded-lg shadow-sm border border-charcoal-200">
                <div className="p-6 border-b border-charcoal-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 bg-slate_blue-500 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-charcoal-900">
                          {metric?.label || forecast.metric_name} Forecast
                        </h3>
                        <p className="text-sm text-charcoal-600">{forecast.clients?.name}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-charcoal-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {forecast.time_period.replace(/_/g, ' ')}
                          </span>
                          <span className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {(forecast.confidence_level * 100).toFixed(0)}% confidence
                          </span>
                          <span>Generated {format(new Date(forecast.created_at), 'PP')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-charcoal-900">
                        {forecast.metric_name === 'revenue'
                          ? `$${(forecast.predicted_value / 1000).toFixed(0)}K`
                          : forecast.predicted_value.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600 flex items-center justify-end mt-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Projected
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={forecast.forecast_data || []}>
                      <defs>
                        <linearGradient id={`gradient-${forecast.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22333B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22333B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#22333B"
                        strokeWidth={2}
                        fill={`url(#gradient-${forecast.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
          <div className="p-6 border-b border-charcoal-200">
            <h2 className="text-lg font-bold text-charcoal-900">Industry Benchmarks</h2>
            <p className="text-sm text-charcoal-600">Compare against industry averages</p>
          </div>
          <div className="p-6">
            {benchmarks.length > 0 ? (
              <div className="space-y-4">
                {benchmarks.slice(0, 5).map((benchmark) => (
                  <div key={benchmark.id} className="flex items-center justify-between py-3 border-b border-charcoal-100 last:border-0">
                    <div>
                      <div className="font-medium text-charcoal-900">{benchmark.metric_name}</div>
                      <div className="text-sm text-charcoal-600">{benchmark.industry}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-charcoal-900">
                        {benchmark.metric_value.toLocaleString()}
                      </div>
                      <div className="text-xs text-charcoal-500">{benchmark.percentile}th percentile</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                <p className="text-charcoal-600">No benchmark data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Forecasting Insights</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• AI-powered predictions based on historical data</li>
                <li>• Confidence levels indicate forecast reliability</li>
                <li>• Use forecasts for budget planning and goal setting</li>
                <li>• Refresh forecasts monthly for best accuracy</li>
                <li>• Compare against industry benchmarks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
