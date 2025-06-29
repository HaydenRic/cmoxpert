import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Calendar, 
  Filter, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PieChart,
  LineChart,
  Download,
  Zap,
  Users
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
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
  totalRevenue: number;
  totalSpend: number;
  roi: number;
  activeCampaigns: number;
  completedGoals: number;
  conversionRate: number;
  revenueChange: number;
  spendChange: number;
}

export function MarketingAnalytics() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetric[]>([]);
  const [goals, setGoals] = useState<MarketingGoal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalSpend: 0,
    roi: 0,
    activeCampaigns: 0,
    completedGoals: 0,
    conversionRate: 0,
    revenueChange: 0,
    spendChange: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  
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
  
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);

  const channelOptions = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'search', label: 'Search' },
    { value: 'email', label: 'Email' },
    { value: 'content', label: 'Content' },
    { value: 'display', label: 'Display' },
    { value: 'video', label: 'Video' },
    { value: 'affiliate', label: 'Affiliate' },
    { value: 'direct', label: 'Direct' },
    { value: 'events', label: 'Events' },
    { value: 'other', label: 'Other' }
  ];

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedClient, selectedChannel, dateRange]);

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

      // Build date range filter
      const dateFilter = getDateRangeFilter(dateRange);

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
        campaignQuery = campaignQuery.or(`start_date.gte.${dateFilter.start},end_date.lte.${dateFilter.end}`);
      }

      const { data: campaignsData } = await campaignQuery.order('start_date', { ascending: false });
      setCampaigns(campaignsData || []);

      // Load campaign metrics
      const campaignIds = campaignsData?.map(c => c.id) || [];
      
      if (campaignIds.length > 0) {
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
    let end: Date | null = null;

    switch (range) {
      case '7days':
        start = subDays(today, 7);
        end = today;
        break;
      case '30days':
        start = subDays(today, 30);
        end = today;
        break;
      case '90days':
        start = subDays(today, 90);
        end = today;
        break;
      case 'thismonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastmonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      case 'all':
      default:
        // No date filtering
        break;
    }

    return {
      start: start ? format(start, 'yyyy-MM-dd') : null,
      end: end ? format(end, 'yyyy-MM-dd') : null
    };
  };

  const calculateStats = (campaignsData: MarketingCampaign[], metricsData: CampaignMetric[], goalsData: MarketingGoal[]) => {
    // Calculate total revenue and spend
    const totalRevenue = metricsData.reduce((sum, metric) => sum + (metric.revenue || 0), 0);
    const totalSpend = metricsData.reduce((sum, metric) => sum + (metric.cost || 0), 0);
    
    // Calculate ROI
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    
    // Count active campaigns
    const activeCampaigns = campaignsData.filter(c => c.status === 'active').length;
    
    // Count completed goals
    const completedGoals = goalsData.filter(g => g.status === 'completed').length;
    
    // Calculate conversion rate
    const totalClicks = metricsData.reduce((sum, metric) => sum + (metric.clicks || 0), 0);
    const totalConversions = metricsData.reduce((sum, metric) => sum + (metric.conversions || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    // Calculate revenue and spend change (comparing current period to previous period)
    const dateFilter = getDateRangeFilter(dateRange);
    
    if (dateFilter.start && dateFilter.end) {
      const currentPeriodStart = new Date(dateFilter.start);
      const currentPeriodEnd = new Date(dateFilter.end);
      const periodLength = (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24);
      
      const previousPeriodStart = subDays(currentPeriodStart, periodLength);
      const previousPeriodEnd = subDays(currentPeriodEnd, periodLength);
      
      const currentPeriodMetrics = metricsData.filter(m => {
        const metricDate = new Date(m.date);
        return isWithinInterval(metricDate, { start: currentPeriodStart, end: currentPeriodEnd });
      });
      
      const previousPeriodMetrics = metricsData.filter(m => {
        const metricDate = new Date(m.date);
        return isWithinInterval(metricDate, { start: previousPeriodStart, end: previousPeriodEnd });
      });
      
      const currentRevenue = currentPeriodMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
      const previousRevenue = previousPeriodMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
      
      const currentSpend = currentPeriodMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
      const previousSpend = previousPeriodMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
      
      const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const spendChange = previousSpend > 0 ? ((currentSpend - previousSpend) / previousSpend) * 100 : 0;
      
      setStats({
        totalRevenue,
        totalSpend,
        roi,
        activeCampaigns,
        completedGoals,
        conversionRate,
        revenueChange,
        spendChange
      });
    } else {
      setStats({
        totalRevenue,
        totalSpend,
        roi,
        activeCampaigns,
        completedGoals,
        conversionRate,
        revenueChange: 0,
        spendChange: 0
      });
    }
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
        end_date: ''
      });
      setShowAddGoal(false);
      loadData();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('campaign_metrics')
        .insert([{
          ...newMetric,
          date: new Date(newMetric.date).toISOString()
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
      setShowAddMetric(false);
      loadData();
    } catch (error) {
      console.error('Error adding metric:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
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
    const percentage = (goal.current_value / goal.target_value) * 100;
    
    if (percentage >= 100) return { status: 'success', percentage };
    if (percentage >= 75) return { status: 'warning', percentage };
    return { status: 'danger', percentage };
  };

  // Prepare chart data
  const campaignPerformanceData = campaigns
    .filter(campaign => campaign.status !== 'draft' && campaign.status !== 'cancelled')
    .map(campaign => {
      const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
      const totalRevenue = campaignMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
      const totalCost = campaignMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
      
      return {
        name: campaign.name,
        revenue: totalRevenue,
        cost: totalCost,
        roi
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const channelPerformanceData = channelOptions
    .map(channel => {
      const channelCampaigns = campaigns.filter(c => c.channel === channel.value);
      const channelMetrics = metrics.filter(m => 
        channelCampaigns.some(c => c.id === m.campaign_id)
      );
      
      const revenue = channelMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
      const cost = channelMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
      const conversions = channelMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
      
      return {
        channel: channel.label,
        revenue,
        cost,
        conversions
      };
    })
    .filter(data => data.revenue > 0 || data.cost > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const goalStatusData = [
    { name: 'Completed', value: goals.filter(g => g.status === 'completed').length, color: '#10b981' },
    { name: 'Active', value: goals.filter(g => g.status === 'active').length, color: '#3b82f6' },
    { name: 'Cancelled', value: goals.filter(g => g.status === 'cancelled').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: formatPercentage(stats.revenueChange),
      changeType: stats.revenueChange >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'bg-slate_blue-600'
    },
    {
      title: 'Marketing Spend',
      value: formatCurrency(stats.totalSpend),
      change: formatPercentage(stats.spendChange),
      changeType: stats.spendChange <= 0 ? 'positive' : 'negative', // Lower spend growth is better
      icon: TrendingUp,
      color: 'bg-tan-600'
    },
    {
      title: 'ROI',
      value: formatPercentage(stats.roi),
      change: stats.roi >= 200 ? 'Excellent' : stats.roi >= 100 ? 'Good' : 'Needs Improvement',
      changeType: stats.roi >= 100 ? 'positive' : 'negative',
      icon: Target,
      color: 'bg-olive-600'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: `${stats.activeCampaigns} active campaigns`,
      changeType: 'neutral',
      icon: Users,
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
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
            >
              {dateRangeOptions.map((option) => (
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
          
          <button
            onClick={() => setShowAddCampaign(true)}
            className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
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
                  {stat.changeType === 'positive' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                  {stat.changeType === 'negative' && <ArrowDownRight className="w-3 h-3 mr-1" />}
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
            <h2 className="text-lg font-semibold text-slate-900">Top Campaign Performance</h2>
            <div className="text-sm text-slate-500">Revenue vs. Cost</div>
          </div>
          
          {campaignPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={campaignPerformanceData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'revenue' ? 'Revenue' : name === 'cost' ? 'Cost' : 'ROI'
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#22333B" />
                <Bar dataKey="cost" name="Cost" fill="#5E503F" />
              </RechartsBarChart>
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
            <div className="text-sm text-slate-500">Revenue by Channel</div>
          </div>
          
          {channelPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={channelPerformanceData}>
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
                    name === 'conversions' ? value : formatCurrency(Number(value)), 
                    name === 'revenue' ? 'Revenue' : name === 'cost' ? 'Cost' : 'Conversions'
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#22333B" />
                <Bar dataKey="cost" name="Cost" fill="#5E503F" />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No channel data available</p>
                <p className="text-sm">Add campaign metrics to see channel performance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Marketing Campaigns</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                />
              </div>
              
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
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => {
                const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
                const totalRevenue = campaignMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
                const totalCost = campaignMetrics.reduce((sum, m) => sum + (m.cost || 0), 0);
                const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
                
                return (
                  <div key={campaign.id} className="p-4 bg-cream-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 flex items-center">
                          {campaign.name}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                          <span>{campaign.clients?.name}</span>
                          <span>•</span>
                          <span>{getChannelLabel(campaign.channel)}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(campaign.start_date), 'MMM d, yyyy')}
                            {campaign.end_date && ` - ${format(new Date(campaign.end_date), 'MMM d, yyyy')}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="p-2 text-slate_blue-600 hover:text-slate_blue-700 hover:bg-slate_blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowAddMetric(true)}
                          className="p-2 text-olive-600 hover:text-olive-700 hover:bg-olive-50 rounded-lg transition-colors"
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
                        <p className="text-xs text-slate-500">Revenue</p>
                        <p className="font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-full max-w-[150px] bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              roi >= 100 ? 'bg-green-500' :
                              roi >= 0 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(Math.max(roi, 0), 200)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          roi >= 100 ? 'text-green-600' :
                          roi >= 0 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          ROI: {roi.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        {campaign.status === 'active' && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg hover:bg-yellow-200 transition-colors"
                          >
                            Pause
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Resume
                          </button>
                        )}
                        {(campaign.status === 'active' || campaign.status === 'paused') && (
                          <button
                            onClick={() => updateCampaignStatus(campaign.id, 'completed')}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg hover:bg-blue-200 transition-colors"
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
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No campaigns found</p>
                <p className="text-sm text-slate-400 mb-4">
                  {searchTerm || selectedChannel !== 'all' || selectedClient !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first marketing campaign to get started'}
                </p>
                {!searchTerm && selectedChannel === 'all' && selectedClient === 'all' && (
                  <button
                    onClick={() => setShowAddCampaign(true)}
                    className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create Campaign
                  </button>
                )}
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
              className="bg-tan-600 hover:bg-tan-700 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Goal</span>
            </button>
          </div>
          
          {/* Goal Status Chart */}
          {goalStatusData.length > 0 && (
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={goalStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {goalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} goals`, '']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = getGoalProgress(goal);
                return (
                  <div key={goal.id} className="p-4 bg-cream-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900">{goal.name}</h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                          <span>{goal.clients?.name}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                            goal.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {goal.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newValue = prompt('Update current value:', goal.current_value.toString());
                            if (newValue !== null) {
                              updateGoalValue(goal.id, parseFloat(newValue));
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
                        <span className="text-xs text-slate-500">Progress</span>
                        <span className="text-xs font-medium text-slate-700">
                          {goal.current_value.toLocaleString()}{goal.unit} / {goal.target_value.toLocaleString()}{goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            progress.status === 'success' ? 'bg-green-500' :
                            progress.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    {goal.description && (
                      <p className="text-xs text-slate-600 mb-2">{goal.description}</p>
                    )}
                    
                    <div className="text-xs text-slate-500">
                      {goal.start_date && (
                        <span>
                          {format(new Date(goal.start_date), 'MMM d, yyyy')}
                          {goal.end_date && ` - ${format(new Date(goal.end_date), 'MMM d, yyyy')}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No marketing goals yet</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="mt-3 text-tan-600 hover:text-tan-700 text-sm font-medium"
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Campaign</h2>
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
                  placeholder="e.g., Summer Promotion 2025"
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
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Create Campaign
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create Marketing Goal</h2>
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
                  rows={2}
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
                  Create Goal
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

      {/* Add Metric Modal */}
      {showAddMetric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Campaign Metrics</h2>
            <form onSubmit={handleAddMetric} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Campaign *
                </label>
                <select
                  value={newMetric.campaign_id}
                  onChange={(e) => setNewMetric({ ...newMetric, campaign_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  required
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Impressions
                  </label>
                  <input
                    type="number"
                    value={newMetric.impressions}
                    onChange={(e) => setNewMetric({ ...newMetric, impressions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="0"
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
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Conversions
                  </label>
                  <input
                    type="number"
                    value={newMetric.conversions}
                    onChange={(e) => setNewMetric({ ...newMetric, conversions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost *
                  </label>
                  <input
                    type="number"
                    value={newMetric.cost}
                    onChange={(e) => setNewMetric({ ...newMetric, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Revenue
                  </label>
                  <input
                    type="number"
                    value={newMetric.revenue}
                    onChange={(e) => setNewMetric({ ...newMetric, revenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-olive-600 hover:bg-olive-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Metrics
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMetric(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">{selectedCampaign.name}</h2>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-slate-500 hover:text-slate-700 p-2"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-cream-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Campaign Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Client:</span>
                      <span className="text-xs font-medium text-slate-900">{selectedCampaign.clients?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Channel:</span>
                      <span className="text-xs font-medium text-slate-900">{getChannelLabel(selectedCampaign.channel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Status:</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(selectedCampaign.status)}`}>
                        {selectedCampaign.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Start Date:</span>
                      <span className="text-xs font-medium text-slate-900">
                        {format(new Date(selectedCampaign.start_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {selectedCampaign.end_date && (
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">End Date:</span>
                        <span className="text-xs font-medium text-slate-900">
                          {format(new Date(selectedCampaign.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-cream-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Budget & Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Budget:</span>
                      <span className="text-xs font-medium text-slate-900">{formatCurrency(selectedCampaign.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Spend:</span>
                      <span className="text-xs font-medium text-slate-900">{formatCurrency(selectedCampaign.spend)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Remaining:</span>
                      <span className="text-xs font-medium text-slate-900">
                        {formatCurrency(Math.max(0, selectedCampaign.budget - selectedCampaign.spend))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Budget Utilization:</span>
                      <span className="text-xs font-medium text-slate-900">
                        {selectedCampaign.budget > 0 
                          ? `${((selectedCampaign.spend / selectedCampaign.budget) * 100).toFixed(1)}%` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-cream-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Campaign Metrics</h3>
                  {(() => {
                    const campaignMetrics = metrics.filter(m => m.campaign_id === selectedCampaign.id);
                    const totalImpressions = campaignMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
                    const totalClicks = campaignMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
                    const totalConversions = campaignMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
                    const totalRevenue = campaignMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
                    
                    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
                    const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
                    const roi = selectedCampaign.spend > 0 ? ((totalRevenue - selectedCampaign.spend) / selectedCampaign.spend) * 100 : 0;
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Impressions:</span>
                          <span className="text-xs font-medium text-slate-900">{totalImpressions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Clicks:</span>
                          <span className="text-xs font-medium text-slate-900">{totalClicks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">CTR:</span>
                          <span className="text-xs font-medium text-slate-900">{ctr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Conversions:</span>
                          <span className="text-xs font-medium text-slate-900">{totalConversions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Conv. Rate:</span>
                          <span className="text-xs font-medium text-slate-900">{convRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">ROI:</span>
                          <span className={`text-xs font-medium ${
                            roi >= 100 ? 'text-green-600' :
                            roi >= 0 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {roi.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {selectedCampaign.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 bg-cream-50 rounded-lg p-4">
                    {selectedCampaign.description}
                  </p>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-700">Performance Over Time</h3>
                  <button
                    onClick={() => setShowAddMetric(true)}
                    className="bg-olive-600 hover:bg-olive-700 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Metrics</span>
                  </button>
                </div>
                
                {(() => {
                  const campaignMetrics = metrics
                    .filter(m => m.campaign_id === selectedCampaign.id)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  
                  if (campaignMetrics.length === 0) {
                    return (
                      <div className="text-center py-8 bg-cream-50 rounded-lg">
                        <LineChart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No metrics data available</p>
                        <p className="text-xs text-slate-400">Add metrics to see performance over time</p>
                      </div>
                    );
                  }
                  
                  const chartData = campaignMetrics.map(metric => ({
                    date: format(new Date(metric.date), 'MMM d'),
                    impressions: metric.impressions,
                    clicks: metric.clicks,
                    conversions: metric.conversions,
                    cost: metric.cost,
                    revenue: metric.revenue
                  }));
                  
                  return (
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                            formatter={(value, name) => [
                              name === 'cost' || name === 'revenue' 
                                ? formatCurrency(Number(value)) 
                                : value.toLocaleString(),
                              name.charAt(0).toUpperCase() + name.slice(1)
                            ]}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="impressions" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="cost" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-4">Metrics Log</h3>
                
                {(() => {
                  const campaignMetrics = metrics
                    .filter(m => m.campaign_id === selectedCampaign.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                  
                  if (campaignMetrics.length === 0) {
                    return (
                      <div className="text-center py-6 bg-cream-50 rounded-lg">
                        <p className="text-slate-500 text-sm">No metrics recorded yet</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Impressions
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Clicks
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Conversions
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Revenue
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              ROI
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {campaignMetrics.map((metric) => {
                            const roi = metric.cost > 0 ? ((metric.revenue - metric.cost) / metric.cost) * 100 : 0;
                            return (
                              <tr key={metric.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                                  {format(new Date(metric.date), 'MMM d, yyyy')}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                                  {metric.impressions.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                                  {metric.clicks.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                                  {metric.conversions.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                                  {formatCurrency(metric.cost)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                                  {formatCurrency(metric.revenue)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span className={`${
                                    roi >= 100 ? 'text-green-600' :
                                    roi >= 0 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {roi.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}