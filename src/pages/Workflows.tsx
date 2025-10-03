import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
  Bell,
  FileText,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Settings,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: any;
  actions: any[];
  is_active: boolean;
  last_run_at: string | null;
  run_count: number;
  created_at: string;
}

interface WorkflowTemplate {
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: any;
  actions: any[];
  icon: React.ElementType;
  color: string;
}

export function Workflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'event',
    trigger_config: {},
    actions: [] as any[]
  });

  const workflowTemplates: WorkflowTemplate[] = [
    {
      name: 'New Client Onboarding',
      description: 'Automatically generate analysis and send welcome email when a new client is added',
      trigger_type: 'event',
      trigger_config: { event: 'client.created' },
      actions: [
        { type: 'generate_report', config: { report_type: 'market_analysis' } },
        { type: 'send_email', config: { template: 'welcome', recipient: 'client' } },
        { type: 'create_task', config: { title: 'Review onboarding progress', assignee: 'user' } }
      ],
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Weekly Performance Digest',
      description: 'Send weekly summary of key metrics and insights every Monday',
      trigger_type: 'schedule',
      trigger_config: { cron: '0 9 * * 1' },
      actions: [
        { type: 'generate_report', config: { report_type: 'weekly_digest' } },
        { type: 'send_email', config: { template: 'digest', recipient: 'user' } },
        { type: 'send_notification', config: { message: 'Weekly digest ready' } }
      ],
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      name: 'Report Completion Alert',
      description: 'Notify clients when their analysis report is ready',
      trigger_type: 'event',
      trigger_config: { event: 'report.completed' },
      actions: [
        { type: 'send_notification', config: { message: 'Report ready for review' } },
        { type: 'send_email', config: { template: 'report_ready', recipient: 'client' } }
      ],
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      name: 'Competitive Alert Notification',
      description: 'Send immediate notification when competitor changes are detected',
      trigger_type: 'event',
      trigger_config: { event: 'alert.triggered' },
      actions: [
        { type: 'send_notification', config: { message: 'Competitor activity detected', priority: 'high' } },
        { type: 'send_email', config: { template: 'competitive_alert', recipient: 'user' } }
      ],
      icon: TrendingUp,
      color: 'bg-red-500'
    },
    {
      name: 'Monthly Playbook Generation',
      description: 'Auto-generate strategic playbook for each client monthly',
      trigger_type: 'schedule',
      trigger_config: { cron: '0 10 1 * *' },
      actions: [
        { type: 'generate_playbook', config: { playbook_type: 'growth-strategy' } },
        { type: 'send_notification', config: { message: 'New playbook generated' } }
      ],
      icon: Target,
      color: 'bg-indigo-500'
    }
  ];

  useEffect(() => {
    if (user) {
      loadWorkflows();
    }
  }, [user]);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('workflows').insert({
        user_id: user!.id,
        name: formData.name,
        description: formData.description,
        trigger_type: formData.trigger_type,
        trigger_config: formData.trigger_config,
        actions: formData.actions,
        is_active: true
      });

      if (error) throw error;

      alert('Workflow created successfully!');
      setShowCreateForm(false);
      setSelectedTemplate(null);
      setFormData({
        name: '',
        description: '',
        trigger_type: 'event',
        trigger_config: {},
        actions: []
      });
      loadWorkflows();
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow: ' + error.message);
    }
  };

  const toggleWorkflow = async (workflowId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: !currentStatus })
        .eq('id', workflowId);

      if (error) throw error;
      loadWorkflows();
    } catch (error: any) {
      console.error('Error toggling workflow:', error);
      alert('Failed to update workflow: ' + error.message);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const { error } = await supabase.from('workflows').delete().eq('id', workflowId);

      if (error) throw error;
      loadWorkflows();
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow: ' + error.message);
    }
  };

  const useTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      trigger_type: template.trigger_type,
      trigger_config: template.trigger_config,
      actions: template.actions
    });
    setShowCreateForm(true);
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
          <h1 className="text-3xl font-bold text-charcoal-900">Automated Workflows</h1>
          <p className="text-charcoal-600 mt-1">Automate repetitive tasks and save time</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">
              {selectedTemplate ? 'Create from Template' : 'Create Workflow'}
            </h2>
            <form onSubmit={createWorkflow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Trigger Type</label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                >
                  <option value="event">Event-based</option>
                  <option value="schedule">Scheduled</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              <div className="bg-charcoal-50 p-4 rounded-lg">
                <h3 className="font-medium text-charcoal-900 mb-2">Actions ({formData.actions.length})</h3>
                {formData.actions.map((action, idx) => (
                  <div key={idx} className="flex items-center text-sm text-charcoal-700 mb-2">
                    <ArrowRight className="w-4 h-4 mr-2 text-slate_blue-600" />
                    {action.type.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
                >
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {workflows.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
          <div className="p-6 border-b border-charcoal-200">
            <h2 className="text-lg font-bold text-charcoal-900">Active Workflows</h2>
          </div>
          <div className="divide-y divide-charcoal-200">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-6 hover:bg-charcoal-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 bg-slate_blue-500 rounded-lg`}>
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-charcoal-900">{workflow.name}</h3>
                        {workflow.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-charcoal-600 mt-1">{workflow.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-charcoal-500">
                        <span className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {workflow.trigger_type}
                        </span>
                        <span className="flex items-center">
                          <Play className="w-3 h-3 mr-1" />
                          {workflow.run_count} runs
                        </span>
                        {workflow.last_run_at && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Last run: {format(new Date(workflow.last_run_at), 'PPp')}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        {workflow.actions.map((action: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-charcoal-100 text-charcoal-700 px-2 py-1 rounded"
                          >
                            {action.type.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        workflow.is_active
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={workflow.is_active ? 'Pause' : 'Activate'}
                    >
                      {workflow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
        <div className="p-6 border-b border-charcoal-200">
          <h2 className="text-lg font-bold text-charcoal-900">Workflow Templates</h2>
          <p className="text-sm text-charcoal-600">Start with pre-built automation templates</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {workflowTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.name}
                className="border border-charcoal-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`p-3 ${template.color} rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-charcoal-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-charcoal-600">{template.description}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-medium text-charcoal-700 mb-2">Actions:</p>
                  <div className="space-y-1">
                    {template.actions.map((action, idx) => (
                      <div key={idx} className="flex items-center text-xs text-charcoal-600">
                        <ArrowRight className="w-3 h-3 mr-2 text-slate_blue-600" />
                        {action.type.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => useTemplate(template)}
                  className="w-full py-2 px-4 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
                >
                  Use Template
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
