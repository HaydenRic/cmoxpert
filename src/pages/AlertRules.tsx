import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Plus, CreditCard as Edit2, Trash2, CheckCircle, XCircle, Mail, MessageSquare, Smartphone, AlertTriangle, TrendingUp, TrendingDown, Target, Search, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AlertRule {
  id: string;
  name: string;
  rule_type: string;
  conditions: any;
  notification_channels: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export function AlertRules() {
  const { user } = useAuth();
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rule_type: 'competitor_change',
    conditions: {},
    notification_channels: ['in_app']
  });

  const ruleTypes = [
    {
      value: 'competitor_change',
      label: 'Competitor Website Change',
      icon: AlertTriangle,
      description: 'Alert when competitor website content changes',
      color: 'bg-orange-500'
    },
    {
      value: 'keyword_ranking',
      label: 'Keyword Ranking Change',
      icon: Search,
      description: 'Alert when keyword rankings change significantly',
      color: 'bg-blue-500'
    },
    {
      value: 'metric_threshold',
      label: 'Metric Threshold',
      icon: Target,
      description: 'Alert when metrics exceed or fall below thresholds',
      color: 'bg-green-500'
    },
    {
      value: 'pricing_change',
      label: 'Competitor Pricing Change',
      icon: DollarSign,
      description: 'Alert when competitor pricing is updated',
      color: 'bg-tan-500'
    },
    {
      value: 'traffic_spike',
      label: 'Traffic Spike',
      icon: TrendingUp,
      description: 'Alert on unusual traffic increases',
      color: 'bg-cyan-500'
    }
  ];

  const channels = [
    { value: 'in_app', label: 'In-App Notification', icon: Bell },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'slack', label: 'Slack', icon: MessageSquare },
    { value: 'sms', label: 'SMS', icon: Smartphone }
  ];

  useEffect(() => {
    if (user) {
      loadAlertRules();
    }
  }, [user]);

  const loadAlertRules = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertRules(data || []);
    } catch (error) {
      console.error('Error loading alert rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlertRule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('alert_rules').insert({
        user_id: user!.id,
        name: formData.name,
        rule_type: formData.rule_type,
        conditions: formData.conditions,
        notification_channels: formData.notification_channels,
        is_active: true
      });

      if (error) throw error;

      alert('Alert rule created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        rule_type: 'competitor_change',
        conditions: {},
        notification_channels: ['in_app']
      });
      loadAlertRules();
    } catch (error: any) {
      console.error('Error creating alert rule:', error);
      alert('Failed to create alert rule: ' + error.message);
    }
  };

  const toggleAlertRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ is_active: !currentStatus })
        .eq('id', ruleId);

      if (error) throw error;
      loadAlertRules();
    } catch (error: any) {
      console.error('Error toggling alert rule:', error);
      alert('Failed to update alert rule: ' + error.message);
    }
  };

  const deleteAlertRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return;

    try {
      const { error } = await supabase.from('alert_rules').delete().eq('id', ruleId);

      if (error) throw error;
      loadAlertRules();
    } catch (error: any) {
      console.error('Error deleting alert rule:', error);
      alert('Failed to delete alert rule: ' + error.message);
    }
  };

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      notification_channels: prev.notification_channels.includes(channel)
        ? prev.notification_channels.filter((c) => c !== channel)
        : [...prev.notification_channels, channel]
    }));
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
          <h1 className="text-3xl font-bold text-charcoal-900">Alert Rules</h1>
          <p className="text-charcoal-600 mt-1">Configure automated alerts for important events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Alert Rule
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Create Alert Rule</h2>
            <form onSubmit={createAlertRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  placeholder="e.g., Notify on competitor pricing changes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Alert Type</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {ruleTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.rule_type === type.value
                            ? 'border-slate_blue-600 bg-slate_blue-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rule_type"
                          value={type.value}
                          checked={formData.rule_type === type.value}
                          onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`p-2 ${type.color} rounded-lg mr-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-charcoal-900">{type.label}</div>
                          <div className="text-xs text-charcoal-600 mt-1">{type.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Notification Channels
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    const isSelected = formData.notification_channels.includes(channel.value);
                    return (
                      <button
                        key={channel.value}
                        type="button"
                        onClick={() => toggleChannel(channel.value)}
                        className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${
                          isSelected
                            ? 'border-slate_blue-600 bg-slate_blue-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-slate_blue-600' : 'text-charcoal-400'}`} />
                        <span className="text-xs font-medium text-charcoal-700">{channel.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {alertRules.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
          <div className="p-6 border-b border-charcoal-200">
            <h2 className="text-lg font-bold text-charcoal-900">Active Alert Rules</h2>
          </div>
          <div className="divide-y divide-charcoal-200">
            {alertRules.map((rule) => {
              const ruleType = ruleTypes.find((t) => t.value === rule.rule_type);
              const Icon = ruleType?.icon || Bell;

              return (
                <div key={rule.id} className="p-6 hover:bg-charcoal-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 ${ruleType?.color || 'bg-gray-500'} rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-charcoal-900">{rule.name}</h3>
                          {rule.is_active ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-charcoal-600 mt-1">
                          {ruleType?.label || rule.rule_type}
                        </p>
                        <div className="flex items-center space-x-3 mt-3">
                          {rule.notification_channels.map((channel) => {
                            const channelInfo = channels.find((c) => c.value === channel);
                            const ChannelIcon = channelInfo?.icon || Bell;
                            return (
                              <span
                                key={channel}
                                className="flex items-center text-xs bg-charcoal-100 text-charcoal-700 px-2 py-1 rounded"
                              >
                                <ChannelIcon className="w-3 h-3 mr-1" />
                                {channelInfo?.label}
                              </span>
                            );
                          })}
                        </div>
                        {rule.last_triggered_at && (
                          <p className="text-xs text-charcoal-500 mt-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Last triggered: {format(new Date(rule.last_triggered_at), 'PPp')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAlertRule(rule.id, rule.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.is_active
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={rule.is_active ? 'Disable' : 'Enable'}
                      >
                        {rule.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAlertRule(rule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-charcoal-200 p-12 text-center">
          <Bell className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Alert Rules Yet</h3>
          <p className="text-charcoal-600 mb-4">
            Create alert rules to get notified about important changes
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
          >
            Create Your First Rule
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Alert Rules Tips</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Set up multiple notification channels for critical alerts</li>
              <li>• Use specific thresholds to avoid alert fatigue</li>
              <li>• Review and adjust rules based on their effectiveness</li>
              <li>• Combine alerts with automated workflows for powerful automation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
