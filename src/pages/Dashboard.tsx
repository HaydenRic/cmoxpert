import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  Rocket,
  Users,
  FileText,
  Clock,
  Activity,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Brain,
  Settings,
  Sparkles,
  XCircle,
  UserPlus,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ClientSelector } from '../components/ClientSelector';
import { AIFeatureTour } from '../components/AIFeatureTour';
import { ManualMetricEntry } from '../components/ManualMetricEntry';
import { MetricsUpload } from '../components/MetricsUpload';

interface DashboardStats {
  totalClients: number;
  clientsNeedingOnboarding: number;
  totalReports: number;
  completedReports: number;
  pendingReports: number;
  recentActivity: any[];
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    clientsNeedingOnboarding: 0,
    totalClients: 0,
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      checkIfNewUser();
    }
  }, [user, selectedClientId]);

  const checkIfNewUser = async () => {
    try {
      const tourCompleted = localStorage.getItem(`tour_completed_${user!.id}`);
      if (!tourCompleted) {
        const { count } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id);

        if (count === 0) {
          setTimeout(() => setShowTour(true), 1000);
        }
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem(`tour_completed_${user!.id}`, 'true');
    setShowTour(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem(`tour_completed_${user!.id}`, 'true');
    setShowTour(false);
  };

  const loadDashboardData = async () => {
    try {
      setError(null);
      // Build queries with optional client filter
      let clientCountQuery = supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      if (selectedClientId) {
        clientCountQuery = clientCountQuery.eq('id', selectedClientId);
      }

      let reportsQuery = supabase
        .from('reports')
        .select(`
          id,
          status,
          created_at,
          clients!inner(user_id)
        `, { count: 'exact' })
        .eq('clients.user_id', user!.id);

      if (selectedClientId) {
        reportsQuery = reportsQuery.eq('client_id', selectedClientId);
      }

      let recentActivityQuery = supabase
        .from('reports')
        .select(`
          id,
          status,
          created_at,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (selectedClientId) {
        recentActivityQuery = recentActivityQuery.eq('client_id', selectedClientId);
      }

      let firstClientQuery = supabase
        .from('clients')
        .select('id')
        .eq('user_id', user!.id);

      if (selectedClientId) {
        firstClientQuery = firstClientQuery.eq('id', selectedClientId);
      } else {
        firstClientQuery = firstClientQuery.limit(1);
      }

      // Execute all queries in parallel for better performance
      const [
        clientCountResult,
        reportsResult,
        recentActivityResult,
        firstClientResult
      ] = await Promise.all([
        clientCountQuery,
        reportsQuery,
        recentActivityQuery,
        firstClientQuery
      ]);

      const { count: clientCount, error: clientError } = clientCountResult;
      const { data: reports, count: reportCount, error: reportsError } = reportsResult;
      const { data: recentActivity, error: activityError } = recentActivityResult;
      const { data: clients, error: clientsQueryError } = firstClientResult;

      // Handle errors gracefully - don't fail completely if one query fails
      if (clientError) {
        console.error('Error loading clients:', clientError);
        setError('Some client data could not be loaded. Please refresh the page.');
      }
      if (reportsError) {
        console.error('Error loading reports:', reportsError);
      }
      if (activityError) {
        console.error('Error loading activity:', activityError);
      }
      if (clientsQueryError) {
        console.error('Error loading clients for metrics:', clientsQueryError);
      }

      const completedReports = reports?.filter(r => r.status === 'completed').length || 0;
      const pendingReports = reports?.filter(r => r.status === 'pending').length || 0;

      setStats({
        clientsNeedingOnboarding: 0,
        totalClients: clientCount || 0,
        totalReports: reportCount || 0,
        completedReports,
        pendingReports,
        recentActivity: recentActivity || []
      });
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(
        'Unable to load dashboard data. Please check your connection and refresh the page. ' +
        (error.message || '')
      );

      // Set minimal stats to allow dashboard to render
      setStats({
        clientsNeedingOnboarding: 0,
        totalClients: 0,
        totalReports: 0,
        completedReports: 0,
        pendingReports: 0,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'from-cyan-accent to-cyan-accent/60',
      change: '+12%',
      changeType: 'positive',
      link: '/clients'
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      color: 'from-teal-accent to-teal-accent/60',
      change: '+8%',
      changeType: 'positive',
      link: '/reports'
    },
    {
      title: 'Completed',
      value: stats.completedReports,
      icon: CheckCircle,
      color: 'from-purple-accent to-purple-accent/60',
      change: `${stats.completedReports}/${stats.totalReports}`,
      changeType: 'neutral',
      link: '/reports'
    },
    {
      title: 'In Progress',
      value: stats.pendingReports,
      icon: Clock,
      color: 'from-orange-accent to-orange-accent/60',
      change: 'Active',
      changeType: 'neutral',
      link: '/reports'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 bg-dark-bg-500 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-bg-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-bg-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && stats.totalClients === 0 && stats.totalReports === 0) {
    return (
      <div className="p-8 bg-dark-bg-500 min-h-screen">
        <div className="bg-dark-bg-700 border border-orange-accent/50 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Dashboard</h3>
              <p className="text-slate-300 mb-4">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setLoading(true);
                    loadDashboardData();
                  }}
                  className="px-4 py-2 bg-orange-accent hover:bg-orange-accent/90 text-dark-bg-500 rounded-lg font-medium transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-dark-bg-600 hover:bg-dark-bg-700 text-orange-accent border border-orange-accent/50 rounded-lg font-medium transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-dark-bg-500 min-h-screen">
      {/* AI Feature Tour */}
      {showTour && (
        <AIFeatureTour onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}

      {/* Error Banner */}
      {error && stats.totalClients > 0 && (
        <div className="mb-6 bg-dark-bg-700 border border-orange-accent/50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="text-orange-accent/90 text-sm">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadDashboardData();
              }}
              className="px-3 py-1 bg-orange-accent hover:bg-orange-accent/90 text-dark-bg-500 rounded text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-slate-300 mb-4">
              {selectedClientId
                ? 'Viewing data for selected client'
                : "Here's what's happening with your client portfolio today."}
            </p>
            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/clients?action=new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-accent to-cyan-accent/80 hover:from-cyan-accent/90 hover:to-cyan-accent/70 text-dark-bg-500 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-accent/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Client</span>
              </Link>
              <Link
                to="/content"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-accent to-purple-accent/80 hover:from-purple-accent/90 hover:to-purple-accent/70 text-dark-bg-500 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-accent/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Content</span>
              </Link>
              <Link
                to="/playbooks"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-accent to-orange-accent/80 hover:from-orange-accent/90 hover:to-orange-accent/70 text-dark-bg-500 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-orange-accent/30"
              >
                <BookOpen className="w-4 h-4" />
                <span>Create Playbook</span>
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-80">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Client
            </label>
            <ClientSelector
              value={selectedClientId}
              onChange={(clientId) => setSelectedClientId(clientId)}
              placeholder="All clients"
              allowClear={true}
              filterStatus={['active', 'inactive']}
            />
          </div>
        </div>
      </div>

      {/* Onboarding Banner */}
      {stats.clientsNeedingOnboarding > 0 && (
        <div className="mb-6 bg-gradient-to-r from-dark-bg-700 to-dark-bg-600 border border-cyan-accent/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Rocket className="w-5 h-5 text-cyan-accent" />
            <div>
              <p className="font-medium text-white">
                {stats.clientsNeedingOnboarding} {stats.clientsNeedingOnboarding === 1 ? 'Client' : 'Clients'} Need Onboarding
              </p>
              <p className="text-sm text-slate-300">
                Complete the guided setup process to get AI-powered insights and recommendations.
              </p>
            </div>
            <Link
              to="/clients"
              className="ml-auto bg-cyan-accent hover:bg-cyan-accent/90 text-dark-bg-500 px-4 py-2 rounded-lg text-sm font-medium"
            >
              View Clients
            </Link>
          </div>
        </div>
      )}

      {/* AI Status Card */}
      <div className="mb-6 bg-gradient-to-br from-dark-bg-700 to-dark-bg-600 border border-cyan-accent/30 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-6 h-6 text-cyan-accent" />
              <h2 className="text-lg font-bold text-white">AI Features Status</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-dark-bg-800 rounded-lg p-3 border border-cyan-accent/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">Content Generation</span>
                  <XCircle className="w-4 h-4 text-orange-accent" />
                </div>
                <p className="text-xs text-slate-400">Template Mode</p>
              </div>
              <div className="bg-dark-bg-800 rounded-lg p-3 border border-teal-accent/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">AI Playbooks</span>
                  <CheckCircle className="w-4 h-4 text-teal-accent" />
                </div>
                <p className="text-xs text-slate-400">Template Mode Active</p>
              </div>
              <div className="bg-dark-bg-800 rounded-lg p-3 border border-purple-accent/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">Market Analysis</span>
                  <XCircle className="w-4 h-4 text-orange-accent" />
                </div>
                <p className="text-xs text-slate-400">API Key Required</p>
              </div>
            </div>
          </div>
          <Link
            to="/admin"
            className="ml-4 flex items-center space-x-2 bg-gradient-to-r from-cyan-accent to-teal-accent text-dark-bg-500 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-accent/30"
          >
            <Settings className="w-4 h-4" />
            <span>Configure AI</span>
          </Link>
        </div>
        <div className="mt-4 pt-4 border-t border-cyan-accent/20">
          <p className="text-sm text-cyan-accent/80 flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Add OpenAI API key in Admin Settings to unlock AI-powered content generation</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-dark-bg-700 rounded-xl shadow-lg border border-slate-700/50 p-6 hover:border-cyan-accent/50 transition-all hover:shadow-lg hover:shadow-cyan-accent/20 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-dark-bg-500" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-teal-accent' :
                  stat.changeType === 'negative' ? 'text-orange-accent' : 'text-slate-400'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-300 group-hover:text-cyan-accent transition-colors">{stat.title}</h3>
            <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View details</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Removed: Fraud Analysis and Activation Funnel cards - features deprecated */}

      {/* Metrics Management Section */}
      {selectedClientId && (
        <div className="mb-8 space-y-6">
          <h2 className="text-xl font-bold text-white">Metrics Management</h2>
          <ManualMetricEntry clientId={selectedClientId} onSuccess={loadDashboardData} />
          <MetricsUpload clientId={selectedClientId} onSuccess={loadDashboardData} />
        </div>
      )}

      {!selectedClientId && (
        <div className="mb-8 bg-dark-bg-700 border border-cyan-accent/30 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-accent" />
            <div>
              <h3 className="font-semibold text-white mb-1">Track Metrics</h3>
              <p className="text-sm text-slate-300">
                Select a client above to add metrics manually or import from CSV
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-dark-bg-700 rounded-xl shadow-lg border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-cyan-accent" />
              Recent Activity
            </h2>
            <Link 
              to="/reports" 
              className="text-cyan-accent hover:text-teal-accent text-sm font-medium flex items-center"
            >
              View all <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-dark-bg-800 rounded-lg border border-slate-700/50 hover:border-cyan-accent/30 transition-all">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-teal-accent/20' : 'bg-orange-accent/20'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className={`w-5 h-5 ${
                        activity.status === 'completed' ? 'text-teal-accent' : 'text-orange-accent'
                      }`} />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Market analysis for {activity.clients.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(activity.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' 
                      ? 'bg-teal-accent/20 text-teal-accent' 
                      : 'bg-orange-accent/20 text-orange-accent'
                  }`}>
                    {activity.status === 'completed' ? 'Complete' : 'Processing'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No recent activity</p>
                <Link 
                  to="/clients" 
                  className="text-cyan-accent hover:text-teal-accent text-sm font-medium"
                >
                  Add your first client to get started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-bg-700 rounded-xl shadow-lg border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-cyan-accent" />
            Quick Actions
          </h2>
          
          <div className="space-y-4">
            <Link 
              to="/performance"
              className="block p-4 bg-gradient-to-br from-dark-bg-800 to-dark-bg-700 rounded-lg border border-cyan-accent/30 hover:border-cyan-accent/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-cyan-accent transition-colors">
                    View Performance Dashboard
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Monitor KPIs, track campaigns, and competitive intelligence
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-cyan-accent/60 group-hover:text-cyan-accent transition-colors" />
              </div>
            </Link>

            <Link 
              to="/marketing-analytics"
              className="block p-4 bg-gradient-to-br from-dark-bg-800 to-dark-bg-700 rounded-lg border border-teal-accent/30 hover:border-teal-accent/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-teal-accent transition-colors">
                    Marketing Analytics
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Track campaigns, ROI, and marketing goals
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-teal-accent/60 group-hover:text-teal-accent transition-colors" />
              </div>
            </Link>

            <Link 
              to="/competitive-intelligence"
              className="block p-4 bg-gradient-to-br from-dark-bg-800 to-dark-bg-700 rounded-lg border border-orange-accent/30 hover:border-orange-accent/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-orange-accent transition-colors">
                    Competitive Intelligence
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Monitor competitors and receive real-time market alerts
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-orange-accent/60 group-hover:text-orange-accent transition-colors" />
              </div>
            </Link>

            <Link 
              to="/content"
              className="block p-4 bg-gradient-to-br from-dark-bg-800 to-dark-bg-700 rounded-lg border border-purple-accent/30 hover:border-purple-accent/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-purple-accent transition-colors">
                    AI Content Hub
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Generate blog posts, social media, and marketing copy with AI
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-purple-accent/60 group-hover:text-purple-accent transition-colors" />
              </div>
            </Link>

            <Link 
              to="/clients?action=new"
              className="block p-4 bg-gradient-to-br from-dark-bg-800 to-dark-bg-700 rounded-lg border border-cyan-accent/30 hover:border-cyan-accent/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-cyan-accent transition-colors">
                    Add New Client
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Start with client onboarding and domain analysis
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-cyan-accent/60 group-hover:text-cyan-accent transition-colors" />
              </div>
            </Link>

            <Link 
              to="/playbooks"
              className="block p-4 bg-gradient-to-br from-dark-bg-800 to-dark-bg-700 rounded-lg border border-teal-accent/30 hover:border-teal-accent/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-teal-accent transition-colors">
                    Browse Playbooks
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Deploy proven marketing strategies
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-teal-accent/60 group-hover:text-teal-accent transition-colors" />
              </div>
            </Link>

            <Link 
              to="/reports"
              className="block p-4 bg-gradient-to-br from-dark-bg-800 to-dark-bg-700 rounded-lg border border-purple-accent/30 hover:border-purple-accent/60 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white group-hover:text-purple-accent transition-colors">
                    View Reports
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Access completed market analyses
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-purple-accent/60 group-hover:text-purple-accent transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}