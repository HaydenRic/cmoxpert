import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
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

interface KPI {
  id: string;
  client_id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  period: string;
  tracked_at: string;
  clients?: {
    name: string;
  };
}

interface CompetitiveAlert {
  id: string;
  competitor_id: string;
  alert_type: string;
  description: string;
  details: any;
  is_read: boolean;
  alerted_at: string;
  competitors?: {
    name: string;
    domain: string;
    clients?: {
      name: string;
    };
  };
}

interface Campaign {
  id: string;
  budget_id: string;
  name: string;
  channel: string;
  start_date: string;
  end_date?: string;
  cost: number;
  revenue: number;
  status: string;
  budgets?: {
    client_id: string;
    period: string;
    allocated_amount: number;
    spent_amount: number;
    currency: string;
    clients?: {
      name: string;
    };
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
  averageROI: number;
  activeKPIs: number;
  unreadAlerts: number;
  activeCampaigns: number;
  revenueGrowth: number;
  spendGrowth: number;
}

export function Performance() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [alerts, setAlerts] = useState<CompetitiveAlert[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalSpend: 0,
    averageROI: 0,
    activeKPIs: 0,
    unreadAlerts: 0,
    activeCampaigns: 0,
    revenueGrowth: 0,
    spendGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedClient, setSelectedClient] = useState('all');
  const [showAddKPI, setShowAddKPI] = useState(false);
  const [newKPI, setNewKPI] = useState({
    client_id: '',
    name: '',
    value: 0,
    target: 0,
    unit: '',
    period: 'monthly'
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedPeriod, selectedClient]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load clients first
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

      // Load KPIs
      let kpiQuery = supabase
        .from('kpis')
        .select(`
          *,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user!.id);

      if (selectedPeriod !== 'all') {
        kpiQuery = kpiQuery.eq('period', selectedPeriod);
      }

      if (selectedClient !== 'all') {
        kpiQuery = kpiQuery.eq('client_id', selectedClient);
      }

      const { data: kpisData } = await kpiQuery.order('tracked_at', { ascending: false });

      // Load competitive alerts
      const { data: alertsData } = await supabase
        .from('competitive_alerts')
        .select(`
          *,
          competitors!inner(
            name,
            domain,
            clients!inner(name, user_id)
          )
        `)
        .eq('competitors.clients.user_id', user!.id)
        .order('alerted_at', { ascending: false })
        .limit(10);

      // Load campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select(`
          *,
          budgets!inner(
            client_id,
            period,
            allocated_amount,
            spent_amount,
            currency,
            clients!inner(name, user_id)
          )
        `)
        .eq('budgets.clients.user_id', user!.id)
        .order('start_date', { ascending: false });

      setKpis(kpisData || []);
      setAlerts(alertsData || []);
      setCampaigns(campaignsData || []);

      // Calculate dashboard stats
      calculateStats(kpisData || [], campaignsData || [], alertsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (kpisData: KPI[], campaignsData: Campaign[], alertsData: CompetitiveAlert[]) => {
    const totalRevenue = campaignsData.reduce((sum, campaign) => sum + (campaign.revenue || 0), 0);
    const totalSpend = campaignsData.reduce((sum, campaign) => sum + (campaign.cost || 0), 0);
    const averageROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const activeKPIs = kpisData.length;
    const unreadAlerts = alertsData.filter(alert => !alert.is_read).length;
    const activeCampaigns = campaignsData.filter(campaign => campaign.status === 'running').length;

    // Calculate growth (simplified - comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sixtyDaysAgo = subDays(new Date(), 60);

    const recentRevenue = campaignsData
      .filter(c => new Date(c.start_date) >= thirtyDaysAgo)
      .reduce((sum, c) => sum + (c.revenue || 0), 0);

    const previousRevenue = campaignsData
      .filter(c => new Date(c.start_date) >= sixtyDaysAgo && new Date(c.start_date) < thirtyDaysAgo)
      .reduce((sum, c) => sum + (c.revenue || 0), 0);

    const recentSpend = campaignsData
      .filter(c => new Date(c.start_date) >= thirtyDaysAgo)
      .reduce((sum, c) => sum + (c.cost || 0), 0);

    const previousSpend = campaignsData
      .filter(c => new Date(c.start_date) >= sixtyDaysAgo && new Date(c.start_date) < thirtyDaysAgo)
      .reduce((sum, c) => sum + (c.cost || 0), 0);

    const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const spendGrowth = previousSpend > 0 ? ((recentSpend - previousSpend) / previousSpend) * 100 : 0;

    setStats({
      totalRevenue,
      totalSpend,
      averageROI,
      activeKPIs,
      unreadAlerts,
      activeCampaigns,
      revenueGrowth,
      spendGrowth
    });
  };

  const handleAddKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('kpis')
        .insert([{
          ...newKPI,
          user_id: user!.id
        }]);

      if (error) throw error;

      setNewKPI({
        client_id: '',
        name: '',
        value: 0,
        target: 0,
        unit: '',
        period: 'monthly'
      });
      setShowAddKPI(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error adding KPI:', error);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('competitive_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      loadDashboardData();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getKPIPerformance = (kpi: KPI) => {
    if (!kpi.target) return { status: 'neutral', percentage: 0 };
    
    const percentage = (kpi.value / kpi.target) * 100;
    
    if (percentage >= 100) return { status: 'success', percentage };
    if (percentage >= 80) return { status: 'warning', percentage };
    return { status: 'danger', percentage };
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

  // Prepare chart data
  const kpiTrendData = kpis
    .filter(kpi => kpi.period === selectedPeriod)
    .reduce((acc, kpi) => {
      const date = format(new Date(kpi.tracked_at), 'MMM dd');
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing[kpi.name] = kpi.value;
      } else {
        acc.push({
          date,
          [kpi.name]: kpi.value
        });
      }
      
      return acc;
    }, [] as any[])
    .slice(-7); // Last 7 data points

  const campaignChannelData = campaigns
    .reduce((acc, campaign) => {
      const existing = acc.find(item => item.channel === campaign.channel);
      
      if (existing) {
        existing.spend += campaign.cost;
        existing.revenue += campaign.revenue || 0;
      } else {
        acc.push({
          channel: campaign.channel,
          spend: campaign.cost,
          revenue: campaign.revenue || 0
        });
      }
      
      return acc;
    }, [] as any[]);

  const roiData = campaigns
    .filter(c => c.cost > 0)
    .map(campaign => ({
      name: campaign.name,
      roi: campaign.cost > 0 ? ((campaign.revenue - campaign.cost) / campaign.cost) * 100 : 0,
      spend: campaign.cost,
      revenue: campaign.revenue
    }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: formatPercentage(stats.revenueGrowth),
      changeType: stats.revenueGrowth >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'bg-slate_blue-600'
    },
    {
      title: 'Marketing Spend',
      value: formatCurrency(stats.totalSpend),
      change: formatPercentage(stats.spendGrowth),
      changeType: stats.spendGrowth <= 10 ? 'positive' : 'negative', // Lower spend growth is better
      icon: TrendingUp,
      color: 'bg-tan-600'
    },
    {
      title: 'Average ROI',
      value: formatPercentage(stats.averageROI),
      change: stats.averageROI >= 200 ? 'Excellent' : stats.averageROI >= 100 ? 'Good' : 'Needs Improvement',
      changeType: stats.averageROI >= 100 ? 'positive' : 'negative',
      icon: Target,
      color: 'bg-olive-600'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      change: `${stats.activeKPIs} KPIs tracked`,
      changeType: 'neutral',
      icon: Activity,
      color: 'bg-charcoal-700'
    }
  ];

  const alertTypeColors = {
    new_content: 'bg-blue-100 text-blue-800',
    pricing_change: 'bg-orange-100 text-orange-800',
    ad_campaign: 'bg-tan-100 text-tan-800',
    product_update: 'bg-green-100 text-green-800',
    website_change: 'bg-gray-100 text-gray-800'
  };

  const COLORS = ['#22333B', '#5E503F', '#C6AC8F', '#EAE0D5', '#0A0908'];

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Dashboard</h1>
          <p className="text-slate-600">Monitor KPIs, track campaigns, and stay ahead of competitors</p>
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
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
            >
              <option value="all">All Periods</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          
          <button
            onClick={loadDashboardData}
            className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowAddKPI(true)}
            className="bg-gradient-to-r from-tan-600 to-olive-600 hover:from-tan-700 hover:to-olive-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add KPI</span>
          </button>
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
                <div className={`text-sm flex items-center ${
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

      {/* Alerts Banner */}
      {stats.unreadAlerts > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">
                {stats.unreadAlerts} New Competitive Alert{stats.unreadAlerts > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-orange-700">
                Stay informed about your competitors' latest moves and market changes.
              </p>
            </div>
            <Link
              to="#alerts"
              className="ml-auto bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              View Alerts
            </Link>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* KPI Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">KPI Trends</h2>
            <div className="text-sm text-slate-500">{selectedPeriod} view</div>
          </div>
          
          {kpiTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpiTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                {Object.keys(kpiTrendData[0] || {})
                  .filter(key => key !== 'date')
                  .map((key, index) => (
                    <Line 
                      key={key}
                      type="monotone" 
                      dataKey={key} 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={2}
                      dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No KPI data available</p>
                <p className="text-sm">Add KPIs to see trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Performance by Channel */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Campaign Performance by Channel</h2>
          </div>
          
          {campaignChannelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignChannelData}>
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
                    formatCurrency(Number(value)), 
                    name === 'spend' ? 'Spend' : 'Revenue'
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
                <p>No campaign data available</p>
                <p className="text-sm">Create campaigns to see performance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPIs List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Key Performance Indicators</h2>
            <span className="text-sm text-slate-500">{kpis.length} KPIs</span>
          </div>
          
          <div className="space-y-4">
            {kpis.length > 0 ? (
              kpis.slice(0, 10).map((kpi) => {
                const performance = getKPIPerformance(kpi);
                return (
                  <div key={kpi.id} className="flex items-center justify-between p-4 bg-cream-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-slate-900">{kpi.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-slate-900">
                            {kpi.value.toLocaleString()}{kpi.unit}
                          </span>
                          {kpi.target && (
                            <span className="text-sm text-slate-500">
                              / {kpi.target.toLocaleString()}{kpi.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">{kpi.clients?.name}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 capitalize">{kpi.period}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(kpi.tracked_at), 'MMM d')}
                          </span>
                        </div>
                        
                        {kpi.target && (
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  performance.status === 'success' ? 'bg-green-500' :
                                  performance.status === 'warning' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(performance.percentage, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              performance.status === 'success' ? 'text-green-600' :
                              performance.status === 'warning' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {performance.percentage.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No KPIs tracked yet</p>
                <p className="text-sm text-slate-400">Add KPIs to monitor your performance</p>
                <button
                  onClick={() => setShowAddKPI(true)}
                  className="mt-4 bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add Your First KPI
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Competitive Alerts */}
        <div id="alerts" className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Competitive Alerts</h2>
            <span className="text-sm text-slate-500">{alerts.length} alerts</span>
          </div>
          
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    alert.is_read 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                  }`}
                  onClick={() => !alert.is_read && markAlertAsRead(alert.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alertTypeColors[alert.alert_type] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.alert_type.replace('_', ' ')}
                      </span>
                      {!alert.is_read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {format(new Date(alert.alerted_at), 'MMM d')}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-slate-900 mb-1">
                    {alert.competitors?.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {alert.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {alert.competitors?.clients?.name}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No alerts yet</p>
                <p className="text-xs text-slate-400">Set up competitor monitoring to receive alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI Analysis */}
      {roiData.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Campaign ROI Analysis</h2>
            <Link 
              to="/campaigns" 
              className="text-slate_blue-600 hover:text-slate_blue-700 text-sm font-medium flex items-center"
            >
              View All Campaigns <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
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
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add KPI Modal */}
      {showAddKPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New KPI</h2>
            <form onSubmit={handleAddKPI} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client
                </label>
                <select
                  value={newKPI.client_id}
                  onChange={(e) => setNewKPI({ ...newKPI, client_id: e.target.value })}
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
                  KPI Name
                </label>
                <input
                  type="text"
                  value={newKPI.name}
                  onChange={(e) => setNewKPI({ ...newKPI, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., Monthly Recurring Revenue"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={newKPI.value}
                    onChange={(e) => setNewKPI({ ...newKPI, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={newKPI.target}
                    onChange={(e) => setNewKPI({ ...newKPI, target: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newKPI.unit}
                    onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="e.g., £, %, leads"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Period
                  </label>
                  <select
                    value={newKPI.period}
                    onChange={(e) => setNewKPI({ ...newKPI, period: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add KPI
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddKPI(false)}
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