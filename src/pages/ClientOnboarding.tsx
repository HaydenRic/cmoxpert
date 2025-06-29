import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, AIServicesManager } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Globe, 
  Building, 
  Target, 
  Users, 
  Search, 
  Eye, 
  FileText, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Rocket,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react';
import { trackEvent } from '../components/Analytics';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

export function ClientOnboarding() {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingStep, setProcessingStep] = useState(false);
  const [stepComplete, setStepComplete] = useState<boolean[]>([]);
  const [formData, setFormData] = useState({
    industry: '',
    targetAudience: '',
    mainCompetitors: '',
    businessGoals: '',
    marketingChallenges: '',
    keyProducts: '',
    websiteUrl: '',
    existingChannels: [] as string[],
    budget: '',
    timeline: ''
  });
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<any[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [error, setError] = useState('');

  const steps: OnboardingStep[] = [
    {
      id: 'client-info',
      title: 'Client Information',
      description: 'Basic information about your client',
      icon: Building
    },
    {
      id: 'business-goals',
      title: 'Business Goals',
      description: 'Define key objectives and challenges',
      icon: Target
    },
    {
      id: 'competitors',
      title: 'Competitor Analysis',
      description: 'Identify and track key competitors',
      icon: Eye
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Generate AI-powered market insights',
      icon: Brain
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'Review and next steps',
      icon: CheckCircle
    }
  ];

  const channelOptions = [
    'Website/SEO',
    'Email Marketing',
    'Social Media',
    'Content Marketing',
    'Paid Advertising',
    'Events',
    'PR',
    'Partnerships',
    'Direct Sales'
  ];

  useEffect(() => {
    if (user && clientId) {
      loadClientData();
    }
  }, [user, clientId]);

  const loadClientData = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      
      setClient(data);
      setFormData(prev => ({
        ...prev,
        industry: data.industry || '',
        websiteUrl: data.domain || ''
      }));
      
      // Initialize step completion status
      setStepComplete(Array(steps.length).fill(false));
    } catch (error) {
      console.error('Error loading client data:', error);
      setError('Failed to load client data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      existingChannels: checked
        ? [...prev.existingChannels, value]
        : prev.existingChannels.filter(channel => channel !== value)
    }));
  };

  const handleCompetitorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompetitors(e.target.value.split(',').map(item => item.trim()));
  };

  const handleDiscoveredCompetitorToggle = (domain: string) => {
    setSelectedCompetitors(prev => 
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const discoverCompetitors = async () => {
    setProcessingStep(true);
    
    try {
      // In a real implementation, this would call an API to discover competitors
      // For demo purposes, we'll simulate the discovery
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock discovered competitors
      const mockCompetitors = [
        { name: 'CompetitorOne', domain: 'competitorone.com', relevance: 'high' },
        { name: 'CompetitorTwo', domain: 'competitortwo.com', relevance: 'high' },
        { name: 'CompetitorThree', domain: 'competitorthree.com', relevance: 'medium' },
        { name: 'CompetitorFour', domain: 'competitorfour.com', relevance: 'medium' },
        { name: 'CompetitorFive', domain: 'competitorfive.com', relevance: 'low' }
      ];
      
      // Add manually entered competitors
      const manualCompetitors = competitors.map(name => ({
        name,
        domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        relevance: 'high',
        manual: true
      }));
      
      setDiscoveredCompetitors([...manualCompetitors, ...mockCompetitors]);
      
      // Pre-select high relevance competitors
      setSelectedCompetitors(
        [...manualCompetitors, ...mockCompetitors]
          .filter(c => c.relevance === 'high' || c.manual)
          .map(c => c.domain)
      );
      
    } catch (error) {
      console.error('Error discovering competitors:', error);
      setError('Failed to discover competitors. Please try again.');
    } finally {
      setProcessingStep(false);
    }
  };

  const startMarketAnalysis = async () => {
    setProcessingStep(true);
    setAnalysisStarted(true);
    
    try {
      // Add selected competitors to database
      for (const domain of selectedCompetitors) {
        const competitor = discoveredCompetitors.find(c => c.domain === domain);
        if (competitor) {
          await supabase
            .from('competitors')
            .insert([{
              client_id: clientId,
              name: competitor.name,
              domain: competitor.domain
            }]);
        }
      }
      
      // Update client with industry information
      await supabase
        .from('clients')
        .update({
          industry: formData.industry
        })
        .eq('id', clientId);
      
      // Create a new report
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert([{
          client_id: clientId,
          domain: client.domain,
          status: 'pending'
        }])
        .select()
        .single();

      if (reportError) throw reportError;
      
      // Call the AI analysis function
      await AIServicesManager.generateMarketAnalysis({
        reportId: reportData.id,
        clientId: clientId,
        domain: client.domain,
        industry: formData.industry
      });
      
      // For demo purposes, we'll simulate the analysis completion
      setTimeout(() => {
        setAnalysisCompleted(true);
        setProcessingStep(false);
        
        // Mark step as complete
        const newStepComplete = [...stepComplete];
        newStepComplete[currentStep] = true;
        setStepComplete(newStepComplete);
        
        // Track event
        trackEvent('client_onboarding_analysis_completed', {
          client_id: clientId,
          client_name: client.name
        });
      }, 5000);
      
    } catch (error) {
      console.error('Error starting market analysis:', error);
      setError('Failed to start market analysis. Please try again.');
      setProcessingStep(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Track completion event
      trackEvent('client_onboarding_completed', {
        client_id: clientId,
        client_name: client.name
      });
      
      // Navigate to client detail page
      navigate(`/clients/${clientId}`);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleNextStep = () => {
    // Mark current step as complete
    const newStepComplete = [...stepComplete];
    newStepComplete[currentStep] = true;
    setStepComplete(newStepComplete);
    
    // Move to next step
    setCurrentStep(prev => prev + 1);
    
    // Track step completion
    trackEvent('client_onboarding_step_completed', {
      client_id: clientId,
      client_name: client.name,
      step: steps[currentStep].id
    });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Client Info
        return formData.industry.trim() !== '' && formData.websiteUrl.trim() !== '';
      case 1: // Business Goals
        return formData.businessGoals.trim() !== '' && formData.marketingChallenges.trim() !== '';
      case 2: // Competitors
        return selectedCompetitors.length > 0;
      case 3: // Market Analysis
        return analysisCompleted;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate_blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Client not found</h3>
          <p className="text-slate-600 mb-4">{error || 'The client you are looking for does not exist or you do not have access to it.'}</p>
          <button
            onClick={() => navigate('/clients')}
            className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Return to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/clients')} 
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate_blue-500 to-charcoal-500 rounded-xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{client.name} Onboarding</h1>
              <p className="text-slate-600">Set up your client for success with our guided onboarding process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep > index || stepComplete[index]
                  ? 'bg-slate_blue-600 text-white'
                  : currentStep === index
                  ? 'bg-white border-2 border-slate_blue-600 text-slate_blue-600'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {currentStep > index || stepComplete[index] ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="text-xs font-medium mt-2 text-center max-w-[100px]">
                {step.title}
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`absolute top-5 left-10 w-[calc(100vw/6)] h-0.5 -z-10 ${
                  currentStep > index || stepComplete[index]
                    ? 'bg-slate_blue-600'
                    : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-8 mb-8">
        {currentStep === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Client Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={client.name}
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Industry *
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="e.g., B2B SaaS, Fintech, Healthcare Technology"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Audience
                </label>
                <textarea
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Describe your client's ideal customer profile (ICP)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Key Products/Services
                </label>
                <textarea
                  name="keyProducts"
                  value={formData.keyProducts}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="List the main products or services your client offers"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Business Goals & Challenges</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Goals *
                </label>
                <textarea
                  name="businessGoals"
                  value={formData.businessGoals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="What are the primary business objectives your client wants to achieve?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Marketing Challenges *
                </label>
                <textarea
                  name="marketingChallenges"
                  value={formData.marketingChallenges}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="What marketing challenges is your client currently facing?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Marketing Channels
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {channelOptions.map((channel) => (
                    <label key={channel} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={channel}
                        checked={formData.existingChannels.includes(channel)}
                        onChange={handleCheckboxChange}
                        className="rounded border-slate-300 text-slate_blue-600 focus:ring-slate_blue-500"
                      />
                      <span className="text-sm text-slate-700">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marketing Budget (Monthly)
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  >
                    <option value="">Select budget range...</option>
                    <option value="0-5k">£0 - £5,000</option>
                    <option value="5k-10k">£5,000 - £10,000</option>
                    <option value="10k-25k">£10,000 - £25,000</option>
                    <option value="25k-50k">£25,000 - £50,000</option>
                    <option value="50k+">£50,000+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  >
                    <option value="">Select timeline...</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-12-months">6-12 months</option>
                    <option value="12-months+">12+ months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Competitor Analysis</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Main Competitors
                </label>
                <textarea
                  name="mainCompetitors"
                  value={competitors.join(', ')}
                  onChange={handleCompetitorChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
                  placeholder="Enter competitor names, separated by commas"
                />
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={discoverCompetitors}
                  disabled={processingStep}
                  className="bg-slate_blue-600 hover:bg-slate_blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                >
                  {processingStep ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Discovering Competitors...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Discover Competitors</span>
                    </>
                  )}
                </button>
              </div>
              
              {discoveredCompetitors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Discovered Competitors</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Select the competitors you want to track. We'll monitor their websites, content, and pricing changes.
                  </p>
                  
                  <div className="space-y-3">
                    {discoveredCompetitors.map((competitor, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedCompetitors.includes(competitor.domain)
                            ? 'bg-slate_blue-50 border-slate_blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => handleDiscoveredCompetitorToggle(competitor.domain)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              selectedCompetitors.includes(competitor.domain)
                                ? 'bg-slate_blue-600 border-slate_blue-600'
                                : 'border-slate-300'
                            }`}>
                              {selectedCompetitors.includes(competitor.domain) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{competitor.name}</h4>
                              <p className="text-sm text-slate-500">{competitor.domain}</p>
                            </div>
                          </div>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            competitor.relevance === 'high' ? 'bg-green-100 text-green-800' :
                            competitor.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {competitor.relevance} relevance
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Market Analysis</h2>
            
            {!analysisStarted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate_blue-100 to-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-slate_blue-700" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Generate Market Analysis</h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                  Our AI will analyze your client's industry, competitors, and market position to generate strategic insights and recommendations.
                </p>
                <button
                  onClick={startMarketAnalysis}
                  disabled={processingStep}
                  className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 disabled:opacity-50 text-white px-8 py-4 rounded-lg font-medium flex items-center space-x-2 mx-auto"
                >
                  {processingStep ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Market Analysis</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                {!analysisCompleted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-6 relative">
                      <div className="w-16 h-16 rounded-full border-4 border-slate_blue-200 border-t-slate_blue-600 animate-spin"></div>
                      <Brain className="w-8 h-8 text-slate_blue-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Generating Market Analysis</h3>
                    <p className="text-slate-600 mb-2 max-w-2xl mx-auto">
                      Our AI is analyzing market data, competitor information, and industry trends to generate strategic insights.
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate_blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">This may take a few minutes...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Market Analysis Complete!</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      We've successfully generated a comprehensive market analysis for {client.name}. You'll find strategic insights, competitor analysis, and actionable recommendations.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-6 max-w-2xl mx-auto text-left">
                      <h4 className="font-medium text-slate-900 mb-3">Analysis Includes:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">Competitive landscape analysis with {selectedCompetitors.length} tracked competitors</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">Market positioning assessment and opportunity identification</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">Keyword and content gap analysis</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">Strategic recommendations and action plan</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Setup Complete!</h2>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Congratulations! You've successfully set up {client.name} in cmoxpert. Your client is now ready for strategic marketing support.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-6 max-w-2xl mx-auto text-left mb-8">
                <h3 className="font-medium text-slate-900 mb-4">What's Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-slate_blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Eye className="w-4 h-4 text-slate_blue-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Review Market Analysis</h4>
                      <p className="text-sm text-slate-600">Explore the AI-generated market analysis and competitive insights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-tan-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-tan-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Generate Marketing Playbook</h4>
                      <p className="text-sm text-slate-600">Create an AI-powered marketing playbook with actionable tactics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-olive-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Target className="w-4 h-4 text-olive-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Set Up KPIs</h4>
                      <p className="text-sm text-slate-600">Define and track key performance indicators for your client</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={completeOnboarding}
                className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 text-white px-8 py-4 rounded-lg font-medium flex items-center space-x-2 mx-auto"
              >
                <Rocket className="w-5 h-5" />
                <span>Go to Client Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
              currentStep === 0
                ? 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-slate-200 hover:bg-slate-300'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={!isStepValid() || processingStep}
            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
              !isStepValid() || processingStep
                ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500'
                : 'bg-gradient-to-r from-slate_blue-600 to-charcoal-700 hover:from-slate_blue-700 hover:to-charcoal-800 text-white'
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}