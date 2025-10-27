import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Target,
  Clock,
  Plus,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  Zap,
  Calendar,
  Percent
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface Deal {
  id: string;
  deal_name: string;
  stage: string;
  amount: number;
  close_date: string | null;
  marketing_influenced: boolean;
  marketing_sourced: boolean;
  lead_source: string | null;
  created_date: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  budget_allocated: number;
  actual_spend: number;
  revenue_generated: number;
  closed_won: number;
  status: string;
}

interface Attribution {
  channel: string;
  touchpoints: number;
  revenue: number;
  deals: number;
  cost: number;
  roi: number;
}

export function RevenueAttribution() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedModel, setSelectedModel] = useState('linear');

  // Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [marketingInfluencedRevenue, setMarketingInfluencedRevenue] = useState(0);
  const [marketingSourcedRevenue, setMarketingSourcedRevenue] = useState(0);
  const [avgDealSize, setAvgDealSize] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);

  const attributionModels = [
    { value: 'first_touch', label: 'First Touch', description: '100% credit to first interaction' },
    { value: 'last_touch', label: 'Last Touch', description: '100% credit to last interaction' },
    { value: 'linear', label: 'Linear', description: 'Equal credit across all touchpoints' },
    { value: 'time_decay', label: 'Time Decay', description: 'More credit to recent touchpoints' },
    { value: 'u_shaped', label: 'U-Shaped', description: '40% first, 40% last, 20% middle' },
    { value: 'w_shaped', label: 'W-Shaped', description: '30% first, 30% last, 30% opp creation, 10% middle' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = subDays(new Date(), parseInt(dateRange));

      // Load deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user!.id)
        .gte('created_date', format(startDate, 'yyyy-MM-dd'))
        .order('created_date', { ascending: false });

      if (dealsError) throw dealsError;

      // Load campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      setDeals(dealsData || []);
      setCampaigns(campaignsData || []);

      calculateMetrics(dealsData || []);
    } catch (error) {
      console.error('Error loading revenue attribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (dealsData: Deal[]) => {
    const closedWonDeals = dealsData.filter(d => d.stage === 'closed_won');
    const closedLostDeals = dealsData.filter(d => d.stage === 'closed_lost');
    const openDeals = dealsData.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));

    const totalRev = closedWonDeals.reduce((sum, d) => sum + d.amount, 0);
    const marketingInfluenced = closedWonDeals
      .filter(d => d.marketing_influenced)
      .reduce((sum, d) => sum + d.amount, 0);
    const marketingSourced = closedWonDeals
      .filter(d => d.marketing_sourced)
      .reduce((sum, d) => sum + d.amount, 0);

    const avgDeal = closedWonDeals.length > 0 ? totalRev / closedWonDeals.length : 0;
    const winRateCalc = closedWonDeals.length + closedLostDeals.length > 0
      ? (closedWonDeals.length / (closedWonDeals.length + closedLostDeals.length)) * 100
      : 0;
    const pipelineVal = openDeals.reduce((sum, d) => sum + d.amount, 0);

    setTotalRevenue(totalRev);
    setMarketingInfluencedRevenue(marketingInfluenced);
    setMarketingSourcedRevenue(marketingSourced);
    setAvgDealSize(avgDeal);
    setWinRate(winRateCalc);
    setPipelineValue(pipelineVal);
  };

  // Mock attribution data by channel
  const channelAttribution: Attribution[] = [
    {
      channel: 'Organic Search',
      touchpoints: 245,
      revenue: marketingInfluencedRevenue * 0.35,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.35),
      cost: 5000,
      roi: 6.2
    },
    {
      channel: 'Paid Search',
      touchpoints: 189,
      revenue: marketingInfluencedRevenue * 0.25,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.25),
      cost: 15000,
      roi: 4.8
    },
    {
      channel: 'Content',
      touchpoints: 312,
      revenue: marketingInfluencedRevenue * 0.20,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.20),
      cost: 8000,
      roi: 5.5
    },
    {
      channel: 'Email',
      touchpoints: 428,
      revenue: marketingInfluencedRevenue * 0.15,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.15),
      cost: 3000,
      roi: 8.1
    },
    {
      channel: 'Social',
      touchpoints: 156,
      revenue: marketingInfluencedRevenue * 0.05,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.05),
      cost: 7000,
      roi: 1.9
    }
  ];

  // Pipeline velocity chart data
  const pipelineVelocityData = [
    { stage: 'Lead', avgDays: 3, deals: deals.filter(d => d.stage === 'lead').length },
    { stage: 'Qualified', avgDays: 5, deals: deals.filter(d => d.stage === 'qualified').length },
    { stage: 'Demo', avgDays: 7, deals: deals.filter(d => d.stage === 'demo').length },
    { stage: 'Proposal', avgDays: 12, deals: deals.filter(d => d.stage === 'proposal').length },
    { stage: 'Negotiation', avgDays: 8, deals: deals.filter(d => d.stage === 'negotiation').length },
    { stage: 'Closed', avgDays: 0, deals: deals.filter(d => d.stage === 'closed_won').length }
  ];

  // Revenue trend data
  const revenueTrendData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subDays(new Date(), i * 30));
    const monthEnd = endOfMonth(monthStart);
    const monthDeals = deals.filter(d => {
      const dealDate = new Date(d.created_date);
      return dealDate >= monthStart && dealDate <= monthEnd && d.stage === 'closed_won';
    });
    return {
      month: format(monthStart, 'MMM'),
      revenue: monthDeals.reduce((sum, d) => sum + d.amount, 0) / 1000,
      deals: monthDeals.length
    };
  }).reverse();

  const COLORS = ['#22333B', '#5C8374', '#C9ADA7', '#F2E9E4', '#EAE0D5'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate_blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Revenue Attribution</h1>
          <p className="text-slate-600">Track marketing's influence on pipeline and closed revenue</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
          >
            {attributionModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Attribution Model Info */}
      <div className="mb-6 bg-slate_blue-50 border border-slate_blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-slate_blue-600" />
          <div>
            <p className="font-medium text-slate_blue-900">
              {attributionModels.find(m => m.value === selectedModel)?.label} Attribution Model
            </p>
            <p className="text-sm text-slate_blue-700">
              {attributionModels.find(m => m.value === selectedModel)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${(totalRevenue / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-green-600 flex items-center justify-end">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +23%
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate_blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${(marketingInfluencedRevenue / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-slate-500">
                {totalRevenue > 0 ? ((marketingInfluencedRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Marketing Influenced</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-tan-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ${(pipelineValue / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-slate-500">
                {deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length} deals
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Pipeline Value</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-charcoal-600 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500">
                Avg: ${(avgDealSize / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Win Rate</h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Channel Attribution */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue by Channel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelAttribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="channel" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `$${(value / 1000).toFixed(1)}K`}
              />
              <Bar dataKey="revenue" fill="#22333B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Velocity */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Pipeline Velocity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pipelineVelocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="avgDays" stroke="#5C8374" fill="#5C8374" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value: number) => `$${value}K`}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#22333B" strokeWidth={2} name="Revenue ($K)" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200">
        <div className="p-6 border-b border-cream-200">
          <h2 className="text-lg font-semibold text-slate-900">Channel Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Channel</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Touchpoints</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Deals</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {channelAttribution.map((channel, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-slate-900">{channel.channel}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-700">
                    {channel.touchpoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                    ${(channel.revenue / 1000).toFixed(1)}K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-700">
                    {channel.deals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-700">
                    ${(channel.cost / 1000).toFixed(1)}K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${channel.roi >= 3 ? 'text-green-600' : channel.roi >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {channel.roi.toFixed(1)}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
