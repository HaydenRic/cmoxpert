import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Mail, Shield, Eye, CreditCard as Edit, Share2, Trash2, CheckCircle, XCircle, Clock, MessageSquare, Link as LinkIcon, Copy, Send, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ClientUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  invited_at: string;
  client_id: string;
  clients?: {
    name: string;
  };
}

interface SharedReport {
  id: string;
  report_id: string;
  share_token: string;
  expires_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  reports?: {
    name: string;
    type: string;
  };
  shared_with_client_user: string | null;
}

export function ClientPortal() {
  const { user } = useAuth();
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [sharedReports, setSharedReports] = useState<SharedReport[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    client_id: '',
    role: 'viewer'
  });
  const [shareForm, setShareForm] = useState({
    report_id: '',
    client_user_id: '',
    expires_days: '30'
  });
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [clientsRes, clientUsersRes, sharedReportsRes, reportsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user!.id),
        supabase
          .from('client_users')
          .select('*, clients(name)')
          .in(
            'client_id',
            (await supabase.from('clients').select('id').eq('user_id', user!.id)).data?.map(c => c.id) || []
          ),
        supabase
          .from('shared_reports')
          .select('*, reports(name, type)')
          .eq('shared_by', user!.id),
        supabase
          .from('reports')
          .select('*, clients!inner(name, user_id)')
          .eq('clients.user_id', user!.id)
      ]);

      setClients(clientsRes.data || []);
      setClientUsers(clientUsersRes.data || []);
      setSharedReports(sharedReportsRes.data || []);
      setReports(reportsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteClientUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('client_users')
        .insert({
          email: inviteForm.email,
          full_name: inviteForm.full_name,
          client_id: inviteForm.client_id,
          role: inviteForm.role,
          invited_by: user!.id
        })
        .select()
        .single();

      if (error) throw error;

      alert(`Invitation sent to ${inviteForm.email}`);
      setShowInviteForm(false);
      setInviteForm({ email: '', full_name: '', client_id: '', role: 'viewer' });
      loadData();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      alert('Failed to send invitation: ' + error.message);
    }
  };

  const shareReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const expiresAt = shareForm.expires_days
        ? new Date(Date.now() + parseInt(shareForm.expires_days) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const shareToken = `share_${Math.random().toString(36).substring(2, 15)}`;

      const { error } = await supabase.from('shared_reports').insert({
        report_id: shareForm.report_id,
        shared_by: user!.id,
        shared_with_client_user: shareForm.client_user_id || null,
        share_token: shareToken,
        expires_at: expiresAt
      });

      if (error) throw error;

      alert('Report shared successfully!');
      setShowShareForm(false);
      setShareForm({ report_id: '', client_user_id: '', expires_days: '30' });
      loadData();
    } catch (error: any) {
      console.error('Error sharing report:', error);
      alert('Failed to share report: ' + error.message);
    }
  };

  const copyShareLink = (token: string) => {
    const link = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('client_users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert('Failed to update user status: ' + error.message);
    }
  };

  const deleteClientUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      const { error } = await supabase.from('client_users').delete().eq('id', userId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const revokeShare = async (shareId: string) => {
    if (!confirm('Revoke access to this shared report?')) return;

    try {
      const { error } = await supabase.from('shared_reports').delete().eq('id', shareId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      console.error('Error revoking share:', error);
      alert('Failed to revoke share: ' + error.message);
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
          <h1 className="text-3xl font-bold text-charcoal-900">Client Collaboration</h1>
          <p className="text-charcoal-600 mt-1">Invite clients and share reports securely</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowShareForm(true)}
            className="flex items-center px-4 py-2 bg-white border border-slate_blue-600 text-slate_blue-600 rounded-lg hover:bg-slate_blue-50 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Report
          </button>
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Client User
          </button>
        </div>
      </div>

      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Invite Client User</h2>
            <form onSubmit={inviteClientUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Client</label>
                <select
                  value={inviteForm.client_id}
                  onChange={(e) => setInviteForm({ ...inviteForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                >
                  <option value="viewer">Viewer - Can only view</option>
                  <option value="editor">Editor - Can view and comment</option>
                  <option value="admin">Admin - Full access</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShareForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Share Report</h2>
            <form onSubmit={shareReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Report</label>
                <select
                  value={shareForm.report_id}
                  onChange={(e) => setShareForm({ ...shareForm, report_id: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  required
                >
                  <option value="">Select a report</option>
                  {reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.name} - {report.clients?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Share with (Optional)
                </label>
                <select
                  value={shareForm.client_user_id}
                  onChange={(e) => setShareForm({ ...shareForm, client_user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                >
                  <option value="">Anyone with link</option>
                  {clientUsers.map((cu) => (
                    <option key={cu.id} value={cu.id}>
                      {cu.email} - {cu.clients?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Expires in (days)
                </label>
                <input
                  type="number"
                  value={shareForm.expires_days}
                  onChange={(e) => setShareForm({ ...shareForm, expires_days: e.target.value })}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  min="1"
                  max="365"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowShareForm(false)}
                  className="px-4 py-2 text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate_blue-600 text-white rounded-lg hover:bg-slate_blue-700 transition-colors"
                >
                  Share Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
        <div className="p-6 border-b border-charcoal-200">
          <h2 className="text-lg font-bold text-charcoal-900">Client Users</h2>
          <p className="text-sm text-charcoal-600">Manage access for client stakeholders</p>
        </div>
        {clientUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-600">No client users yet</p>
            <p className="text-sm text-charcoal-500 mt-1">Invite client stakeholders to collaborate</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-200">
            {clientUsers.map((clientUser) => (
              <div key={clientUser.id} className="p-6 hover:bg-charcoal-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate_blue-500 to-charcoal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {clientUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-charcoal-900">
                          {clientUser.full_name || clientUser.email}
                        </h3>
                        {clientUser.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-charcoal-600">{clientUser.email}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-charcoal-500">
                        <span className="flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          {clientUser.role}
                        </span>
                        <span>{clientUser.clients?.name}</span>
                        {clientUser.last_login_at && (
                          <span>Last login: {format(new Date(clientUser.last_login_at), 'PP')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleUserStatus(clientUser.id, clientUser.is_active)}
                      className="p-2 text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
                      title={clientUser.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {clientUser.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteClientUser(clientUser.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-charcoal-200">
        <div className="p-6 border-b border-charcoal-200">
          <h2 className="text-lg font-bold text-charcoal-900">Shared Reports</h2>
          <p className="text-sm text-charcoal-600">Reports shared with clients</p>
        </div>
        {sharedReports.length === 0 ? (
          <div className="p-12 text-center">
            <Share2 className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-600">No shared reports yet</p>
            <p className="text-sm text-charcoal-500 mt-1">Share reports with clients for transparency</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-200">
            {sharedReports.map((share) => (
              <div key={share.id} className="p-6 hover:bg-charcoal-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-charcoal-900">{share.reports?.name}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-charcoal-600">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {share.view_count} views
                      </span>
                      {share.expires_at && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Expires {format(new Date(share.expires_at), 'PP')}
                        </span>
                      )}
                      {share.last_viewed_at && (
                        <span>Last viewed {format(new Date(share.last_viewed_at), 'PP')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyShareLink(share.share_token)}
                      className="p-2 text-slate_blue-600 hover:bg-slate_blue-50 rounded-lg transition-colors"
                      title="Copy share link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => revokeShare(share.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Revoke access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
