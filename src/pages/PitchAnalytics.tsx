import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Users,
  TrendingUp,
  Calendar,
  MousePointer,
  Mail,
  Calculator,
  Eye,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalLeads: number;
  totalDemos: number;
  totalPageViews: number;
  totalCalculations: number;
  conversionRate: number;
  avgTimeOnPage: number;
  leadsBySource: { source: string; count: number }[];
  leadsByDay: { date: string; count: number }[];
  demosByStatus: { status: string; count: number }[];
  topInterests: { interest: string; count: number }[];
}

export default function PitchAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLeads: 0,
    totalDemos: 0,
    totalPageViews: 0,
    totalCalculations: 0,
    conversionRate: 0,
    avgTimeOnPage: 0,
    leadsBySource: [],
    leadsByDay: [],
    demosByStatus: [],
    topInterests: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const [
        { count: totalLeads },
        { count: totalDemos },
        { count: totalPageViews },
        { count: totalCalculations },
        { data: leads },
        { data: demos },
        { data: pageViews }
      ] = await Promise.all([
        supabase.from('pitch_leads').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
        supabase.from('demo_bookings').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
        supabase.from('pitch_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view').gte('created_at', startDate.toISOString()),
        supabase.from('roi_calculations').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString()),
        supabase.from('pitch_leads').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('demo_bookings').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('pitch_analytics').select('*').eq('event_type', 'page_view').gte('created_at', startDate.toISOString())
      ]);

      const conversionRate = totalPageViews ? ((totalLeads || 0) / totalPageViews) * 100 : 0;

      const avgTime = pageViews?.reduce((sum, pv) => sum + (pv.time_spent_seconds || 0), 0) || 0;
      const avgTimeOnPage = pageViews?.length ? Math.round(avgTime / pageViews.length) : 0;

      const leadsBySource: { [key: string]: number } = {};
      leads?.forEach(lead => {
        const source = lead.lead_source || 'unknown';
        leadsBySource[source] = (leadsBySource[source] || 0) + 1;
      });

      const leadsByDay: { [key: string]: number } = {};
      leads?.forEach(lead => {
        const date = new Date(lead.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
        leadsByDay[date] = (leadsByDay[date] || 0) + 1;
      });

      const demosByStatus: { [key: string]: number } = {};
      demos?.forEach(demo => {
        const status = demo.booking_status || 'unknown';
        demosByStatus[status] = (demosByStatus[status] || 0) + 1;
      });

      const interestCounts: { [key: string]: number } = {};
      demos?.forEach(demo => {
        demo.specific_interests?.forEach((interest: string) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      });

      setAnalytics({
        totalLeads: totalLeads || 0,
        totalDemos: totalDemos || 0,
        totalPageViews: totalPageViews || 0,
        totalCalculations: totalCalculations || 0,
        conversionRate,
        avgTimeOnPage,
        leadsBySource: Object.entries(leadsBySource).map(([source, count]) => ({ source, count })),
        leadsByDay: Object.entries(leadsByDay).map(([date, count]) => ({ date, count })),
        demosByStatus: Object.entries(demosByStatus).map(([status, count]) => ({ status, count })),
        topInterests: Object.entries(interestCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([interest, count]) => ({ interest, count }))
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pitch Analytics</h1>
            <p className="text-gray-600">Track engagement and conversion metrics</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.totalLeads}</div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.totalDemos}</div>
            <div className="text-sm text-gray-600">Demo Bookings</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <MousePointer className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.totalPageViews}</div>
            <div className="text-sm text-gray-600">Page Views</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calculator className="w-6 h-6 text-orange-600" />
              </div>
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.totalCalculations}</div>
            <div className="text-sm text-gray-600">ROI Calculations</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Conversion Metrics</h3>
            <div className="space-y-4 mt-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Visitor to Lead</span>
                  <span className="text-lg font-bold text-blue-600">{analytics.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(analytics.conversionRate, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Lead to Demo</span>
                  <span className="text-lg font-bold text-green-600">
                    {analytics.totalLeads ? ((analytics.totalDemos / analytics.totalLeads) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${analytics.totalLeads ? Math.min((analytics.totalDemos / analytics.totalLeads) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Time on Page</span>
                  <span className="text-lg font-bold text-gray-900">
                    {Math.floor(analytics.avgTimeOnPage / 60)}:{String(analytics.avgTimeOnPage % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Leads by Source</h3>
            {analytics.leadsBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.leadsBySource}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analytics.leadsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">No data available</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Leads Over Time</h3>
            {analytics.leadsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.leadsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">No data available</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Demo Status</h3>
            {analytics.demosByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.demosByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-12">No data available</div>
            )}
          </div>
        </div>

        {analytics.topInterests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Feature Interests</h3>
            <div className="space-y-3">
              {analytics.topInterests.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{item.interest}</span>
                      <span className="text-sm text-gray-600">{item.count} requests</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(item.count / analytics.totalDemos) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
