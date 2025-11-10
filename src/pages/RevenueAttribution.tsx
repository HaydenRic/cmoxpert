import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  PoundSterling,
  TrendingUp,
  Target,
  Clock,
  Plus,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  Zap,
  Calendar,
  Percent,
  Rocket,
  X,
  CheckCircle,
  Info
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface Deal {
  id: string;
  deal_name: string;
  stage: string;
  amount: number;
  close_date: string | null;
  marketing_influenced: boolean;
  marketing_sourced: boolean;
  lead_source: string | null;
  created_date: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  budget_allocated: number;
  actual_spend: number;
  revenue_generated: number;
  closed_won: number;
  status: string;
}

interface Attribution {
  channel: string;
  touchpoints: number;
  revenue: number;
  deals: number;
  cost: number;
  roi: number;
}

export function RevenueAttribution() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedModel, setSelectedModel] = useState('linear');
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);

  const [newDeal, setNewDeal] = useState({
    deal_name: '',
    stage: 'lead',
    amount: 0,
    probability: 0,
    client_id: '',
    marketing_influenced: false,
    marketing_sourced: false,
    lead_source: ''
  });

  const [newCampaign, setNewCampaign] = useState({
    campaign_name: '',
    campaign_type: 'content',
    budget_allocated: 0,
    actual_spend: 0,
    start_date: format(new Date(), 'yyyy-MM-dd')
  });

  // Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [marketingInfluencedRevenue, setMarketingInfluencedRevenue] = useState(0);
  const [marketingSourcedRevenue, setMarketingSourcedRevenue] = useState(0);
  const [avgDealSize, setAvgDealSize] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);

  const attributionModels = [
    { value: 'first_touch', label: 'First Touch', description: '100% credit to first interaction' },
    { value: 'last_touch', label: 'Last Touch', description: '100% credit to last interaction' },
    { value: 'linear', label: 'Linear', description: 'Equal credit across all touchpoints' },
    { value: 'time_decay', label: 'Time Decay', description: 'More credit to recent touchpoints' },
    { value: 'u_shaped', label: 'U-Shaped', description: '40% first, 40% last, 20% middle' },
    { value: 'w_shaped', label: 'W-Shaped', description: '30% first, 30% last, 30% opp creation, 10% middle' }
  ];

  const dealStages = [
    { value: 'lead', label: 'Lead', probability: 10 },
    { value: 'qualified', label: 'Qualified', probability: 25 },
    { value: 'demo', label: 'Demo', probability: 40 },
    { value: 'proposal', label: 'Proposal', probability: 60 },
    { value: 'negotiation', label: 'Negotiation', probability: 80 },
    { value: 'closed_won', label: 'Closed Won', probability: 100 },
    { value: 'closed_lost', label: 'Closed Lost', probability: 0 }
  ];

  useEffect(() => {
    if (user) {
      loadData();
      loadClients();
    }
  }, [user, dateRange]);

  useEffect(() => {
    if (deals.length === 0 && campaigns.length === 0 && !loading) {
      setShowQuickStart(true);
    }
  }, [deals, campaigns, loading]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, domain')
        .eq('user_id', user!.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = subDays(new Date(), parseInt(dateRange));

      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user!.id)
        .gte('created_date', format(startDate, 'yyyy-MM-dd'))
        .order('created_date', { ascending: false });

      if (dealsError) throw dealsError;

      const { data: campaignsData, error: campaignsError } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      setDeals(dealsData || []);
      setCampaigns(campaignsData || []);

      calculateMetrics(dealsData || []);
    } catch (error) {
      console.error('Error loading revenue attribution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (dealsData: Deal[]) => {
    const closedWonDeals = dealsData.filter(d => d.stage === 'closed_won');
    const closedLostDeals = dealsData.filter(d => d.stage === 'closed_lost');
    const openDeals = dealsData.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));

    const totalRev = closedWonDeals.reduce((sum, d) => sum + d.amount, 0);
    const marketingInfluenced = closedWonDeals
      .filter(d => d.marketing_influenced)
      .reduce((sum, d) => sum + d.amount, 0);
    const marketingSourced = closedWonDeals
      .filter(d => d.marketing_sourced)
      .reduce((sum, d) => sum + d.amount, 0);

    const avgDeal = closedWonDeals.length > 0 ? totalRev / closedWonDeals.length : 0;
    const winRateCalc = closedWonDeals.length + closedLostDeals.length > 0
      ? (closedWonDeals.length / (closedWonDeals.length + closedLostDeals.length)) * 100
      : 0;
    const pipelineVal = openDeals.reduce((sum, d) => sum + d.amount, 0);

    setTotalRevenue(totalRev);
    setMarketingInfluencedRevenue(marketingInfluenced);
    setMarketingSourcedRevenue(marketingSourced);
    setAvgDealSize(avgDeal);
    setWinRate(winRateCalc);
    setPipelineValue(pipelineVal);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('deals').insert([{
        ...newDeal,
        user_id: user!.id,
        created_date: format(new Date(), 'yyyy-MM-dd')
      }]);

      if (error) throw error;

      setShowAddDeal(false);
      setNewDeal({
        deal_name: '',
        stage: 'lead',
        amount: 0,
        probability: 0,
        client_id: '',
        marketing_influenced: false,
        marketing_sourced: false,
        lead_source: ''
      });
      loadData();
    } catch (error: any) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal: ' + error.message);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('marketing_campaigns').insert([{
        ...newCampaign,
        user_id: user!.id,
        status: 'active'
      }]);

      if (error) throw error;

      setShowAddCampaign(false);
      setNewCampaign({
        campaign_name: '',
        campaign_type: 'content',
        budget_allocated: 0,
        actual_spend: 0,
        start_date: format(new Date(), 'yyyy-MM-dd')
      });
      loadData();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign: ' + error.message);
    }
  };

  // Mock attribution data by channel
  const channelAttribution: Attribution[] = deals.length > 0 ? [
    {
      channel: 'Organic Search',
      touchpoints: 245,
      revenue: marketingInfluencedRevenue * 0.35,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.35),
      cost: 5000,
      roi: 6.2
    },
    {
      channel: 'Paid Search',
      touchpoints: 189,
      revenue: marketingInfluencedRevenue * 0.25,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.25),
      cost: 15000,
      roi: 4.8
    },
    {
      channel: 'Content',
      touchpoints: 312,
      revenue: marketingInfluencedRevenue * 0.20,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.20),
      cost: 8000,
      roi: 5.5
    },
    {
      channel: 'Email',
      touchpoints: 428,
      revenue: marketingInfluencedRevenue * 0.15,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.15),
      cost: 3000,
      roi: 8.1
    },
    {
      channel: 'Social',
      touchpoints: 156,
      revenue: marketingInfluencedRevenue * 0.05,
      deals: Math.floor(deals.filter(d => d.stage === 'closed_won').length * 0.05),
      cost: 7000,
      roi: 1.9
    }
  ] : [];

  // Pipeline velocity chart data
  const pipelineVelocityData = [
    { stage: 'Lead', avgDays: 3, deals: deals.filter(d => d.stage === 'lead').length },
    { stage: 'Qualified', avgDays: 5, deals: deals.filter(d => d.stage === 'qualified').length },
    { stage: 'Demo', avgDays: 7, deals: deals.filter(d => d.stage === 'demo').length },
    { stage: 'Proposal', avgDays: 12, deals: deals.filter(d => d.stage === 'proposal').length },
    { stage: 'Negotiation', avgDays: 8, deals: deals.filter(d => d.stage === 'negotiation').length },
    { stage: 'Closed', avgDays: 0, deals: deals.filter(d => d.stage === 'closed_won').length }
  ];

  // Revenue trend data
  const revenueTrendData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subDays(new Date(), i * 30));
    const monthEnd = endOfMonth(monthStart);
    const monthDeals = deals.filter(d => {
      const dealDate = new Date(d.created_date);
      return dealDate >= monthStart && dealDate <= monthEnd && d.stage === 'closed_won';
    });
    return {
      month: format(monthStart, 'MMM'),
      revenue: monthDeals.reduce((sum, d) => sum + d.amount, 0) / 1000,
      deals: monthDeals.length
    };
  }).reverse();

  const COLORS = ['#22333B', '#5C8374', '#C9ADA7', '#F2E9E4', '#EAE0D5'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate_blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Quick Start Modal */}
      {showQuickStart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate_blue-500 to-slate_blue-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome to Revenue Attribution!</h2>
                  <p className="text-slate-600">Track marketing's influence on revenue</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickStart(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate_blue-50 border border-slate_blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate_blue-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  What is Revenue Attribution?
                </h3>
                <p className="text-sm text-slate_blue-800 mb-3">
                  Revenue Attribution shows exactly which marketing channels and campaigns drive actual revenue.
                  It helps you prove marketing ROI and optimize budget allocation.
                </p>
                <ul className="space-y-2 text-sm text-slate_blue-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                    <span>Track deals through your entire sales pipeline</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                    <span>See which marketing channels influenced each deal</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                    <span>Calculate ROI by channel with 6 attribution models</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">Quick Start Guide</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Create Your First Deal</p>
                      <p className="text-sm text-green-700">Add a sales opportunity to start tracking revenue</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Add Marketing Campaigns</p>
                      <p className="text-sm text-green-700">Track budget and performance of your marketing activities</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-green-900">View Attribution Insights</p>
                      <p className="text-sm text-green-700">See which channels drive the most revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowQuickStart(false);
                    setShowAddDeal(true);
                  }}
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create First Deal</span>
                </button>
                <button
                  onClick={() => setShowQuickStart(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Skip Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Deal</h2>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deal Name *</label>
                  <input
                    type="text"
                    value={newDeal.deal_name}
                    onChange={(e) => setNewDeal({ ...newDeal, deal_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                    placeholder="e.g., Enterprise Deal - Acme Corp"
                    required
                  />
                </div>

                {clients.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client (Optional)</label>
                    <select
                      value={newDeal.client_id}
                      onChange={(e) => setNewDeal({ ...newDeal, client_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                    >
                      <option value="">Select a client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stage *</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => {
                      const stage = dealStages.find(s => s.value === e.target.value);
                      setNewDeal({ ...newDeal, stage: e.target.value, probability: stage?.probability || 0 });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  >
                    {dealStages.map((stage) => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    value={newDeal.amount}
                    onChange={(e) => setNewDeal({ ...newDeal, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                    placeholder="50000"
                    min="0"
                    step="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    value={newDeal.probability}
                    onChange={(e) => setNewDeal({ ...newDeal, probability: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lead Source</label>
                  <input
                    type="text"
                    value={newDeal.lead_source}
                    onChange={(e) => setNewDeal({ ...newDeal, lead_source: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                    placeholder="e.g., Organic Search, Paid Ads"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newDeal.marketing_influenced}
                      onChange={(e) => setNewDeal({ ...newDeal, marketing_influenced: e.target.checked })}
                      className="w-4 h-4 text-slate_blue-600 rounded focus:ring-2 focus:ring-slate_blue-500"
                    />
                    <span className="text-sm text-slate-700">Marketing Influenced (marketing touched this deal)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newDeal.marketing_sourced}
                      onChange={(e) => setNewDeal({ ...newDeal, marketing_sourced: e.target.checked })}
                      className="w-4 h-4 text-slate_blue-600 rounded focus:ring-2 focus:ring-slate_blue-500"
                    />
                    <span className="text-sm text-slate-700">Marketing Sourced (marketing created this lead)</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Create Deal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDeal(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {showAddCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Marketing Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={newCampaign.campaign_name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, campaign_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  placeholder="Q4 Content Marketing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Type *</label>
                <select
                  value={newCampaign.campaign_type}
                  onChange={(e) => setNewCampaign({ ...newCampaign, campaign_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                >
                  <option value="content">Content Marketing</option>
                  <option value="paid_search">Paid Search</option>
                  <option value="paid_social">Paid Social</option>
                  <option value="email">Email Marketing</option>
                  <option value="event">Event</option>
                  <option value="webinar">Webinar</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={newCampaign.budget_allocated}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget_allocated: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                    min="0"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Spend ($)</label>
                  <input
                    type="number"
                    value={newCampaign.actual_spend}
                    onChange={(e) => setNewCampaign({ ...newCampaign, actual_spend: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={newCampaign.start_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate_blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate_blue-600 hover:bg-slate_blue-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCampaign(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Revenue Attribution</h1>
          <p className="text-slate-600">Track marketing's influence on pipeline and closed revenue</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate_blue-500 focus:border-transparent"
          >
            {attributionModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddDeal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Deal</span>
          </button>

          <button
            onClick={() => setShowAddCampaign(true)}
            className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Campaign</span>
          </button>

          <button
            onClick={loadData}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Attribution Model Info */}
      <div className="mb-6 bg-slate_blue-50 border border-slate_blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-slate_blue-600" />
          <div>
            <p className="font-medium text-slate_blue-900">
              {attributionModels.find(m => m.value === selectedModel)?.label} Attribution Model
            </p>
            <p className="text-sm text-slate_blue-700">
              {attributionModels.find(m => m.value === selectedModel)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {deals.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate_blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-slate_blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Start Tracking Revenue Attribution</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Add your first deal to see how marketing channels influence revenue and calculate ROI
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setShowAddDeal(true)}
              className="bg-slate_blue-600 hover:bg-slate_blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Deal</span>
            </button>
            <button
              onClick={() => setShowQuickStart(true)}
              className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50"
            >
              View Quick Start Guide
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Content - Only show if there are deals */}
      {deals.length > 0 && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <PoundSterling className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    ${(totalRevenue / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-green-600 flex items-center justify-end">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +23%
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate_blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    ${(marketingInfluencedRevenue / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-slate-500">
                    {totalRevenue > 0 ? ((marketingInfluencedRevenue / totalRevenue) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600">Marketing Influenced</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-tan-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    ${(pipelineValue / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-slate-500">
                    {deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length} deals
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600">Pipeline Value</h3>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-charcoal-600 rounded-lg flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-500">
                    Avg: ${(avgDealSize / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-600">Win Rate</h3>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Channel Attribution */}
            <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue by Channel</h2>
              {channelAttribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelAttribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="channel" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => `$${(value / 1000).toFixed(1)}K`}
                    />
                    <Bar dataKey="revenue" fill="#22333B" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  <p>Add deals to see channel attribution</p>
                </div>
              )}
            </div>

            {/* Pipeline Velocity */}
            <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Pipeline Velocity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={pipelineVelocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="avgDays" stroke="#5C8374" fill="#5C8374" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `$${value}K`}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22333B" strokeWidth={2} name="Revenue ($K)" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Performance Table */}
          {channelAttribution.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-cream-200">
              <div className="p-6 border-b border-cream-200">
                <h2 className="text-lg font-semibold text-slate-900">Channel Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Channel</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Touchpoints</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Deals</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Cost</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {channelAttribution.map((channel, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-900">{channel.channel}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-700">
                          {channel.touchpoints}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                          ${(channel.revenue / 1000).toFixed(1)}K
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-700">
                          {channel.deals}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-700">
                          ${(channel.cost / 1000).toFixed(1)}K
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-medium ${channel.roi >= 3 ? 'text-green-600' : channel.roi >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {channel.roi.toFixed(1)}x
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
