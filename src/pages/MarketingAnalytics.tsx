import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Calendar, 
  Filter, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Zap,
  Users
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { 
  LineChart as RechartsLineChart, 
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
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface Campaign {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget: number;
  spend: number;
  status: string;
  channel: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  };
}

interface CampaignMetric {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
}

interface MarketingGoal {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date?: string;
  status: string;
  clients?: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
}

interface DashboardStats {
  totalSpend: number;
  totalRevenue: number;
  totalROI: number;
  activeCampaigns: number;
  completedGoals: number;
  averageCPC: number;
  averageConversionRate: number;
  topPerformingChannel: string;
}

export function MarketingAnalytics() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetric[]>([]);
  const [goals, setGoals] = useState<MarketingGoal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSpend: 0,
    totalRevenue: 0,
    totalROI: 0,
    activeCampaigns: 0,
    completedGoals: 0,
    averageCPC: 0,
    averageConversionRate: 0,
    topPerformingChannel: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    client_id: '',
    name: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
    budget: 0,
    channel: 'social_media',
    status: 'draft'
  });
  const [newGoal, setNewGoal] = useState({
    client_id: '',
    name: '',
    description: '',
    target_value: 0,
    current_value: 0,
    unit: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), 'yyyy-MM-dd')
  });

  const channelOptions = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'search_ads', label: 'Search Ads' },
    { value: 'display_ads', label: 'Display Ads' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'content', label: 'Content Marketing' },
    { value: 'seo', label: 'SEO' },
    { value: 'events', label: 'Events' },
    { value: 'affiliate', label: 'Affiliate Marketing' },
    { value: 'direct', label: 'Direct Marketing' }
  ];

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedClient, selectedDateRange, selectedChannel]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');

      setClients(clientsData || []);

      // Build client filter
      const clientFilter = selectedClient === 'all' 
        ? clientsData?.map(c => c.id) || []
        : [selectedClient];

      // Calculate date range
      const dateFilter = getDateRangeFilter(selectedDateRange);

      // Load campaigns
      let campaignQuery = supabase
        .from('marketing_campaigns')
        .select(`
          *,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user!.id);

      if (selectedClient !== 'all') {
        campaignQuery = campaignQuery.eq('client_id', selectedClient);
      }

      if (selectedChannel !== 'all') {
        campaignQuery = campaignQuery.eq('channel', selectedChannel);
      }

      if (dateFilter.start && dateFilter.end) {
        campaignQuery = campaignQuery.gte('start_date', dateFilter.start.toISOString());
      }

      const { data: campaignsData } = await campaignQuery.order('start_date', { ascending: false });

      setCampaigns(campaignsData || []);

      // Load campaign metrics
      if (campaignsData && campaignsData.length > 0) {
        const campaignIds = campaignsData.map(c => c.id);
        
        const { data: metricsData } = await supabase
          .from('campaign_metrics')
          .select('*')
          .in('campaign_id', campaignIds)
          .order('date', { ascending: false });

        setMetrics(metricsData || []);
      } else {
        setMetrics([]);
      }

      // Load marketing goals
      let goalsQuery = supabase
        .from('marketing_goals')
        .select(`
          *,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user!.id);

      if (selectedClient !== 'all') {
        goalsQuery = goalsQuery.eq('client_id', selectedClient);
      }

      const { data: goalsData } = await goalsQuery.order('created_at', { ascending: false });

      setGoals(goalsData || []);

      // Calculate dashboard stats
      calculateStats(campaignsData || [], metricsData || [], goalsData || []);

    } catch (error) {
      console.error('Error loading marketing analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = (range: string) => {
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = today;

    switch (range) {
      case '7days':
        start = subDays(today, 7);
        break;
      case '30days':
        start = subDays(today, 30);
        break;
      case '90days':
        start = subDays(today, 90);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'all':
        start = null;
        break;
    }

    return { start, end };
  };

  const calculateStats = (campaignsData: Campaign[], metricsData: CampaignMetric[], goalsData: MarketingGoal[]) => {
    // Calculate basic stats
    const totalSpend = campaignsData.reduce((sum, campaign) => sum + (campaign.spend || 0), 0);
    const totalRevenue = metricsData.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const totalROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const activeCampaigns = campaignsData.filter(c => c.status === 'active').length;
    const completedGoals = goalsData.filter(g => g.status === 'completed').length;

    // Calculate average CPC and conversion rate
    const totalClicks = metricsData.reduce((sum, metric) => sum + (metric.clicks || 0), 0);
    const totalConversions = metricsData.reduce((sum, metric) => sum + (metric.conversions || 0), 0);
    const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const averageConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Find top performing channel
    const channelPerformance = campaignsData.reduce((acc, campaign) => {
      const channel = campaign.channel;
      const campaignMetrics = metricsData.filter(m => m.campaign_id === campaign.id);
      const revenue = campaignMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
      const spend = campaignMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
      const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

      if (!acc[channel]) {
        acc[channel] = { revenue, spend, roi };
      } else {
        acc[channel].revenue += revenue;
        acc[channel].spend += spend;
        acc[channel].roi = acc[channel].spend > 0 
          ? ((acc[channel].revenue - acc[channel].spend) / acc[channel].spend) * 100 
          : 0;
      }

      return acc;
    }, {} as Record<string, { revenue: number, spend: number, roi: number }>);

    const topPerformingChannel = Object.entries(channelPerformance)
      .sort(([, a], [, b]) => b.roi - a.roi)
      .map(([channel]) => channel)[0] || '';

    setStats({
      totalSpend,
      totalRevenue,
      totalROI,
      activeCampaigns,
      completedGoals,
      averageCPC,
      averageConversionRate,
      topPerformingChannel
    });
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .insert([{
          ...newCampaign,
          start_date: new Date(newCampaign.start_date).toISOString(),
          end_date: newCampaign.end_date ? new Date(newCampaign.end_date).toISOString() : null
        }]);

      if (error) throw error;

      setNewCampaign({
        client_id: '',
        name: '',
        description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
        budget: 0,
        channel: 'social_media',
        status: 'draft'
      });
      setShowAddCampaign(false);
      loadData();
    } catch (error) {
      console.error('Error adding campaign:', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('marketing_goals')
        .insert([{
          ...newGoal,
          start_date: new Date(newGoal.start_date).toISOString(),
          end_date: newGoal.end_date ? new Date(newGoal.end_date).toISOString() : null
        }]);

      if (error) throw error;

      setNewGoal({
        client_id: '',
        name: '',
        description: '',
        target_value: 0,
        current_value: 0,
        unit: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 3)), 'yyyy-MM-dd')
      });
      setShowAddGoal(false);
      loadData();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('marketing_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const updateGoalValue = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('marketing_goals')
        .update({ current_value: newValue, updated_at: new Date().toISOString() })
        .eq('id', goalId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating goal value:', error);
    }
  };

  const formatCurrency = (amount: number, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChannelLabel = (channelValue: string) => {
    const channel = channelOptions.find(c => c.value === channelValue);
    return channel ? channel.label : channelValue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-slate-100 text-slate-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getGoalProgress = (goal: MarketingGoal) => {
    const percentage = goal.target_value > 0 
      ? (goal.current_value / goal.target_value) * 100 
      : 0;
    
    return {
      percentage: Math.min(percentage, 100),
      color: percentage >= 100 
        ? 'bg-green-500' 
        : percentage >= 75 
        ? 'bg-blue-500' 
        : percentage >= 50 
        ? 'bg-yellow-500' 
        : 'bg-red-500'
    };
  };

  // Prepare chart data
  const revenueSpendData = metrics.reduce((acc, metric) => {
    const date = format(new Date(metric.date), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.revenue += metric.revenue || 0;
      existing.spend += metric.cost || 0;
    } else {
      acc.push({
        date,
        revenue: metric.revenue || 0,
        spend: metric.cost || 0
      });
    }
    
    return acc;
  }, [] as any[])
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .slice(-14); // Last 14 days

  const channelPerformanceData = campaigns.reduce((acc, campaign) => {
    const channel = getChannelLabel(campaign.channel);
    const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
    const revenue = campaignMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const spend = campaignMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;
    
    const existing = acc.find(item => item.channel === channel);
    
    if (existing) {
      existing.revenue += revenue;
      existing.spend += spend;
      existing.roi = existing.spend > 0 
        ? ((existing.revenue - existing.spend) / existing.spend) * 100 
        : 0;
    } else {
      acc.push({
        channel,
        revenue,
        spend,
        roi
      });
    }
    
    return acc;
  }, [] as any[])
  .sort((a, b) => b.roi - a.roi);

  const conversionData = metrics.reduce((acc, metric) => {
    const date = format(new Date(metric.date), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.clicks += metric.clicks || 0;
      existing.conversions += metric.conversions || 0;
      existing.rate = existing.clicks > 0 
        ? (existing.conversions / existing.clicks) * 100 
        : 0;
    } else {
      acc.push({
        date,
        clicks: metric.clicks || 0,
        conversions: metric.conversions || 0,
        rate: metric.clicks > 0 
          ? (metric.conversions / metric.clicks) * 100 
          : 0
      });
    }
    
    return acc;
  }, [] as any[])
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .slice(-14); // Last 14 days

  const goalStatusData = [
    { name: 'Completed', value: goals.filter(g => g.status === 'completed').length, color: '#10b981' },
    { name: 'Active', value: goals.filter(g => g.status === 'active').length, color: '#3b82f6' },
    { name: 'Cancelled', value: goals.filter(g => g.status === 'cancelled').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: formatPercentage(stats.totalROI),
      changeType: stats.totalROI >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'bg-slate_blue-600'
    },
    {
      title: 'Marketing Spend',
      value: formatCurrency(stats.totalSpend),
      change: `${stats.activeCampaigns} active campaigns`,
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'bg-tan-600'
    },
    {
      title: 'Avg. Conversion Rate',
      value: `${stats.averageConversionRate.toFixed(1)}%`,
      change: `${stats.averageCPC > 0 ? formatCurrency(stats.averageCPC) : '£0'} CPC`,
      changeType: 'neutral',
      icon: Target,
      color: 'bg-olive-600'
    },
    {
      title: 'Marketing Goals',
      value: goals.length.toString(),
      change: `${stats.completedGoals} completed`,
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-charcoal-700'
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cream-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-cream-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Marketing Analytics</h1>
          <p className="text-slate-600">Track campaign performance, ROI, and marketing goals</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
            >
              <option value="all">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-500" />
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
            >
              <option value="all">All Channels</option>
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={loadData}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddCampaign(true)}
              className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Campaign</span>
            </button>
            
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-tan-600 hover:bg-tan-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className={`text-sm flex items-center justify-end ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {stat.changeType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.changeType === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
                  {stat.change}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600">{stat.title}</h3>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Spend */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Revenue vs Spend</h2>
            <div className="text-sm text-slate-500">{selectedDateRange} view</div>
          </div>
          
          {revenueSpendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueSpendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#22333B" 
                  fill="#22333B" 
                  fillOpacity={0.6} 
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stackId="2" 
                  stroke="#5E503F" 
                  fill="#5E503F" 
                  fillOpacity={0.6} 
                  name="Spend"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No revenue data available</p>
                <p className="text-sm">Add campaign metrics to see revenue trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Channel Performance (ROI)</h2>
          </div>
          
          {channelPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="channel" type="category" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'ROI']}
                />
                <Bar 
                  dataKey="roi" 
                  fill="#22333B"
                  radius={[0, 4, 4, 0]}
                  name="ROI"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No channel data available</p>
                <p className="text-sm">Add campaigns to see channel performance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Conversion Rate Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Conversion Rate Trend</h2>
          </div>
          
          {conversionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis 
                  yAxisId="left" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#64748b" 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'rate' ? `${Number(value).toFixed(1)}%` : Number(value).toLocaleString(),
                    name === 'rate' ? 'Conversion Rate' : name === 'clicks' ? 'Clicks' : 'Conversions'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#C6AC8F" 
                  strokeWidth={2}
                  dot={{ fill: '#C6AC8F', strokeWidth: 2, r: 4 }}
                  name="Clicks"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#5E503F" 
                  strokeWidth={2}
                  dot={{ fill: '#5E503F', strokeWidth: 2, r: 4 }}
                  name="Conversions"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#22333B" 
                  strokeWidth={2}
                  dot={{ fill: '#22333B', strokeWidth: 2, r: 4 }}
                  name="Conversion Rate"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No conversion data available</p>
                <p className="text-sm">Add campaign metrics to see conversion trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Goal Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Goal Status Distribution</h2>
            <span className="text-sm text-slate-500">{goals.length} goals</span>
          </div>
          
          {goalStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={goalStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {goalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [value, 'Goals']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No goals created yet</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="mt-2 text-slate_blue-600 hover:text-slate_blue-700 text-sm font-medium"
                >
                  Add your first goal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Marketing Campaigns</h2>
            <button
              onClick={() => setShowAddCampaign(true)}
              className="text-slate_blue-600 hover:text-slate_blue-700 text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Campaign
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 bg-cream-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                    <span>{campaign.clients?.name}</span>
                    <span>•</span>
                    <span>{getChannelLabel(campaign.channel)}</span>
                    <span>•</span>
                    <span>{format(parseISO(campaign.start_date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Budget</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(campaign.budget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Spend</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(campaign.spend)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Remaining</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(Math.max(0, campaign.budget - campaign.spend))}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-slate-200 rounded-full h-2 max-w-[150px]">
                        <div 
                          className={`h-2 rounded-full ${
                            campaign.spend <= campaign.budget ? 'bg-slate_blue-600' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((campaign.spend / campaign.budget) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {campaign.budget > 0 ? `${Math.min(Math.round((campaign.spend / campaign.budget) * 100), 100)}%` : '0%'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // Edit campaign functionality would go here
                          console.log('Edit campaign:', campaign.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No campaigns yet</p>
                <button
                  onClick={() => setShowAddCampaign(true)}
                  className="mt-2 text-slate_blue-600 hover:text-slate_blue-700 text-sm font-medium"
                >
                  Add your first campaign
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Marketing Goals */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Marketing Goals</h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="text-tan-600 hover:text-tan-700 text-sm font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Goal
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = getGoalProgress(goal);
                return (
                  <div key={goal.id} className="p-4 bg-cream-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{goal.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                      <span>{goal.clients?.name}</span>
                      <span>•</span>
                      <span>
                        {format(parseISO(goal.start_date), 'MMM d')} - 
                        {goal.end_date ? format(parseISO(goal.end_date), ' MMM d, yyyy') : ' Ongoing'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-slate-500">Progress</p>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-slate-900">
                            {goal.current_value.toLocaleString()}{goal.unit}
                          </span>
                          <span className="text-xs text-slate-500">
                            / {goal.target_value.toLocaleString()}{goal.unit}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${progress.color}`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {goal.status === 'active' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateGoalValue(goal.id, goal.current_value + 1)}
                            className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => updateGoalValue(goal.id, Math.max(0, goal.current_value - 1))}
                            className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-slate-500">Update progress</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // Edit goal functionality would go here
                              console.log('Edit goal:', goal.id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No goals yet</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="mt-2 text-tan-600 hover:text-tan-700 text-sm font-medium"
                >
                  Add your first goal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Campaign Modal */}
      {showAddCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Campaign</h2>
            <form onSubmit={handleAddCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client *
                </label>
                <select
                  value={newCampaign.client_id}
                  onChange={(e) => setNewCampaign({ ...newCampaign, client_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., Q3 Social Media Campaign"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Campaign description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Budget *
                  </label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Channel *
                  </label>
                  <select
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  >
                    {channelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={newCampaign.status}
                  onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCampaign(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Marketing Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client *
                </label>
                <select
                  value={newGoal.client_id}
                  onChange={(e) => setNewGoal({ ...newGoal, client_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., Increase Website Traffic"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Goal description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={newGoal.current_value}
                    onChange={(e) => setNewGoal({ ...newGoal, current_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="e.g., %, visits"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newGoal.start_date}
                    onChange={(e) => setNewGoal({ ...newGoal, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.end_date}
                    onChange={(e) => setNewGoal({ ...newGoal, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-tan-600 hover:bg-tan-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}