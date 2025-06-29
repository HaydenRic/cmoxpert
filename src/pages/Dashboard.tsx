import React, { useEffect, useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Lazy load the Spline component for better performance
const SplineSceneBasic = React.lazy(() => 
  import('../components/ui/spline-demo').then(module => ({ default: module.SplineSceneBasic }))
);

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

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Get client count
      const { count: clientCount } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      // Get clients needing onboarding
      const { data: onboardingData } = await supabase
        .from('onboarding_progress')
        .select(`
          client_id,
          is_completed
        `)
        .eq('user_id', user!.id)
        .eq('is_completed', false);

      // Get report stats
      const { data: reports, count: reportCount } = await supabase
        .from('reports')
        .select(`
          *,
          clients!inner(user_id)
        `, { count: 'exact' })
        .eq('clients.user_id', user!.id);

      const completedReports = reports?.filter(r => r.status === 'completed').length || 0;
      const pendingReports = reports?.filter(r => r.status === 'pending').length || 0;

      // Get recent activity (latest reports with client names)
      const { data: recentActivity } = await supabase
        .from('reports')
        .select(`
          *,
          clients!inner(name, user_id)
        `)
        .eq('clients.user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        clientsNeedingOnboarding: onboardingData?.length || 0,
        totalClients: clientCount || 0,
        totalReports: reportCount || 0,
        completedReports,
        pendingReports,
        recentActivity: recentActivity || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-dark_moss_green-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      color: 'bg-pakistan_green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Completed',
      value: stats.completedReports,
      icon: CheckCircle,
      color: 'bg-pakistan_green-500',
      change: `${stats.completedReports}/${stats.totalReports}`,
      changeType: 'neutral'
    },
    {
      title: 'In Progress',
      value: stats.pendingReports,
      icon: Clock,
      color: 'bg-earth_yellow-500',
      change: 'Active',
      changeType: 'neutral'
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-slate-600">
          Here's what's happening with your client portfolio today.
        </p>
      </div>

      {/* Onboarding Banner */}
      {stats.clientsNeedingOnboarding > 0 && (
        <div className="mb-6 bg-gradient-to-r from-slate_blue-50 to-cream-100 border border-slate_blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Rocket className="w-5 h-5 text-slate_blue-600" />
            <div>
              <p className="font-medium text-slate_blue-900">
                {stats.clientsNeedingOnboarding} {stats.clientsNeedingOnboarding === 1 ? 'Client' : 'Clients'} Need Onboarding
              </p>
              <p className="text-sm text-slate_blue-700">
                Complete the guided setup process to get AI-powered insights and recommendations.
              </p>
            </div>
            <Link
              to="/clients"
              className="ml-auto bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              View Clients
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-pakistan_green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600">{stat.title}</h3>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Interactive Demo */}
        <div className="lg:col-span-2 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-slate-500" />
              AI Marketing Intelligence
            </h2>
            <p className="text-slate-600 text-sm">Interactive 3D visualization of your marketing data and insights</p>
          </div>
          <React.Suspense 
            fallback={
              <div className="w-full h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <span className="text-white text-sm">Loading 3D Scene...</span>
                </div>
              </div>
            }
          >
            <SplineSceneBasic />
          </React.Suspense>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-slate-500" />
              Recent Activity
            </h2>
            <Link 
              to="/reports" 
              className="text-dark_moss_green-600 hover:text-dark_moss_green-700 text-sm font-medium flex items-center"
            >
              View all <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-cornsilk-100 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-pakistan_green-100' : 'bg-earth_yellow-100'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className={`w-5 h-5 ${
                        activity.status === 'completed' ? 'text-pakistan_green-600' : 'text-earth_yellow-600'
                      }`} />
                    ) : (
                      <Clock className="w-5 h-5 text-earth_yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      Market analysis for {activity.clients.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(activity.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' 
                      ? 'bg-pakistan_green-100 text-pakistan_green-800' 
                      : 'bg-earth_yellow-100 text-earth_yellow-800'
                  }`}>
                    {activity.status === 'completed' ? 'Complete' : 'Processing'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No recent activity</p>
                <Link 
                  to="/clients" 
                  className="text-dark_moss_green-600 hover:text-dark_moss_green-700 text-sm font-medium"
                >
                  Add your first client to get started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-slate-500" />
            Quick Actions
          </h2>
          
          <div className="space-y-4">
            <Link 
              to="/performance"
              className="block p-4 bg-gradient-to-r from-slate_blue-50 to-charcoal-50 rounded-lg border border-slate_blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-slate_blue-900">
                    View Performance Dashboard
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Monitor KPIs, track campaigns, and competitive intelligence
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate_blue-600 group-hover:text-slate_blue-700" />
              </div>
            </Link>

            <Link 
              to="/marketing-analytics"
              className="block p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-green-900">
                    Marketing Analytics
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Track campaigns, ROI, and marketing goals
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600 group-hover:text-green-700" />
              </div>
            </Link>

            <Link 
              to="/competitive-intelligence"
              className="block p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-orange-900">
                    Competitive Intelligence
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Monitor competitors and receive real-time market alerts
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
              </div>
            </Link>

            <Link 
              to="/content"
              className="block p-4 bg-gradient-to-r from-tan-50 to-olive-50 rounded-lg border border-tan-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-tan-900">
                    AI Content Hub
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Generate blog posts, social media, and marketing copy with AI
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-tan-600 group-hover:text-tan-700" />
              </div>
            </Link>

            <Link 
              to="/clients?action=new"
              className="block p-4 bg-gradient-to-r from-cornsilk-50 to-cornsilk-100 rounded-lg border border-cornsilk-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-dark_moss_green-900">
                    Add New Client
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Start with client onboarding and domain analysis
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-dark_moss_green-600 group-hover:text-dark_moss_green-700" />
              </div>
            </Link>

            <Link 
              to="/playbooks"
              className="block p-4 bg-gradient-to-r from-earth_yellow-50 to-tiger_s_eye-50 rounded-lg border border-earth_yellow-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-earth_yellow-900">
                    Browse Playbooks
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Deploy proven marketing strategies
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-earth_yellow-600 group-hover:text-earth_yellow-700" />
              </div>
            </Link>

            <Link 
              to="/reports"
              className="block p-4 bg-gradient-to-r from-pakistan_green-50 to-pakistan_green-100 rounded-lg border border-pakistan_green-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 group-hover:text-pakistan_green-900">
                    View Reports
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Access completed market analyses
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-pakistan_green-600 group-hover:text-pakistan_green-700" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}