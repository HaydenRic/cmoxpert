import React, { useEffect, useState } from 'react';
import { supabase, AIServicesManager } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Clock,
  Star,
  Users,
  ArrowRight,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  FileText,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface Playbook {
  id: string;
  name: string;
  description?: string;
  tactics: any[];
  category: string;
  user_id: string;
  source_client_id?: string;
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
  industry?: string;
}

export function Playbooks() {
  const { user } = useAuth();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    clientId: '',
    playbookType: 'growth-strategy',
    customPrompt: ''
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'growth-strategy', label: 'Growth Strategy' },
    { value: 'demand-generation', label: 'Demand Generation' },
    { value: 'brand-positioning', label: 'Brand Positioning' },
    { value: 'content-marketing', label: 'Content Marketing' },
    { value: 'competitive-analysis', label: 'Competitive Analysis' },
    { value: 'customer-retention', label: 'Customer Retention' }
  ];

  const playbookTypes = [
    { value: 'growth-strategy', label: 'Growth Strategy', icon: TrendingUp, description: 'Comprehensive growth acceleration tactics' },
    { value: 'demand-generation', label: 'Demand Generation', icon: Target, description: 'Lead generation and nurturing strategies' },
    { value: 'brand-positioning', label: 'Brand Positioning', icon: Star, description: 'Market positioning and differentiation' },
    { value: 'content-marketing', label: 'Content Marketing', icon: FileText, description: 'Content strategy and distribution' },
    { value: 'competitive-analysis', label: 'Competitive Analysis', icon: BarChart3, description: 'Competitor intelligence and response' },
    { value: 'customer-retention', label: 'Customer Retention', icon: Users, description: 'Customer success and expansion' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load playbooks
      const { data: playbooksData, error: playbooksError } = await supabase
        .from('playbooks')
        .select(`
          *,
          clients(name, domain)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (playbooksError) throw playbooksError;
      setPlaybooks(playbooksData || []);

      // Load clients for the generation form
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user!.id)
        .order('name');

      if (clientsError) throw clientsError;
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!generateForm.clientId) {
      alert('Please select a client');
      return;
    }

    setGenerating(true);
    
    try {
      const result = await AIServicesManager.generatePlaybook({
        clientId: generateForm.clientId,
        userId: user!.id,
        playbookType: generateForm.playbookType
      });
      
      console.log('Playbook generation result:', result);

      // Reset form and reload data
      setGenerateForm({
        clientId: '',
        playbookType: 'growth-strategy',
        customPrompt: ''
      });
      setShowGenerateForm(false);
      
      // Reload playbooks to show the new one
      setTimeout(() => {
        loadData();
        setGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating playbook:', error);
      alert('Failed to generate playbook. Please try again.');
      setGenerating(false);
    }
  };

  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || playbook.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-cornsilk-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-cornsilk-200 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Marketing Playbooks</h1>
          <p className="text-slate-600">Generate and manage custom marketing strategies powered by AI</p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          disabled={generating}
          className="bg-gradient-to-r from-tiger_s_eye-600 to-earth_yellow-600 hover:from-tiger_s_eye-700 hover:to-earth_yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Playbook</span>
            </>
          )}
        </button>
      </div>

      {/* Generation Status Banner */}
      {generating && (
        <div className="mb-6 bg-gradient-to-r from-tiger_s_eye-50 to-earth_yellow-50 border border-tiger_s_eye-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-dark_moss_green-700 animate-pulse" />
            <div>
              <p className="font-medium text-dark_moss_green-800">AI Playbook Generation in Progress</p>
              <p className="text-sm text-dark_moss_green-700">
                Our AI is analyzing your client data and creating a custom marketing playbook with actionable tactics...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search playbooks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Playbook Types Overview */}
      {playbooks.length === 0 && !generating && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Available Playbook Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playbookTypes.map((type) => (
              <div key={type.value} className="bg-gradient-to-br from-tiger_s_eye-50 to-earth_yellow-50 rounded-xl p-6 border border-tiger_s_eye-100">
                <div className="w-12 h-12 bg-gradient-to-br from-tiger_s_eye-100 to-earth_yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-dark_moss_green-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{type.label}</h3>
                <p className="text-slate-600 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playbooks List */}
      <div className="space-y-6">
        {filteredPlaybooks.length > 0 ? (
          filteredPlaybooks.map((playbook) => (
            <div key={playbook.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-tiger_s_eye-100 to-earth_yellow-100 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-dark_moss_green-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{playbook.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(playbook.created_at), 'MMM d, yyyy')}
                        </span>
                        {playbook.clients && (
                          <span className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {playbook.clients.name}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-tiger_s_eye-100 text-tiger_s_eye-800 text-xs rounded-full">
                          {categories.find(c => c.value === playbook.category)?.label || playbook.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {playbook.description && (
                    <p className="text-slate-600 mb-4 line-clamp-2">{playbook.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-500">
                    {playbook.tactics && Array.isArray(playbook.tactics) && (
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-pakistan_green-500" />
                        {playbook.tactics.length} tactics
                      </span>
                    )}
                    <span className="flex items-center">
                      <Brain className="w-4 h-4 mr-1 text-dark_moss_green-700" />
                      AI Generated
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      // Create a modal to show the playbook details
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                      modal.innerHTML = `
                        <div class="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                          <div class="sticky top-0 bg-white border-b border-slate-200 p-6">
                            <div class="flex justify-between items-center">
                              <div>
                                <h2 class="text-2xl font-bold text-slate-900">${playbook.name}</h2>
                                <p class="text-slate-600 mt-1">${playbook.clients?.name || 'General Playbook'}</p>
                              </div>
                              <button onclick="this.closest('.fixed').remove()" class="text-slate-500 hover:text-slate-700 p-2">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div class="p-6">
                            ${playbook.description ? `
                              <div class="mb-8">
                                <h3 class="text-lg font-semibold text-slate-900 mb-3">Overview</h3>
                                <p class="text-slate-700 leading-relaxed">${playbook.description}</p>
                              </div>
                            ` : ''}
                            
                            ${playbook.tactics && Array.isArray(playbook.tactics) ? `
                              <div>
                                <h3 class="text-lg font-semibold text-slate-900 mb-6">Tactics (${playbook.tactics.length})</h3>
                                <div class="grid gap-6">
                                  ${playbook.tactics.map((tactic, index) => `
                                    <div class="border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                                      <div class="flex items-start justify-between mb-4">
                                        <div class="flex-1">
                                          <h4 class="text-lg font-medium text-slate-900 mb-2">${index + 1}. ${tactic.title || 'Untitled Tactic'}</h4>
                                          <p class="text-slate-600 mb-4">${tactic.description || 'No description available'}</p>
                                        </div>
                                        <div class="ml-4 flex items-center space-x-2">
                                          <span class="px-2 py-1 text-xs font-medium rounded-full ${
                                            tactic.impact === 'High' ? 'bg-pakistan_green-100 text-pakistan_green-800' :
                                            tactic.impact === 'Medium' ? 'bg-earth_yellow-100 text-earth_yellow-800' :
                                            'bg-slate-100 text-slate-600'
                                          }">
                                            ${tactic.impact || 'Medium'} Impact
                                          </span>
                                          <span class="px-2 py-1 text-xs font-medium rounded-full ${
                                            tactic.difficulty === 'Easy' ? 'bg-pakistan_green-100 text-pakistan_green-800' :
                                            tactic.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                                            'bg-earth_yellow-100 text-earth_yellow-800'
                                          }">
                                            ${tactic.difficulty || 'Medium'}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div class="grid md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <h5 class="font-medium text-slate-900 mb-2">Timeline</h5>
                                          <p class="text-slate-600">${tactic.timeline || 'TBD'}</p>
                                        </div>
                                        <div>
                                          <h5 class="font-medium text-slate-900 mb-2">Resources</h5>
                                          <div class="space-y-1">
                                            ${tactic.resources && Array.isArray(tactic.resources) ? 
                                              tactic.resources.map(resource => `<p class="text-slate-600">• ${resource}</p>`).join('') :
                                              '<p class="text-slate-500">No resources specified</p>'
                                            }
                                          </div>
                                        </div>
                                        <div>
                                          <h5 class="font-medium text-slate-900 mb-2">KPIs</h5>
                                          <div class="space-y-1">
                                            ${tactic.kpis && Array.isArray(tactic.kpis) ? 
                                              tactic.kpis.map(kpi => `<p class="text-slate-600">• ${kpi}</p>`).join('') :
                                              '<p class="text-slate-500">No KPIs specified</p>'
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  `).join('')}
                                </div>
                              </div>
                            ` : '<p class="text-slate-500">No tactics available</p>'}
                          </div>
                        </div>
                      `;
                      document.body.appendChild(modal);
                    }}
                    className="bg-tiger_s_eye-600 hover:bg-tiger_s_eye-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View Playbook</span>
                  </button>
                  
                  {playbook.source_client_id && (
                    <Link
                      to={`/clients/${playbook.source_client_id}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>View Client</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-tiger_s_eye-100 to-earth_yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-dark_moss_green-700" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No playbooks found' : 'No playbooks yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Generate your first AI-powered marketing playbook to get started'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <button
                onClick={() => setShowGenerateForm(true)}
                disabled={generating}
                className="bg-gradient-to-r from-tiger_s_eye-600 to-earth_yellow-600 hover:from-tiger_s_eye-700 hover:to-earth_yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Your First Playbook</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Generate Playbook Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-tiger_s_eye-600" />
              Generate AI Marketing Playbook
            </h2>
            
            <form onSubmit={generateAIPlaybook} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Client *
                </label>
                <select
                  value={generateForm.clientId}
                  onChange={(e) => setGenerateForm({ ...generateForm, clientId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-dark_moss_green-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.domain})
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    <Link to="/clients" className="text-tiger_s_eye-600 hover:text-tiger_s_eye-700">
                      Add a client first
                    </Link> to generate playbooks
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Playbook Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {playbookTypes.map((type) => (
                    <label
                      key={type.value}
                      className={clsx(
                        'relative flex items-center p-4 border rounded-lg cursor-pointer transition-all',
                        generateForm.playbookType === type.value
                          ? 'border-dark_moss_green-600 bg-dark_moss_green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="playbookType"
                        value={type.value}
                        checked={generateForm.playbookType === type.value}
                        onChange={(e) => setGenerateForm({ ...generateForm, playbookType: e.target.value })}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          generateForm.playbookType === type.value
                            ? 'bg-dark_moss_green-200'
                            : 'bg-slate-100'
                        )}>
                          <type.icon className={clsx(
                            'w-4 h-4',
                            generateForm.playbookType === type.value
                              ? 'text-dark_moss_green-700'
                              : 'text-slate-500'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{type.label}</p>
                          <p className="text-xs text-slate-500">{type.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-tiger_s_eye-50 rounded-lg p-4 border border-tiger_s_eye-100">
                <h3 className="font-medium text-tiger_s_eye-900 mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-dark_moss_green-700" />
                  AI Generation Process
                </h3>
                <p className="text-sm text-dark_moss_green-700">
                  Our AI will analyze your client's industry, domain, and any existing market analysis data to create a customized playbook with 8-12 actionable tactics, timelines, and KPIs.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={generating || !generateForm.clientId || clients.length === 0}
                  className="flex-1 bg-gradient-to-r from-tiger_s_eye-600 to-earth_yellow-600 hover:from-tiger_s_eye-700 hover:to-earth_yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Playbook...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Playbook</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}