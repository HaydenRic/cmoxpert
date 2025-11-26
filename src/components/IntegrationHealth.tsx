import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Integration {
  id: string;
  service_name: string;
  service_type: string;
  status: string;
  last_sync_at: string | null;
  created_at: string;
  config: any;
}

interface SyncHistory {
  id: string;
  integration_id: string;
  sync_type: string;
  status: string;
  records_synced: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export function IntegrationHealth() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncHistory, setSyncHistory] = useState<Record<string, SyncHistory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load integrations
      const { data: integrationsData } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      setIntegrations(integrationsData || []);

      // Load sync history for each integration
      if (integrationsData && integrationsData.length > 0) {
        const historyPromises = integrationsData.map(async (integration) => {
          const { data: history } = await supabase
            .from('integration_syncs')
            .select('*')
            .eq('integration_id', integration.id)
            .order('started_at', { ascending: false })
            .limit(5);

          return { integrationId: integration.id, history: history || [] };
        });

        const historyResults = await Promise.all(historyPromises);
        const historyMap: Record<string, SyncHistory[]> = {};
        historyResults.forEach(({ integrationId, history }) => {
          historyMap[integrationId] = history;
        });
        setSyncHistory(historyMap);
      }
    } catch (error) {
      console.error('Error loading integration health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getHealthScore = (integration: Integration, history: SyncHistory[]) => {
    if (history.length === 0) return 0;

    const successfulSyncs = history.filter(h => h.status === 'completed').length;
    const totalSyncs = history.length;
    return Math.round((successfulSyncs / totalSyncs) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Integrations Connected</h3>
          <p className="text-slate-600 text-sm">
            Connect your first integration to see health metrics and sync history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Integration Health</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Monitor sync status and performance
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {integrations.map((integration) => {
          const history = syncHistory[integration.id] || [];
          const healthScore = getHealthScore(integration, history);
          const lastSync = integration.last_sync_at
            ? formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })
            : 'Never';

          return (
            <div
              key={integration.id}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(integration.status)}
                  <div>
                    <h3 className="font-semibold text-slate-900 capitalize">
                      {integration.service_name.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-slate-600 capitalize">
                      {integration.service_type}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    integration.status
                  )}`}
                >
                  {integration.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Last Sync</p>
                  <p className="text-sm font-medium text-slate-900">{lastSync}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Health Score</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-slate-900">{healthScore}%</p>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          healthScore >= 80
                            ? 'bg-green-500'
                            : healthScore >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${healthScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Syncs</p>
                  <p className="text-sm font-medium text-slate-900">{history.length}</p>
                </div>
              </div>

              {history.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-700 mb-2">Recent Sync History</p>
                  <div className="space-y-2">
                    {history.slice(0, 3).map((sync) => (
                      <div
                        key={sync.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          {sync.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : sync.status === 'failed' ? (
                            <XCircle className="w-3 h-3 text-red-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-yellow-600" />
                          )}
                          <span className="text-slate-600">
                            {format(new Date(sync.started_at), 'MMM d, h:mm a')}
                          </span>
                          {sync.records_synced && (
                            <span className="text-slate-500">
                              • {sync.records_synced} records
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            sync.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : sync.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {sync.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {integration.status === 'error' && history.length > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-900 mb-1">Latest Error:</p>
                  <p className="text-xs text-red-700">
                    {history[0].error_message || 'Unknown error occurred'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-200 bg-slate-50">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Tips for Healthy Integrations</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Sync regularly to keep data fresh (daily recommended)</li>
              <li>• Monitor health scores above 80% for optimal performance</li>
              <li>• Check error messages promptly to prevent data loss</li>
              <li>• Reconnect integrations if they show "pending" status for more than 24 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
