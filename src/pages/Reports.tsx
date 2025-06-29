import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Brain, 
  Globe, 
  RefreshCw,
  Trash2,
  Eye,
  BarChart3,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

interface Report {
  id: string;
  client_id: string;
  domain: string;
  semrush_data?: any;
  trends_data?: any;
  ai_analysis?: string;
  status: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    domain: string;
  };
}

interface Client {
  id: string;
  name: string;
  domain: string;
}

export function Reports() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(searchParams.get('client') || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user, selectedClient, selectedStatus, sortBy, sortOrder]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Load clients first
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, domain')
        .eq('user_id', user!.id)
        .order('name');

      setClients(clientsData || []);

      // Build query for reports
      let query = supabase
        .from('reports')
        .select(`
          *,
          clients!inner(name, domain, user_id)
        `)
        .eq('clients.user_id', user!.id);

      // Apply filters
      if (selectedClient !== 'all') {
        query = query.eq('client_id', selectedClient);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      
      // Refresh reports list
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const viewReportDetails = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.ai_analysis && report.ai_analysis.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cream-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-cream-200 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Market Analysis Reports</h1>
          <p className="text-slate-600">View and manage AI-generated market analysis reports for your clients</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={loadReports}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
        >
          <option value="all">All Clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('clients.name')}
                    className="flex items-center space-x-1"
                  >
                    <span>Client</span>
                    {sortBy === 'clients.name' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('domain')}
                    className="flex items-center space-x-1"
                  >
                    <span>Domain</span>
                    {sortBy === 'domain' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1"
                  >
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('created_at')}
                    className="flex items-center space-x-1"
                  >
                    <span>Date</span>
                    {sortBy === 'created_at' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate_blue-100 rounded-full flex items-center justify-center mr-3">
                          <Globe className="w-4 h-4 text-slate_blue-700" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{report.clients?.name}</div>
                          <Link 
                            to={`/clients/${report.client_id}`}
                            className="text-xs text-slate_blue-600 hover:text-slate_blue-700 flex items-center"
                          >
                            View Client <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{report.domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(report.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {report.status === 'completed' && (
                          <button
                            onClick={() => viewReportDetails(report)}
                            className="text-slate_blue-600 hover:text-slate_blue-900 p-2 rounded-lg hover:bg-slate_blue-50"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-2">No reports found</p>
                    <p className="text-sm text-slate-400">
                      {searchTerm || selectedClient !== 'all' || selectedStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Generate your first market analysis report from a client page'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate_blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-slate_blue-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Market Analysis Report</h2>
                  <p className="text-sm text-slate-500">
                    {selectedReport.clients?.name} • {format(new Date(selectedReport.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-500 hover:text-slate-700 p-2"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1 bg-slate_blue-100 text-slate_blue-800 text-sm font-medium rounded-full">
                    {selectedReport.domain}
                  </div>
                  <div className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Create a blob and download the analysis as markdown
                      const blob = new Blob([selectedReport.ai_analysis || ''], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedReport.clients?.name}-market-analysis.md`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              
              {/* Report Content */}
              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <div className="prose max-w-none">
                  {selectedReport.ai_analysis ? (
                    <div className="whitespace-pre-wrap font-sans text-slate-800">
                      {selectedReport.ai_analysis}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-slate-700">No analysis content available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Data Sources */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <BarChart3 className="w-5 h-5 text-slate_blue-600" />
                      <h4 className="font-medium text-slate-900">SEMrush Data</h4>
                    </div>
                    {selectedReport.semrush_data ? (
                      <div className="text-sm text-slate-600">
                        <p>Competitive intelligence data from SEMrush API</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {Object.keys(selectedReport.semrush_data).length} data points analyzed
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No SEMrush data available</p>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Zap className="w-5 h-5 text-slate_blue-600" />
                      <h4 className="font-medium text-slate-900">Trends Data</h4>
                    </div>
                    {selectedReport.trends_data ? (
                      <div className="text-sm text-slate-600">
                        <p>Market trend analysis from Google Trends</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {selectedReport.trends_data.search_trends?.length || 0} trend periods analyzed
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No trends data available</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  to={`/clients/${selectedReport.client_id}`}
                  className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Go to Client
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}