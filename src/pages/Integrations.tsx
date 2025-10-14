import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plug,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Megaphone,
  Target,
  Search,
  Mail,
  MessageSquare,
  TrendingUp,
  ExternalLink,
  Settings,
  Trash2,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Integration {
  id: string;
  service_name: string;
  service_type: string;
  status: string;
  last_sync_at: string | null;
  created_at: string;
  config: any;
}

interface IntegrationTemplate {
  name: string;
  type: string;
  icon: React.ElementType;
  description: string;
  color: string;
  features: string[];
  available: boolean;
}

export function Integrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const availableIntegrations: IntegrationTemplate[] = [
    {
      name: 'Google Analytics',
      type: 'analytics',
      icon: BarChart3,
      description: 'Track website traffic, user behavior, and conversion data',
      color: 'bg-orange-500',
      features: ['Traffic data', 'User behavior', 'Goal tracking', 'Real-time analytics'],
      available: true
    },
    {
      name: 'Google Ads',
      type: 'ads',
      icon: Megaphone,
      description: 'Import campaign performance and advertising metrics',
      color: 'bg-blue-500',
      features: ['Campaign metrics', 'Ad performance', 'Keyword data', 'Budget tracking'],
      available: true
    },
    {
      name: 'HubSpot',
      type: 'crm',
      icon: Target,
      description: 'Sync contacts, deals, and marketing automation data',
      color: 'bg-orange-600',
      features: ['Contact sync', 'Deal pipeline', 'Email campaigns', 'Lead scoring'],
      available: true
    },
    {
      name: 'SEMrush',
      type: 'seo',
      icon: Search,
      description: 'Access keyword rankings, backlinks, and competitor data',
      color: 'bg-slate_blue-500',
      features: ['Keyword rankings', 'Backlink analysis', 'Competitor research', 'SEO audit'],
      available: true
    },
    {
      name: 'LinkedIn Ads',
      type: 'ads',
      icon: TrendingUp,
      description: 'Track B2B advertising campaigns and lead generation',
      color: 'bg-blue-700',
      features: ['Campaign metrics', 'Lead gen forms', 'Audience insights', 'ROI tracking'],
      available: true
    },
    {
      name: 'Mailchimp',
      type: 'email',
      icon: Mail,
      description: 'Import email campaign performance and subscriber data',
      color: 'bg-yellow-500',
      features: ['Email metrics', 'Subscriber lists', 'Campaign performance', 'Automation data'],
      available: true
    },
    {
      name: 'Slack',
      type: 'communication',
      icon: MessageSquare,
      description: 'Receive alerts and notifications in your Slack workspace',
      color: 'bg-tan-600',
      features: ['Real-time alerts', 'Report sharing', 'Team notifications', 'Custom webhooks'],
      available: true
    },
    {
      name: 'Salesforce',
      type: 'crm',
      icon: Activity,
      description: 'Sync customer data, opportunities, and sales pipeline',
      color: 'bg-cyan-500',
      features: ['Account sync', 'Opportunity tracking', 'Sales data', 'Custom objects'],
      available: false
    }
  ];

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (template: IntegrationTemplate) => {
    if (!template.available) {
      alert('This integration is coming soon!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          user_id: user!.id,
          service_name: template.name.toLowerCase().replace(/\s+/g, '_'),
          service_type: template.type,
          status: 'pending',
          config: { features: template.features }
        })
        .select()
        .single();

      if (error) throw error;

      alert(`${template.name} integration setup initiated. Please configure in the settings.`);
      loadIntegrations();
    } catch (error: any) {
      console.error('Error connecting integration:', error);
      alert('Failed to connect integration: ' + error.message);
    }
  };

  const syncIntegration = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      const { error: syncError } = await supabase
        .from('integration_syncs')
        .insert({
          integration_id: integrationId,
          sync_type: 'incremental',
          status: 'running'
        });

      if (syncError) throw syncError;

      const { error: updateError } = await supabase
        .from('integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', integrationId);

      if (updateError) throw updateError;

      await loadIntegrations();
      alert('Sync completed successfully!');
    } catch (error: any) {
      console.error('Error syncing:', error);
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncing(null);
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;
      loadIntegrations();
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect: ' + error.message);
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
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate_blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Data Integrations</h1>
          <p className="text-charcoal-600 mt-1">Connect your marketing tools to automate data collection</p>
        </div>
      </div>

      {integrations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
          <div className="p-6 border-b border-charcoal-200">
            <h2 className="text-lg font-bold text-charcoal-900">Active Integrations</h2>
          </div>
          <div className="divide-y divide-charcoal-200">
            {integrations.map((integration) => {
              const template = availableIntegrations.find(
                t => t.name.toLowerCase().replace(/\s+/g, '_') === integration.service_name
              );
              const Icon = template?.icon || Plug;

              return (
                <div key={integration.id} className="p-6 hover:bg-charcoal-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 ${template?.color || 'bg-gray-500'} rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-charcoal-900 capitalize">
                            {integration.service_name.replace(/_/g, ' ')}
                          </h3>
                          {getStatusIcon(integration.status)}
                        </div>
                        <p className="text-sm text-charcoal-600 mt-1">
                          Type: {integration.service_type}
                        </p>
                        {integration.last_sync_at && (
                          <p className="text-xs text-charcoal-500 mt-1">
                            Last synced: {format(new Date(integration.last_sync_at), 'PPp')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => syncIntegration(integration.id)}
                        disabled={syncing === integration.id}
                        className="p-2 text-slate_blue-600 hover:bg-slate_blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sync now"
                      >
                        <RefreshCw className={`w-5 h-5 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => disconnectIntegration(integration.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Disconnect"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
        <div className="p-6 border-b border-charcoal-200">
          <h2 className="text-lg font-bold text-charcoal-900">Available Integrations</h2>
          <p className="text-sm text-charcoal-600 mt-1">Connect popular marketing and analytics platforms</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {availableIntegrations.map((template) => {
            const isConnected = integrations.some(
              i => i.service_name === template.name.toLowerCase().replace(/\s+/g, '_')
            );
            const Icon = template.icon;

            return (
              <div
                key={template.name}
                className="border border-charcoal-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${template.color} rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {!template.available && (
                    <span className="text-xs bg-charcoal-100 text-charcoal-600 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-charcoal-900 mb-2">{template.name}</h3>
                <p className="text-sm text-charcoal-600 mb-4">{template.description}</p>
                <ul className="space-y-2 mb-4">
                  {template.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-xs text-charcoal-600 flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => connectIntegration(template)}
                  disabled={isConnected || !template.available}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isConnected
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : template.available
                      ? 'bg-slate_blue-600 text-white hover:bg-slate_blue-700'
                      : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Integration Benefits</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Automatic data synchronization eliminates manual data entry</li>
              <li>• Real-time insights from all your marketing platforms</li>
              <li>• Unified reporting across all channels</li>
              <li>• AI-powered recommendations based on integrated data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
