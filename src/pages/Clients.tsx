import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Globe, 
  Calendar,
  MoreVertical,
  TrendingUp,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function Clients() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    domain: '',
    industry: ''
  });

  useEffect(() => {
    if (user) {
      loadClients();
    }
    
    // Check if we should show the add form
    if (searchParams.get('action') === 'new') {
      setShowAddForm(true);
      // Remove the action param
      setSearchParams({});
    }
  }, [user, searchParams, setSearchParams]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          ...newClient,
          user_id: user!.id
        }]);

      if (error) throw error;

      setNewClient({ name: '', domain: '', industry: '' });
      setShowAddForm(false);
      loadClients();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cornsilk-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-cornsilk-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Clients</h1>
          <p className="text-slate-600">Manage your client portfolio and generate market insights</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 hover:from-dark_moss_green-700 hover:to-pakistan_green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Client</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent"
                  placeholder="Acme Corporation"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain
                </label>
                <input
                  type="url"
                  value={newClient.domain}
                  onChange={(e) => setNewClient({ ...newClient, domain: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent"
                  placeholder="https://acmecorp.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Industry (Optional)
                </label>
                <input
                  type="text"
                  value={newClient.industry}
                  onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent"
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-dark_moss_green-600 hover:bg-dark_moss_green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Add Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-dark_moss_green-500 to-pakistan_green-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
                    <p className="text-slate-600 text-sm">{client.domain}</p>
                    {client.industry && (
                      <span className="inline-block mt-1 px-2 py-1 bg-cornsilk-200 text-slate-600 text-xs rounded-full">
                        {client.industry}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Added</p>
                    <p className="text-sm font-medium text-slate-900">
                      {format(new Date(client.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/clients/${client.id}`}
                      className="bg-cornsilk-100 hover:bg-cornsilk-200 text-dark_moss_green-600 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Analyze</span>
                    </Link>
                    <Link
                      to={`/reports?client=${client.id}`}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Reports</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-cornsilk-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No clients yet</h3>
            <p className="text-slate-600 mb-6">Add your first client to start generating market insights</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-dark_moss_green-600 hover:bg-dark_moss_green-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Add Your First Client
            </button>
          </div>
        )}
      </div>
    </div>
  );
}