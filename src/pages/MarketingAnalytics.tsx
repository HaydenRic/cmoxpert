import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PoundSterling,
  Target,
  Calendar,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  PieChart,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Download,
  Upload,
  Megaphone,
  Users,
  Zap,
  Globe,
  Mail,
  MessageSquare,
  FileText
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, subDays, subMonths } from 'date-fns';
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
import { ChannelMetricsImporter } from '../components/ChannelMetricsImporter';
import toast from 'react-hot-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  channel: string;
  start_date: string;
  end_date?: string;
  budget: number;
  spend: number;
  status: string;
  client_id: string;
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
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpend: number;
  totalRevenue: number;
  averageROI: number;
  completedGoals: number;
  activeGoals: number;
}

export function MarketingAnalytics() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetric[]>([]);
  const [goals, setGoals] = useState<MarketingGoal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalBudget: 0,
    totalSpend: 0,
    totalRevenue: 0,
    averageROI: 0,
    completedGoals: 0,
    activeGoals: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    client_id: '',
    name: '',
    description: '',
    channel: 'social_media',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
    budget: 0,
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
    { value: 'social_media', label: 'Social Media', icon: MessageSquare },
    { value: 'email', label: 'Email Marketing', icon: Mail },
    { value: 'search', label: 'Search Ads', icon: Search },
    { value: 'display', label: 'Display Ads', icon: Globe },
    { value: 'content', label: 'Content Marketing', icon: FileText },
    { value: 'events', label: 'Events', icon: Users },
    { value: 'pr', label: 'PR', icon: Megaphone },
    { value: 'affiliate', label: 'Affiliate', icon: Zap }
  ];

  const dateRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedClient, selectedDateRange, selectedStatus]);

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

      // Build date filter
      let startDate;
      const endDate = new Date();
      
      switch (selectedDateRange) {
        case '7days':
          startDate = subDays(endDate, 7);
          break;
        case '30days':
          startDate = subDays(endDate, 30);
          break;
        case '90days':
          startDate = subDays(endDate, 90);
          break;
        case 'year':
          startDate = new Date(endDate.getFullYear(), 0, 1); // Jan 1 of current year
          break;
        default:
          startDate = new Date(2000, 0, 1); // Effectively "all time"
      }

      // Load campaigns
      let campaignQuery = supabase
        .from('marketing_campaigns')
        .select(`
          *,
          clients(name)
        `)
        .gte('start_date', startDate.toISOString());

      if (selectedClient !== 'all') {
        campaignQuery = campaignQuery.eq('client_id', selectedClient);
      }

      if (selectedStatus !== 'all') {
        campaignQuery = campaignQuery.eq('status', selectedStatus);
      }

      const { data: campaignsData } = await campaignQuery.order('start_date', { ascending: false });

      // Load campaign metrics
      const campaignIds = campaignsData?.map(c => c.id) || [];
      
      let metricsData: CampaignMetric[] = [];
      
      if (campaignIds.length > 0) {
        const { data: metrics } = await supabase
          .from('campaign_metrics')
          .select('*')
          .in('campaign_id', campaignIds)
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date');
          
        metricsData = metrics || [];
      }

      // Load marketing goals
      let goalsQuery = supabase
        .from('marketing_goals')
        .select(`
          *,
          clients(name)
        `);

      if (selectedClient !== 'all') {
        goalsQuery = goalsQuery.eq('client_id', selectedClient);
      }

      const { data: goalsData } = await goalsQuery.order('end_date');

      setCampaigns(campaignsData || []);
      setMetrics(metricsData);
      setGoals(goalsData || []);

      // Calculate dashboard stats
      calculateStats(campaignsData || [], goalsData || []);

    } catch (error) {
      console.error('Error loading marketing analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (campaignsData: Campaign[], goalsData: MarketingGoal[]) => {
    const totalCampaigns = campaignsData.length;
    const activeCampaigns = campaignsData.filter(c => c.status === 'active').length;
    const totalBudget = campaignsData.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalSpend = campaignsData.reduce((sum, c) => sum + (c.spend || 0), 0);
    const totalRevenue = campaignsData.reduce((sum, c) => {
      // For demo purposes, simulate revenue as 1.5-3x the spend
      const multiplier = 1.5 + Math.random() * 1.5;
      return sum + (c.spend || 0) * multiplier;
    }, 0);
    
    const averageROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const completedGoals = goalsData.filter(g => g.status === 'completed').length;
    const activeGoals = goalsData.filter(g => g.status === 'active').length;

    setStats({
      totalCampaigns,
      activeCampaigns,
      totalBudget,
      totalSpend,
      totalRevenue,
      averageROI,
      completedGoals,
      activeGoals
    });
  };

  const generateWeeklyReport = async () => {
    if (!selectedClient || selectedClient === 'all') {
      toast.error('Please select a client to generate a report');
      return;
    }

    setGeneratingReport(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-weekly-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient,
          days: 7,
          format: 'html',
        }),
      });

      const html = await response.text();

      if (!response.ok) {
        toast.error('Failed to generate report');
        return;
      }

      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report generated and downloaded');
    } catch (error) {
      toast.error(`Report generation failed: ${String(error)}`);
    } finally {
      setGeneratingReport(false);
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
        channel: 'social_media',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
        budget: 0,
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

  const getGoalProgress = (goal: MarketingGoal) => {
    const percentage = (goal.current_value / goal.target_value) * 100;
    
    if (percentage >= 100) return { status: 'success', percentage };
    if (percentage >= 75) return { status: 'warning', percentage };
    return { status: 'danger', percentage };
  };

  const getChannelIcon = (channel: string) => {
    const channelConfig = channelOptions.find(c => c.value === channel);
    return channelConfig?.icon || Globe;
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

  // Prepare chart data
  const campaignPerformanceData = campaigns.map(campaign => {
    const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
    const totalImpressions = campaignMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalClicks = campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalConversions = campaignMetrics.reduce((sum, m) => sum + m.conversions, 0);
    const totalCost = campaignMetrics.reduce((sum, m) => sum + m.cost, 0);
    const totalRevenue = campaignMetrics.reduce((sum, m) => sum + m.revenue, 0);
    
    return {
      name: campaign.name,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      cost: totalCost,
      revenue: totalRevenue,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cvr: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      roi: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0
    };
  });

  const channelPerformanceData = channelOptions.map(channel => {
    const channelCampaigns = campaigns.filter(c => c.channel === channel.value);
    const totalSpend = channelCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const totalBudget = channelCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalRevenue = channelCampaigns.reduce((sum, c) => {
      // For demo purposes, simulate revenue as 1.5-3x the spend
      const multiplier = 1.5 + Math.random() * 1.5;
      return sum + (c.spend || 0) * multiplier;
    }, 0);
    
    return {
      channel: channel.label,
      spend: totalSpend,
      budget: totalBudget,
      revenue: totalRevenue,
      roi: totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0
    };
  }).filter(data => data.spend > 0 || data.budget > 0);

  const goalStatusData = [
    { name: 'Completed', value: stats.completedGoals, color: '#10b981' },
    { name: 'Active', value: stats.activeGoals, color: '#3b82f6' }
  ];

  const COLORS = ['#22333B', '#5E503F', '#C6AC8F', '#EAE0D5', '#0A0908'];

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: formatPercentage(15.2), // Mock growth rate
      changeType: 'positive',
      icon: PoundSterling,
      color: 'bg-green-600'
    },
    {
      title: 'Marketing Spend',
      value: formatCurrency(stats.totalSpend),
      change: `${Math.round((stats.totalSpend / stats.totalBudget) * 100)}% of budget`,
      changeType: 'neutral',
      icon: BarChart3,
      color: 'bg-slate_blue-600'
    },
    {
      title: 'Average ROI',
      value: formatPercentage(stats.averageROI),
      change: stats.averageROI >= 100 ? 'Excellent' : stats.averageROI >= 50 ? 'Good' : 'Needs Improvement',
      changeType: stats.averageROI >= 50 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'bg-tan-600'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      change: `${stats.totalCampaigns} total`,
      changeType: 'neutral',
      icon: Megaphone,
      color: 'bg-olive-600'
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
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
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

            <button
              onClick={() => setShowImporter(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={generateWeeklyReport}
              disabled={generatingReport || !selectedClient || selectedClient === 'all'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              {generatingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{generatingReport ? 'Generating...' : 'Weekly Report'}</span>
            </button>
          </div>
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
            <h2 className="text-lg font-semibold text-slate-900">Campaign Performance</h2>
            <div className="text-sm text-slate-500">{selectedDateRange} view</div>
          </div>
          
          {campaignPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'cost' || name === 'revenue') {
                      return [formatCurrency(Number(value)), name.charAt(0).toUpperCase() + name.slice(1)];
                    }
                    if (name === 'ctr' || name === 'cvr' || name === 'roi') {
                      return [`${Number(value).toFixed(2)}%`, name.toUpperCase()];
                    }
                    return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#5E503F" name="Cost" />
                <Bar dataKey="revenue" fill="#C6AC8F" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No campaign data available</p>
                <p className="text-sm">Add campaigns to see performance metrics</p>
              </div>
            </div>
          )}
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Channel Performance</h2>
            <button
              onClick={() => {
                // Export data functionality would go here
                alert('Export functionality would be implemented here');
              }}
              className="text-slate-500 hover:text-slate-700 p-2"
              title="Export data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          {channelPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={channelPerformanceData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="channel" type="category" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'spend' || name === 'budget' || name === 'revenue') {
                      return [formatCurrency(Number(value)), name.charAt(0).toUpperCase() + name.slice(1)];
                    }
                    if (name === 'roi') {
                      return [`${Number(value).toFixed(2)}%`, 'ROI'];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="spend" fill="#22333B" name="Spend" />
                <Bar dataKey="revenue" fill="#C6AC8F" name="Revenue" />
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Marketing Campaigns</h2>
            <span className="text-sm text-slate-500">{campaigns.length} campaigns</span>
          </div>
          
          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => {
                const ChannelIcon = getChannelIcon(campaign.channel);
                const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
                const totalImpressions = campaignMetrics.reduce((sum, m) => sum + m.impressions, 0);
                const totalClicks = campaignMetrics.reduce((sum, m) => sum + m.clicks, 0);
                const totalConversions = campaignMetrics.reduce((sum, m) => sum + m.conversions, 0);
                const totalRevenue = campaignMetrics.reduce((sum, m) => sum + m.revenue, 0);
                const roi = campaign.spend > 0 ? ((totalRevenue - campaign.spend) / campaign.spend) * 100 : 0;
                
                return (
                  <div key={campaign.id} className="flex items-start justify-between p-4 bg-cream-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center">
                          <ChannelIcon className="w-5 h-5 text-slate_blue-700" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-slate-900 mr-2">{campaign.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>{campaign.clients?.name}</span>
                            <span>•</span>
                            <span>{channelOptions.find(c => c.value === campaign.channel)?.label || campaign.channel}</span>
                            <span>•</span>
                            <span>{format(parseISO(campaign.start_date), 'MMM d, yyyy')}</span>
                            {campaign.end_date && (
                              <>
                                <span>-</span>
                                <span>{format(parseISO(campaign.end_date), 'MMM d, yyyy')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
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
                        <div>
                          <p className="text-xs text-slate-500">ROI</p>
                          <p className={`font-semibold ${
                            roi > 0 ? 'text-green-600' : roi < 0 ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {formatPercentage(roi)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Impressions</p>
                          <p className="text-sm text-slate-700">{totalImpressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Clicks</p>
                          <p className="text-sm text-slate-700">{totalClicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Conversions</p>
                          <p className="text-sm text-slate-700">{totalConversions.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          // Edit campaign functionality would go here
                          alert(`Edit campaign: ${campaign.name}`);
                        }}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit campaign"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No campaigns found</p>
                <p className="text-sm text-slate-400 mb-6">
                  {selectedClient !== 'all' || selectedStatus !== 'all' || selectedDateRange !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first marketing campaign to track performance'
                  }
                </p>
                {selectedClient === 'all' && selectedStatus === 'all' && selectedDateRange === 'all' && (
                  <button
                    onClick={() => setShowAddCampaign(true)}
                    className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Add Your First Campaign
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
            <span className="text-sm text-slate-500">{goals.length} goals</span>
          </div>
          
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal) => {
                const progress = getGoalProgress(goal);
                return (
                  <div key={goal.id} className="p-4 bg-cream-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{goal.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {goal.status}
                      </span>
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
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span>{goal.clients?.name}</span>
                      <span>
                        {goal.end_date && `Due ${format(parseISO(goal.end_date), 'MMM d, yyyy')}`}
                      </span>
                    </div>
                    
                    {goal.status === 'active' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateGoalValue(goal.id, goal.current_value + 1)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          + Increment
                        </button>
                        <button
                          onClick={() => {
                            const newValue = prompt('Enter new value:', goal.current_value.toString());
                            if (newValue !== null) {
                              const parsedValue = parseFloat(newValue);
                              if (!isNaN(parsedValue)) {
                                updateGoalValue(goal.id, parsedValue);
                              }
                            }
                          }}
                          className="flex-1 bg-slate_blue-100 hover:bg-slate_blue-200 text-slate_blue-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          Update Value
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No marketing goals set</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="mt-3 text-tan-600 hover:text-tan-700 text-sm font-medium"
                >
                  Add your first goal
                </button>
              </div>
            )}
          </div>
          
          {goals.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Goal Status</h3>
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
        </div>
      </div>

      {/* Add Campaign Modal */}
      {showAddCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add Marketing Campaign</h2>
            <form onSubmit={handleAddCampaign} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client *
                  </label>
                  <select
                    value={newCampaign.client_id}
                    onChange={(e) => setNewCampaign({ ...newCampaign, client_id: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="e.g., Q2 Social Media Campaign"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Campaign objectives and details..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Channel *
                  </label>
                  <select
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  >
                    {channelOptions.map((channel) => (
                      <option key={channel.value} value={channel.value}>
                        {channel.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newCampaign.status}
                    onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Budget (GBP) *
                  </label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                    step="100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCampaign(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium transition-colors"
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
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add Marketing Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client *
                </label>
                <select
                  value={newGoal.client_id}
                  onChange={(e) => setNewGoal({ ...newGoal, client_id: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., Increase Website Traffic"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Describe the goal and how it will be measured..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                    step="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={newGoal.current_value}
                    onChange={(e) => setNewGoal({ ...newGoal, current_value: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    min="0"
                    step="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="e.g., %, visits, leads"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newGoal.start_date}
                    onChange={(e) => setNewGoal({ ...newGoal, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.end_date}
                    onChange={(e) => setNewGoal({ ...newGoal, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-tan-600 hover:bg-tan-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Import Channel Metrics</h2>
              <button
                onClick={() => setShowImporter(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6">
              {selectedClient && selectedClient !== 'all' ? (
                <ChannelMetricsImporter
                  clientId={selectedClient}
                  onImportSuccess={() => {
                    setShowImporter(false);
                    loadData();
                  }}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Please select a client from the dropdown above to import metrics.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}