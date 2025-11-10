import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  X,
  Save,
  Trash2,
  Plus,
  Calendar,
  FileText,
  AlertCircle,
  PoundSterling,
  Users,
  TrendingUp,
  Building,
  Mail,
  Phone,
  Globe,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface ClientDetailModalProps {
  clientId: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface ClientData {
  id: string;
  name: string;
  domain: string;
  industry: string;
  status: string;
  health_status: string;
  health_score: number;
  company_size: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  monthly_spend: number;
  contract_value: number;
  onboarding_status: string;
  integration_status: any;
  last_report_date?: string;
  next_meeting_date?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  notes_count: number;
  created_at: string;
}

interface ClientNote {
  id: string;
  note_content: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  created_at: string;
}

interface ClientMeeting {
  id: string;
  title: string;
  meeting_type: string;
  scheduled_date: string;
  status: string;
  duration_minutes: number;
}

export function ClientDetailModal({ clientId, onClose, onUpdate }: ClientDetailModalProps) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'meetings' | 'kpis'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', category: 'general', priority: 'normal' });
  const [showAddNote, setShowAddNote] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      const [clientResult, notesResult, meetingsResult] = await Promise.all([
        supabase.from('clients').select('*').eq('id', clientId).single(),
        supabase.from('client_notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('client_meetings').select('*').eq('client_id', clientId).order('scheduled_date', { ascending: false }).limit(5)
      ]);

      if (clientResult.error) throw clientResult.error;

      setClient(clientResult.data);
      setNotes(notesResult.data || []);
      setMeetings(meetingsResult.data || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!client) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          domain: client.domain,
          industry: client.industry,
          contact_person: client.contact_person,
          contact_email: client.contact_email,
          contact_phone: client.contact_phone,
          monthly_spend: client.monthly_spend,
          contract_value: client.contract_value,
          health_status: client.health_status,
          company_size: client.company_size,
          next_meeting_date: client.next_meeting_date,
          contract_end_date: client.contract_end_date
        })
        .eq('id', clientId);

      if (error) throw error;

      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.content.trim()) return;

    try {
      const { error } = await supabase
        .from('client_notes')
        .insert([{
          client_id: clientId,
          note_content: newNote.content,
          category: newNote.category,
          priority: newNote.priority
        }]);

      if (error) throw error;

      setNewNote({ content: '', category: 'general', priority: 'normal' });
      setShowAddNote(false);
      loadClientData();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'thriving': return 'text-green-600 bg-green-50 border-green-200';
      case 'stable': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
              <p className="text-sm text-gray-500">{client.domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'notes', label: `Notes (${notes.length})` },
              { id: 'meetings', label: 'Meetings' },
              { id: 'kpis', label: 'KPIs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-slate-700 text-slate-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Client Information</h3>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className={`border rounded-lg p-4 ${getHealthColor(client.health_status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">Health Status: {client.health_status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-2xl font-bold">{client.health_score}/100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <input
                    type="text"
                    value={client.domain}
                    onChange={(e) => setClient({ ...client, domain: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={client.industry}
                    onChange={(e) => setClient({ ...client, industry: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select
                    value={client.company_size}
                    onChange={(e) => setClient({ ...client, company_size: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  >
                    <option value="startup">Startup</option>
                    <option value="growth">Growth</option>
                    <option value="scale">Scale</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={client.contact_person || ''}
                    onChange={(e) => setClient({ ...client, contact_person: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={client.contact_email || ''}
                    onChange={(e) => setClient({ ...client, contact_email: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Marketing Spend</label>
                  <input
                    type="number"
                    value={client.monthly_spend}
                    onChange={(e) => setClient({ ...client, monthly_spend: parseFloat(e.target.value) })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value (MRR)</label>
                  <input
                    type="number"
                    value={client.contract_value}
                    onChange={(e) => setClient({ ...client, contract_value: parseFloat(e.target.value) })}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Client Notes</h3>
                <button
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>

              {showAddNote && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Enter note content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="general">General</option>
                      <option value="concern">Concern</option>
                      <option value="opportunity">Opportunity</option>
                      <option value="technical">Technical</option>
                      <option value="financial">Financial</option>
                    </select>
                    <select
                      value={newNote.priority}
                      onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No notes yet. Add your first note above.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(note.priority)}`}>
                            {note.priority}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {note.category}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-700">{note.note_content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Recent Meetings</h3>
              {meetings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No meetings scheduled yet.</p>
              ) : (
                meetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(meeting.scheduled_date), 'MMM dd, yyyy h:mm a')} • {meeting.duration_minutes} min
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          meeting.status === 'completed' ? 'bg-green-50 text-green-700' :
                          meeting.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'kpis' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Key Performance Indicators</h3>
              <p className="text-gray-500">KPI tracking coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
