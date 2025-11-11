import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Target,
  Lightbulb,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { WeeklyReportData, ExecutiveSummary } from '../lib/reportGeneration';

interface Deliverable {
  id: string;
  deliverable_type: string;
  status: string;
  scheduled_for: string;
  generated_at: string;
  sent_at: string;
  content: {
    report: WeeklyReportData;
    executiveSummary: ExecutiveSummary;
  };
  service_packages: {
    name: string;
  };
  clients: {
    name: string;
  };
}

export function Deliverables() {
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [filter, setFilter] = useState<'all' | 'weekly_report' | 'monthly_strategy' | 'quarterly_review'>('all');

  useEffect(() => {
    if (user) {
      loadDeliverables();
    }
  }, [user, filter]);

  const loadDeliverables = async () => {
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user!.id);

      if (!clients || clients.length === 0) {
        setDeliverables([]);
        return;
      }

      const clientIds = clients.map(c => c.id);

      let query = supabase
        .from('automated_deliverables')
        .select(`
          *,
          service_packages(name),
          clients(name)
        `)
        .in('client_id', clientIds)
        .order('scheduled_for', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('deliverable_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeliverables(data || []);
    } catch (error) {
      console.error('Error loading deliverables:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'generating':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getDeliverableTypeName = (type: string) => {
    const names: Record<string, string> = {
      weekly_report: 'Weekly Performance Report',
      monthly_strategy: 'Monthly Strategy Document',
      quarterly_review: 'Quarterly Business Review',
      campaign_scorecard: 'Campaign Scorecard'
    };
    return names[type] || type;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate_blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Deliverables</h1>
        <p className="text-slate-600">
          Automated reports, insights, and strategic recommendations delivered on schedule
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-4 mb-6">
        {[
          { value: 'all', label: 'All Deliverables' },
          { value: 'weekly_report', label: 'Weekly Reports' },
          { value: 'monthly_strategy', label: 'Monthly Strategy' },
          { value: 'quarterly_review', label: 'Quarterly Reviews' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.value
                ? 'bg-slate_blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deliverables Grid */}
      {deliverables.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Deliverables Yet</h3>
          <p className="text-slate-600 mb-6">
            Once you subscribe to a package, your automated deliverables will appear here
          </p>
          <a
            href="/packages"
            className="inline-flex items-center bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Service Packages
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {deliverables.map(deliverable => (
            <div
              key={deliverable.id}
              className="bg-white rounded-xl border-2 border-slate-200 hover:border-slate_blue-300 hover:shadow-lg transition-all p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate_blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate_blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {getDeliverableTypeName(deliverable.deliverable_type)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deliverable.status)}`}>
                        {deliverable.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {deliverable.clients.name} • {deliverable.service_packages.name}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Scheduled: {format(new Date(deliverable.scheduled_for), 'MMM d, yyyy')}
                      </span>
                      {deliverable.generated_at && (
                        <span className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Generated: {format(new Date(deliverable.generated_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {deliverable.status === 'completed' && deliverable.content && (
                    <>
                      <button
                        onClick={() => setSelectedDeliverable(deliverable)}
                        className="p-2 text-slate_blue-600 hover:bg-slate_blue-50 rounded-lg transition-colors"
                        title="View Report"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          const data = JSON.stringify(deliverable.content, null, 2);
                          const blob = new Blob([data], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${deliverable.deliverable_type}_${format(new Date(deliverable.scheduled_for), 'yyyy-MM-dd')}.json`;
                          a.click();
                        }}
                        className="p-2 text-slate_blue-600 hover:bg-slate_blue-50 rounded-lg transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {getStatusIcon(deliverable.status)}
                </div>
              </div>

              {/* Preview for completed reports */}
              {deliverable.status === 'completed' && deliverable.content?.executiveSummary && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">
                      {deliverable.content.executiveSummary.headline}
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      {deliverable.content.executiveSummary.oneLineSummary}
                    </p>
                    <button
                      onClick={() => setSelectedDeliverable(deliverable)}
                      className="text-slate_blue-600 hover:text-slate_blue-700 text-sm font-medium flex items-center"
                    >
                      View Full Report
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedDeliverable && selectedDeliverable.content && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
            <div className="sticky top-0 bg-gradient-to-r from-slate_blue-600 to-slate_blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {getDeliverableTypeName(selectedDeliverable.deliverable_type)}
                  </h2>
                  <p className="text-slate_blue-100">
                    {selectedDeliverable.clients.name} • {format(new Date(selectedDeliverable.scheduled_for), 'MMMM d, yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDeliverable(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Executive Summary */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2" />
                  {selectedDeliverable.content.executiveSummary.headline}
                </h3>
                <p className="text-green-800 font-medium mb-6">
                  {selectedDeliverable.content.executiveSummary.oneLineSummary}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Key Wins
                    </h4>
                    <ul className="space-y-2">
                      {selectedDeliverable.content.executiveSummary.keyWins.map((win, idx) => (
                        <li key={idx} className="text-sm text-green-800 flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-orange-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Concerns
                    </h4>
                    <ul className="space-y-2">
                      {selectedDeliverable.content.executiveSummary.concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm text-orange-800 flex items-start">
                          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t-2 border-green-200">
                  <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {selectedDeliverable.content.executiveSummary.actionItems.map((item, idx) => (
                      <li key={idx} className="text-sm text-green-800 flex items-start">
                        <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Performance Summary */}
              {selectedDeliverable.content.report && (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Summary</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">Total Spend</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(selectedDeliverable.content.report.summary.totalSpend)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">Revenue Generated</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(selectedDeliverable.content.report.summary.totalRevenue)}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">ROI</p>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedDeliverable.content.report.summary.roi.toFixed(0)}%
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-1">Active Campaigns</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {selectedDeliverable.content.report.summary.activeCampaigns}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Key Insights
                    </h3>
                    <ul className="space-y-3">
                      {selectedDeliverable.content.report.keyInsights.map((insight, idx) => (
                        <li key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Strategic Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {selectedDeliverable.content.report.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-slate_blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-slate-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Top Performing Campaigns */}
                  {selectedDeliverable.content.report.topPerformingCampaigns.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Top Performing Campaigns</h3>
                      <div className="space-y-3">
                        {selectedDeliverable.content.report.topPerformingCampaigns.map((campaign, idx) => (
                          <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-green-900">{campaign.name}</h4>
                              <span className="text-sm text-green-700 font-medium">{campaign.channel}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-green-600">Spend</p>
                                <p className="font-bold text-green-900">{formatCurrency(campaign.spend)}</p>
                              </div>
                              <div>
                                <p className="text-green-600">Revenue</p>
                                <p className="font-bold text-green-900">{formatCurrency(campaign.revenue)}</p>
                              </div>
                              <div>
                                <p className="text-green-600">ROI</p>
                                <p className="font-bold text-green-900">{campaign.roi}%</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-50 p-6 rounded-b-2xl border-t border-slate-200">
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="w-full bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
