import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Globe, 
  TrendingUp, 
  FileText, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  status: string;
  created_at: string;
}

interface Report {
  id: string;
  domain: string;
  status: string;
  created_at: string;
  ai_analysis?: string;
  semrush_data?: any;
  trends_data?: any;
}

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user && id) {
      loadClientData();
    }
  }, [user, id]);

  const loadClientData = async () => {
    try {
      // Load client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Load reports for this client
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMarketAnalysis = async () => {
    if (!client) return;

    setGenerating(true);
    
    try {
      // Create a new report record
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert([{
          client_id: client.id,
          domain: client.domain,
          status: 'pending'
        }])
        .select()
        .single();

      if (reportError) throw reportError;

      // Call the Supabase Edge Function for AI analysis
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-market-analysis`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reportId: reportData.id,
          clientId: client.id,
          domain: client.domain,
          industry: client.industry
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate market analysis');
      }

      const result = await response.json();
      console.log('Analysis generation result:', result);

      // Reload client data to show updated reports
      setTimeout(() => {
        loadClientData();
        setGenerating(false);
      }, 2000); // Small delay to ensure database is updated

    } catch (error) {
      console.error('Error generating analysis:', error);
      
      // Update report status to failed if there was an error
      if (reportData?.id) {
        await supabase
          .from('reports')
          .update({ status: 'failed' })
          .eq('id', reportData.id);
      }
      
      alert('Failed to generate market analysis. Please try again.');
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cornsilk-200 rounded w-1/4"></div>
          <div className="h-32 bg-cornsilk-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Client not found</h3>
          <Link to="/clients" className="text-dark_moss_green-600 hover:text-dark_moss_green-700">
            Return to clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/clients" 
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-dark_moss_green-500 to-pakistan_green-500 rounded-xl flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
              <p className="text-slate-600">{client.domain}</p>
              {client.industry && (
                <span className="inline-block mt-2 px-3 py-1 bg-cornsilk-200 text-slate-600 text-sm rounded-full">
                  {client.industry}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={generateMarketAnalysis}
            disabled={generating}
            className="bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 hover:from-dark_moss_green-700 hover:to-pakistan_green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating AI Analysis...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Generate AI Market Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Status Banner */}
      {generating && (
        <div className="mb-6 bg-gradient-to-r from-earth_yellow-50 to-tiger_s_eye-50 border border-earth_yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-earth_yellow-600 animate-pulse" />
            <div>
              <p className="font-medium text-earth_yellow-900">AI Analysis in Progress</p>
              <p className="text-sm text-earth_yellow-700">
                Our AI is analyzing competitive intelligence, market trends, and generating strategic recommendations for {client.name}...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            AI Market Analysis Reports
          </h2>
          <span className="text-sm text-slate-500">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </span>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-cornsilk-100 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    report.status === 'completed' ? 'bg-pakistan_green-100' : 
                    report.status === 'pending' ? 'bg-earth_yellow-100' : 
                    report.status === 'failed' ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                    {report.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-pakistan_green-600" />
                    ) : report.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-earth_yellow-600" />
                    ) : report.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 flex items-center">
                      AI Market Analysis Report
                      {report.status === 'completed' && (
                        <Brain className="w-4 h-4 text-pakistan_green-600 ml-2" />
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      Generated on {format(new Date(report.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                    {report.ai_analysis && (
                      <p className="text-xs text-slate-600 mt-1">
                        Includes competitive analysis, trend insights, and strategic recommendations
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'completed' ? 'bg-pakistan_green-100 text-pakistan_green-800' :
                    report.status === 'pending' ? 'bg-earth_yellow-100 text-earth_yellow-800' :
                    report.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {report.status === 'completed' ? 'Complete' :
                     report.status === 'pending' ? 'Processing' :
                     report.status === 'failed' ? 'Failed' : 'Draft'}
                  </span>
                  
                  {report.status === 'completed' && report.ai_analysis && (
                    <button
                      onClick={() => {
                        // Create a temporary element to show the analysis
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                        modal.innerHTML = `
                          <div class="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
                            <div class="flex justify-between items-center mb-4">
                              <h2 class="text-xl font-bold">Market Analysis Report</h2>
                              <button onclick="this.closest('.fixed').remove()" class="text-slate-500 hover:text-slate-700">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                            <div class="prose max-w-none">
                              <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6;">${report.ai_analysis}</pre>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(modal);
                      }}
                      className="bg-dark_moss_green-600 hover:bg-dark_moss_green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Analysis
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-earth_yellow-100 to-tiger_s_eye-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-earth_yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No AI analysis yet</h3>
            <p className="text-slate-600 mb-6">
              Generate your first AI-powered market analysis to get strategic insights including competitive intelligence, trend analysis, and actionable recommendations
            </p>
            <button
              onClick={generateMarketAnalysis}
              disabled={generating}
              className="bg-gradient-to-r from-dark_moss_green-600 to-pakistan_green-600 hover:from-dark_moss_green-700 hover:to-pakistan_green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Generate AI Analysis</span>
                </>
              )}
            </button>
            
            <div className="mt-6 text-left bg-cornsilk-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Competitive intelligence and market positioning analysis</li>
                <li>• Search trend insights and keyword opportunities</li>
                <li>• Strategic recommendations with immediate actions</li>
                <li>• Key metrics to track for success</li>
                <li>• Risk assessment and contingency planning</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}