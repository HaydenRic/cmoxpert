import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Globe, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Zap, 
  Target, 
  Users, 
  Calendar, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  RefreshCw,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
  Info
} from 'lucide-react';
import { format, subDays, isWithinInterval } from 'date-fns';
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
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';

interface Competitor {
  id: string;
  client_id: string;
  name: string;
  domain: string;
  tracked_since: string;
  created_at: string;
  clients?: {
    name: string;
    user_id: string;
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

interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
}

interface CompetitorInsight {
  competitor: string;
  domain: string;
  estimatedTraffic: number;
  trafficChange: number;
  topKeywords: string[];
  recentChanges: string[];
  threatLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

export function CompetitiveIntelligence() {
  const { user } = useAuth();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [alerts, setAlerts] = useState<CompetitiveAlert[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [insights, setInsights] = useState<CompetitorInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedAlertType, setSelectedAlertType] = useState('all');
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    client_id: '',
    name: '',
    domain: ''
  });

  const alertTypes = [
    { value: 'new_content', label: 'New Content', color: 'bg-blue-100 text-blue-800' },
    { value: 'pricing_change', label: 'Pricing Change', color: 'bg-orange-100 text-orange-800' },
    { value: 'ad_campaign', label: 'Ad Campaign', color: 'bg-tan-100 text-tan-800' },
    { value: 'product_update', label: 'Product Update', color: 'bg-green-100 text-green-800' },
    { value: 'website_change', label: 'Website Change', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedClient]);

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

      // Load competitors
      let competitorQuery = supabase
        .from('competitors')
        .select(`
          *,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user!.id);

      if (selectedClient !== 'all') {
        competitorQuery = competitorQuery.eq('client_id', selectedClient);
      }

      const { data: competitorsData } = await competitorQuery.order('created_at', { ascending: false });

      setCompetitors(competitorsData || []);

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
        .limit(50);

      setAlerts(alertsData || []);

      // Generate mock insights for competitors
      generateCompetitorInsights(competitorsData || []);

    } catch (error) {
      console.error('Error loading competitive intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCompetitorInsights = (competitorsData: Competitor[]) => {
    const mockInsights: CompetitorInsight[] = competitorsData.map(competitor => ({
      competitor: competitor.name,
      domain: competitor.domain,
      estimatedTraffic: Math.floor(Math.random() * 100000) + 10000,
      trafficChange: (Math.random() - 0.5) * 40, // -20% to +20%
      topKeywords: [
        `${competitor.name.toLowerCase()} software`,
        `${competitor.name.toLowerCase()} platform`,
        `${competitor.name.toLowerCase()} alternative`,
        'B2B SaaS solution',
        'enterprise software'
      ],
      recentChanges: [
        'Updated pricing page',
        'New blog post published',
        'Product feature announcement',
        'Team page updated'
      ].slice(0, Math.floor(Math.random() * 4) + 1),
      threatLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      lastUpdated: new Date().toISOString()
    }));

    setInsights(mockInsights);
  };

  const addCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('competitors')
        .insert([newCompetitor]);

      if (error) throw error;

      setNewCompetitor({
        client_id: '',
        name: '',
        domain: ''
      });
      setShowAddCompetitor(false);
      loadData();
    } catch (error) {
      console.error('Error adding competitor:', error);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('competitive_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      loadData();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const deleteCompetitor = async (competitorId: string) => {
    if (!confirm('Are you sure you want to stop tracking this competitor?')) return;

    try {
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', competitorId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting competitor:', error);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeColor = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type);
    return alertType?.color || 'bg-gray-100 text-gray-800';
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = selectedAlertType === 'all' || alert.alert_type === selectedAlertType;
    return matchesType;
  });

  const unreadAlertsCount = alerts.filter(alert => !alert.is_read).length;

  // Prepare chart data
  const trafficTrendData = insights.map(insight => ({
    name: insight.competitor,
    traffic: insight.estimatedTraffic,
    change: insight.trafficChange
  }));

  const threatDistribution = [
    { name: 'High Threat', value: insights.filter(i => i.threatLevel === 'high').length, color: '#ef4444' },
    { name: 'Medium Threat', value: insights.filter(i => i.threatLevel === 'medium').length, color: '#f59e0b' },
    { name: 'Low Threat', value: insights.filter(i => i.threatLevel === 'low').length, color: '#10b981' }
  ];

  const alertTrendData = alertTypes.map(type => ({
    type: type.label,
    count: alerts.filter(alert => alert.alert_type === type.value).length
  }));

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Competitive Intelligence</h1>
          <p className="text-slate-600">Monitor competitors, track market changes, and stay ahead of the competition</p>
        </div>
        
        <div className="flex items-center space-x-4">
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
          
          <button
            onClick={loadData}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowAddCompetitor(true)}
            className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competitor</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {unreadAlertsCount > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">
                {unreadAlertsCount} New Competitive Alert{unreadAlertsCount > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-orange-700">
                Your competitors have made recent changes that require your attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate_blue-600 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{competitors.length}</div>
              <div className="text-sm text-slate-500">Tracked</div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Competitors</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{unreadAlertsCount}</div>
              <div className="text-sm text-slate-500">Unread</div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">New Alerts</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {insights.filter(i => i.threatLevel === 'high').length}
              </div>
              <div className="text-sm text-slate-500">High Threat</div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Threat Level</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                {alerts.filter(a => isWithinInterval(new Date(a.alerted_at), {
                  start: subDays(new Date(), 7),
                  end: new Date()
                })).length}
              </div>
              <div className="text-sm text-slate-500">This Week</div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Activity</h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Estimated Traffic Comparison</h2>
          </div>
          
          {trafficTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trafficTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'traffic' ? `${Number(value).toLocaleString()} visits` : `${Number(value).toFixed(1)}%`,
                    name === 'traffic' ? 'Monthly Traffic' : 'Change'
                  ]}
                />
                <Bar dataKey="traffic" fill="#22333B" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No competitor data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Threat Level Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Threat Level Distribution</h2>
          </div>
          
          {threatDistribution.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <RechartsPieChart dataKey="value" data={threatDistribution} cx="50%" cy="50%" outerRadius={100}>
                  {threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No threat data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Competitor Insights</h2>
            <span className="text-sm text-slate-500">{insights.length} competitors</span>
          </div>
          
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div key={index} className="p-4 bg-cream-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-slate_blue-700" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{insight.competitor}</h3>
                        <p className="text-sm text-slate-500">{insight.domain}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatLevelColor(insight.threatLevel)}`}>
                      {insight.threatLevel} threat
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Monthly Traffic</p>
                      <p className="font-semibold text-slate-900">{insight.estimatedTraffic.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Traffic Change</p>
                      <div className="flex items-center space-x-1">
                        {insight.trafficChange > 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-green-600" />
                        ) : insight.trafficChange < 0 ? (
                          <ArrowDownRight className="w-3 h-3 text-red-600" />
                        ) : (
                          <Minus className="w-3 h-3 text-slate-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          insight.trafficChange > 0 ? 'text-green-600' :
                          insight.trafficChange < 0 ? 'text-red-600' :
                          'text-slate-500'
                        }`}>
                          {insight.trafficChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Recent Changes</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.recentChanges.slice(0, 2).map((change, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                          {change}
                        </span>
                      ))}
                      {insight.recentChanges.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                          +{insight.recentChanges.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Updated {format(new Date(insight.lastUpdated), 'MMM d')}
                    </span>
                    <a
                      href={`https://${insight.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate_blue-600 hover:text-slate_blue-700 text-xs flex items-center"
                    >
                      Visit site <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Eye className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No competitors tracked yet</p>
                <button
                  onClick={() => setShowAddCompetitor(true)}
                  className="mt-3 text-slate_blue-600 hover:text-slate_blue-700 text-sm font-medium"
                >
                  Add your first competitor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Alerts</h2>
            <div className="flex items-center space-x-2">
              <select
                value={selectedAlertType}
                onChange={(e) => setSelectedAlertType(e.target.value)}
                className="text-sm border border-slate-300 rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                {alertTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    alert.is_read 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                  }`}
                  onClick={() => !alert.is_read && markAlertAsRead(alert.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                        {alert.alert_type.replace('_', ' ')}
                      </span>
                      {!alert.is_read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {format(new Date(alert.alerted_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-slate-900 mb-1">
                    {alert.competitors?.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {alert.competitors?.clients?.name}
                    </span>
                    <a
                      href={`https://${alert.competitors?.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate_blue-600 hover:text-slate_blue-700 text-xs flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No alerts yet</p>
                <p className="text-xs text-slate-400">Alerts will appear when competitors make changes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Competitor Modal */}
      {showAddCompetitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Competitor</h2>
            <form onSubmit={addCompetitor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client *
                </label>
                <select
                  value={newCompetitor.client_id}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, client_id: e.target.value })}
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
                  Competitor Name *
                </label>
                <input
                  type="text"
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., Competitor Inc"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain *
                </label>
                <input
                  type="text"
                  value={newCompetitor.domain}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, domain: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., competitor.com"
                  required
                />
              </div>
              
              <div className="bg-slate_blue-50 rounded-lg p-3 border border-slate_blue-100">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-slate_blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate_blue-900 font-medium">Automated Monitoring</p>
                    <p className="text-xs text-slate_blue-700">
                      We'll automatically track this competitor's website changes, content updates, and pricing modifications.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Competitor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCompetitor(false)}
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