import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  BarChart3, 
  PieChart, 
  LineChart as LineChartIcon,
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Zap,
  Users,
  Globe,
  Megaphone,
  Mail,
  FileText,
  Share2,
  Rocket
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, isWithinInterval, subDays, subMonths } from 'date-fns';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface MarketingCampaign {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget: number;
  spend: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
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
  created_at: string;
  updated_at: string;
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
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
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
  totalBudget: number;
  totalSpend: number;
  totalRevenue: number;
  averageROI: number;
  activeCampaigns: number;
  completedGoals: number;
  conversionRate: number;
  clickThroughRate: number;
}

export function MarketingAnalytics() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetric[]>([]);
  const [goals, setGoals] = useState<MarketingGoal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBudget: 0,
    totalSpend: 0,
    totalRevenue: 0,
    averageROI: 0,
    activeCampaigns: 0,
    completedGoals: 0,
    conversionRate: 0,
    clickThroughRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMetrics, setShowAddMetrics] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    client_id: '',
    name: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
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
    end_date: ''
  });
  const [newMetric, setNewMetric] = useState({
    campaign_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    impressions: 0,
    clicks: 0,
    conversions: 0,
    cost: 0,
    revenue: 0
  });
  const [selectedCampaignId, setSelectedCampaignId] = useState('');

  const channelOptions = [
    { value: 'social_media', label: 'Social Media', icon: Share2 },
    { value: 'email', label: 'Email Marketing', icon: Mail },
    { value: 'search', label: 'Search Ads', icon: Search },
    { value: 'display', label: 'Display Ads', icon: Globe },
    { value: 'content', label: 'Content Marketing', icon: FileText },
    { value: 'events', label: 'Events', icon: Users },
    { value: 'pr', label: 'PR', icon: Megaphone },
    { value: 'affiliate', label: 'Affiliate', icon: Zap },
    { value: 'direct', label: 'Direct Marketing', icon: Rocket }
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

      if (clientFilter.length === 0) {
        setLoading(false);
        return;
      }

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

      const { data: campaignsData } = await campaignQuery.order('start_date', { ascending: false });
      setCampaigns(campaignsData || []);

      // Get campaign IDs for metrics query
      const campaignIds = (campaignsData || []).map(c => c.id);

      // Load metrics if we have campaigns
      if (campaignIds.length > 0) {
        const { data: metricsData } = await supabase
          .from('campaign_metrics')
          .select('*')
          .in('campaign_id', campaignIds)
          .order('date', { ascending: false });

        // Filter metrics by date range
        const filteredMetrics = filterByDateRange(metricsData || [], selectedDateRange);
        setMetrics(filteredMetrics);
      } else {
        setMetrics([]);
      }

      // Load goals
      let goalQuery = supabase
        .from('marketing_goals')
        .select(`
          *,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user!.id);

      if (selectedClient !== 'all') {
        goalQuery = goalQuery.eq('client_id', selectedClient);
      }

      const { data: goalsData } = await goalQuery.order('created_at', { ascending: false });
      setGoals(goalsData || []);

      // Calculate dashboard stats
      calculateStats(campaignsData || [], filteredMetrics, goalsData || []);

    } catch (error) {
      console.error('Error loading marketing analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (data: any[], range: string) => {
    const today = new Date();
    let startDate: Date;

    switch (range) {
      case '7days':
        startDate = subDays(today, 7);
        break;
      case '30days':
        startDate = subDays(today, 30);
        break;
      case '90days':
        startDate = subDays(today, 90);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'all':
      default:
        return data; // Return all data
    }

    return data.filter(item => {
      const itemDate = parseISO(item.date);
      return isAfter(itemDate, startDate) && isBefore(itemDate, today);
    });
  };

  const calculateStats = (campaignsData: MarketingCampaign[], metricsData: CampaignMetric[], goalsData: MarketingGoal[]) => {
    // Calculate basic stats
    const totalBudget = campaignsData.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
    const totalSpend = campaignsData.reduce((sum, campaign) => sum + (campaign.spend || 0), 0);
    const totalRevenue = metricsData.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const averageROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const activeCampaigns = campaignsData.filter(campaign => campaign.status === 'active').length;
    const completedGoals = goalsData.filter(goal => goal.status === 'completed').length;

    // Calculate conversion metrics
    const totalImpressions = metricsData.reduce((sum, metric) => sum + (metric.impressions || 0), 0);
    const totalClicks = metricsData.reduce((sum, metric) => sum + (metric.clicks || 0), 0);
    const totalConversions = metricsData.reduce((sum, metric) => sum + (metric.conversions || 0), 0);
    
    const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    setStats({
      totalBudget,
      totalSpend,
      totalRevenue,
      averageROI,
      activeCampaigns,
      completedGoals,
      conversionRate,
      clickThroughRate
    });
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .insert([{
          client_id: newCampaign.client_id,
          name: newCampaign.name,
          description: newCampaign.description,
          start_date: new Date(newCampaign.start_date).toISOString(),
          end_date: newCampaign.end_date ? new Date(newCampaign.end_date).toISOString() : null,
          budget: newCampaign.budget,
          channel: newCampaign.channel,
          status: newCampaign.status
        }]);

      if (error) throw error;

      setNewCampaign({
        client_id: '',
        name: '',
        description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
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
          client_id: newGoal.client_id,
          name: newGoal.name,
          description: newGoal.description,
          target_value: newGoal.target_value,
          current_value: newGoal.current_value,
          unit: newGoal.unit,
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
        end_date: ''
      });
      setShowAddGoal(false);
      loadData();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleAddMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('campaign_metrics')
        .insert([{
          campaign_id: newMetric.campaign_id,
          date: new Date(newMetric.date).toISOString(),
          impressions: newMetric.impressions,
          clicks: newMetric.clicks,
          conversions: newMetric.conversions,
          cost: newMetric.cost,
          revenue: newMetric.revenue
        }]);

      if (error) throw error;

      setNewMetric({
        campaign_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        revenue: 0
      });
      setShowAddMetrics(false);
      loadData();
    } catch (error) {
      console.error('Error adding metrics:', error);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This will also delete all associated metrics.')) return;

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
      console.error('Error updating goal:', error);
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', campaignId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating campaign status:', error);
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
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getChannelIcon = (channel: string) => {
    const channelConfig = channelOptions.find(c => c.value === channel);
    return channelConfig?.icon || Globe;
  };

  const getGoalProgress = (goal: MarketingGoal) => {
    const percentage = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
    return {
      percentage: Math.min(percentage, 100),
      status: percentage >= 100 ? 'completed' : percentage >= 75 ? 'good' : percentage >= 50 ? 'warning' : 'danger'
    };
  };

  // Prepare chart data
  const campaignPerformanceData = campaigns.map(campaign => {
    const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
    const totalRevenue = campaignMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const totalCost = campaignMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    
    return {
      name: campaign.name,
      revenue: totalRevenue,
      cost: totalCost,
      roi: roi
    };
  }).sort((a, b) => b.roi - a.roi);

  const channelPerformanceData = channelOptions.map(channel => {
    const channelCampaigns = campaigns.filter(c => c.channel === channel.value);
    const totalSpend = channelCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const channelMetrics = metrics.filter(m => 
      channelCampaigns.some(c => c.id === m.campaign_id)
    );
    const totalRevenue = channelMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    
    return {
      channel: channel.label,
      spend: totalSpend,
      revenue: totalRevenue,
      roi: roi
    };
  }).filter(item => item.spend > 0 || item.revenue > 0);

  const conversionFunnelData = [
    { name: 'Impressions', value: metrics.reduce((sum, m) => sum + (m.impressions || 0), 0) },
    { name: 'Clicks', value: metrics.reduce((sum, m) => sum + (m.clicks || 0), 0) },
    { name: 'Conversions', value: metrics.reduce((sum, m) => sum + (m.conversions || 0), 0) }
  ];

  // Group metrics by date for trend chart
  const metricsByDate = metrics.reduce((acc, metric) => {
    const date = metric.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        revenue: 0
      };
    }
    
    acc[date].impressions += metric.impressions || 0;
    acc[date].clicks += metric.clicks || 0;
    acc[date].conversions += metric.conversions || 0;
    acc[date].cost += metric.cost || 0;
    acc[date].revenue += metric.revenue || 0;
    
    return acc;
  }, {} as Record<string, any>);

  const trendData = Object.values(metricsByDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days with data

  const COLORS = ['#22333B', '#5E503F', '#C6AC8F', '#EAE0D5', '#0A0908'];

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: formatPercentage(stats.averageROI),
      changeType: stats.averageROI >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'bg-slate_blue-600'
    },
    {
      title: 'Marketing Spend',
      value: formatCurrency(stats.totalSpend),
      change: `${Math.round((stats.totalSpend / stats.totalBudget) * 100)}% of budget`,
      changeType: 'neutral',
      icon: DollarSign,
      color: 'bg-tan-600'
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(stats.conversionRate),
      change: `${stats.conversionRate > 3 ? 'Above' : 'Below'} industry avg`,
      changeType: stats.conversionRate > 3 ? 'positive' : 'negative',
      icon: Target,
      color: 'bg-olive-600'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      change: `${stats.completedGoals} goals completed`,
      changeType: 'neutral',
      icon: BarChart3,
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
          <p className="text-slate-600">Track campaign performance, marketing goals, and ROI</p>
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
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
            >
              <option value="all">All Channels</option>
              {channelOptions.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
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
              <span>Campaign</span>
            </button>
            
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-olive-600 hover:bg-olive-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Goal</span>
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
        {/* Campaign Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Campaign ROI</h2>
            <div className="text-sm text-slate-500">{selectedDateRange} view</div>
          </div>
          
          {campaignPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignPerformanceData.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'roi' ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value)),
                    name === 'roi' ? 'ROI' : name === 'revenue' ? 'Revenue' : 'Cost'
                  ]}
                />
                <Legend />
                <Bar dataKey="roi" fill="#22333B" name="ROI (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No campaign data available</p>
                <p className="text-sm">Add campaigns to see performance</p>
              </div>
            </div>
          )}
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Channel Performance</h2>
          </div>
          
          {channelPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="channel" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'roi' ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value)),
                    name === 'roi' ? 'ROI' : name === 'revenue' ? 'Revenue' : 'Spend'
                  ]}
                />
                <Legend />
                <Bar dataKey="spend" fill="#5E503F" name="Spend" />
                <Bar dataKey="revenue" fill="#C6AC8F" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No channel data available</p>
                <p className="text-sm">Add campaign metrics to see performance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Conversion Funnel</h2>
          </div>
          
          {conversionFunnelData[0].value > 0 ? (
            <div className="space-y-4">
              {conversionFunnelData.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{stage.name}</span>
                    <span className="text-sm text-slate-900">{stage.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        index === 0 ? 'bg-slate_blue-500' :
                        index === 1 ? 'bg-tan-500' : 'bg-olive-500'
                      }`}
                      style={{ 
                        width: `${index === 0 ? 100 : 
                          index === 1 ? 
                            (conversionFunnelData[0].value > 0 ? 
                              (stage.value / conversionFunnelData[0].value) * 100 : 0) : 
                            (conversionFunnelData[1].value > 0 ? 
                              (stage.value / conversionFunnelData[1].value) * 100 : 0)
                        }%` 
                      }}
                    />
                  </div>
                  {index < conversionFunnelData.length - 1 && (
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>
                        {index === 0 ? 
                          `${formatPercentage(stats.clickThroughRate)} CTR` : 
                          `${formatPercentage(stats.conversionRate)} CVR`
                        }
                      </span>
                      <span>
                        {index === 0 ? 
                          `${conversionFunnelData[1].value.toLocaleString()} clicks` : 
                          `${conversionFunnelData[2].value.toLocaleString()} conversions`
                        }
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <LineChartIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No conversion data available</p>
                <p className="text-sm">Add campaign metrics to see funnel</p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Performance Trends</h2>
          </div>
          
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                  formatter={(value, name) => [
                    name === 'cost' || name === 'revenue' ? 
                      formatCurrency(Number(value)) : 
                      Number(value).toLocaleString(),
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22333B" 
                  strokeWidth={2}
                  dot={{ fill: '#22333B', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#5E503F" 
                  strokeWidth={2}
                  dot={{ fill: '#5E503F', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <LineChartIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No trend data available</p>
                <p className="text-sm">Add campaign metrics to see trends</p>
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
              className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Campaign</span>
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => {
                const ChannelIcon = getChannelIcon(campaign.channel);
                const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
                const totalRevenue = campaignMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
                const roi = campaign.spend > 0 ? ((totalRevenue - campaign.spend) / campaign.spend) * 100 : 0;
                
                return (
                  <div key={campaign.id} className="p-4 bg-cream-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center">
                          <ChannelIcon className="w-5 h-5 text-slate_blue-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{campaign.name}</h3>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <span>{campaign.clients?.name}</span>
                            <span>•</span>
                            <span className="capitalize">{campaign.channel.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCampaignId(campaign.id);
                            setShowAddMetrics(true);
                            setNewMetric(prev => ({ ...prev, campaign_id: campaign.id }));
                          }}
                          className="p-2 text-slate_blue-600 hover:text-slate_blue-700 hover:bg-slate_blue-50 rounded-lg transition-colors"
                          title="Add metrics"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteCampaign(campaign.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                        <p className="text-xs text-slate-500">ROI</p>
                        <p className={`font-semibold ${
                          roi > 0 ? 'text-green-600' : roi < 0 ? 'text-red-600' : 'text-slate-900'
                        }`}>
                          {formatPercentage(roi)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        {format(new Date(campaign.start_date), 'MMM d, yyyy')}
                        {campaign.end_date && ` - ${format(new Date(campaign.end_date), 'MMM d, yyyy')}`}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                          >
                            Activate
                          </button>
                        )}
                        
                        {campaign.status === 'active' && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium"
                          >
                            Pause
                          </button>
                        )}
                        
                        {campaign.status === 'paused' && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                          >
                            Resume
                          </button>
                        )}
                        
                        {(campaign.status === 'active' || campaign.status === 'paused') && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'completed')}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No campaigns yet</p>
                <button
                  onClick={() => setShowAddCampaign(true)}
                  className="mt-3 text-slate_blue-600 hover:text-slate_blue-700 text-sm font-medium"
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
              className="bg-olive-600 hover:bg-olive-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = getGoalProgress(goal);
                return (
                  <div key={goal.id} className="p-4 bg-cream-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900">{goal.name}</h3>
                        <p className="text-xs text-slate-500">{goal.clients?.name}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newValue = prompt('Enter new current value:', goal.current_value.toString());
                            if (newValue !== null) {
                              const parsedValue = parseFloat(newValue);
                              if (!isNaN(parsedValue)) {
                                updateGoalValue(goal.id, parsedValue);
                              }
                            }
                          }}
                          className="p-2 text-slate_blue-600 hover:text-slate_blue-700 hover:bg-slate_blue-50 rounded-lg transition-colors"
                          title="Update progress"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700">Progress</span>
                        <span className="text-sm font-medium text-slate-900">
                          {goal.current_value.toLocaleString()}{goal.unit} / {goal.target_value.toLocaleString()}{goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            progress.status === 'completed' ? 'bg-green-500' :
                            progress.status === 'good' ? 'bg-slate_blue-500' :
                            progress.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-500">
                        {goal.start_date && format(new Date(goal.start_date), 'MMM d, yyyy')}
                        {goal.end_date && ` - ${format(new Date(goal.end_date), 'MMM d, yyyy')}`}
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No goals yet</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="mt-3 text-olive-600 hover:text-olive-700 text-sm font-medium"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add Marketing Campaign</h2>
            <form onSubmit={handleAddCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Channel *
                  </label>
                  <select
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  >
                    {channelOptions.map((channel) => (
                      <option key={channel.value} value={channel.value}>
                        {channel.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  placeholder="e.g., Q2 Social Media Campaign"
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
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Campaign objectives and details..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Budget (£) *
                  </label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                    step="100"
                    required
                  />
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add Marketing Goal</h2>
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
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Detailed description of the goal..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                    step="1"
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
                    min="0"
                    step="1"
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
                    placeholder="e.g., %, visits, leads"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="flex-1 bg-olive-600 hover:bg-olive-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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

      {/* Add Metrics Modal */}
      {showAddMetrics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add Campaign Metrics</h2>
            <form onSubmit={handleAddMetrics} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Campaign
                </label>
                <select
                  value={newMetric.campaign_id}
                  onChange={(e) => setNewMetric({ ...newMetric, campaign_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  required
                  disabled={!!selectedCampaignId}
                >
                  <option value="">Select a campaign...</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.clients?.name})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newMetric.date}
                  onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Impressions
                  </label>
                  <input
                    type="number"
                    value={newMetric.impressions}
                    onChange={(e) => setNewMetric({ ...newMetric, impressions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Clicks
                  </label>
                  <input
                    type="number"
                    value={newMetric.clicks}
                    onChange={(e) => setNewMetric({ ...newMetric, clicks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Conversions
                  </label>
                  <input
                    type="number"
                    value={newMetric.conversions}
                    onChange={(e) => setNewMetric({ ...newMetric, conversions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost (£)
                  </label>
                  <input
                    type="number"
                    value={newMetric.cost}
                    onChange={(e) => setNewMetric({ ...newMetric, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Revenue (£)
                  </label>
                  <input
                    type="number"
                    value={newMetric.revenue}
                    onChange={(e) => setNewMetric({ ...newMetric, revenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Metrics
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMetrics(false);
                    setSelectedCampaignId('');
                    setNewMetric({
                      campaign_id: '',
                      date: format(new Date(), 'yyyy-MM-dd'),
                      impressions: 0,
                      clicks: 0,
                      conversions: 0,
                      cost: 0,
                      revenue: 0
                    });
                  }}
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