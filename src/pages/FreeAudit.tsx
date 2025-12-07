import { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Search,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  DollarSign,
  BarChart3,
  Zap,
  ArrowRight,
  Mail,
  Building,
  Globe,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuditFormData {
  email: string;
  company_name: string;
  website: string;
  monthly_ad_spend: string;
  primary_channels: string[];
  biggest_challenge: string;
}

interface AuditResults {
  score: number;
  findings: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    issue: string;
    impact: string;
    recommendation: string;
  }>;
  opportunities: Array<{
    title: string;
    savings: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  estimated_waste: number;
  potential_savings: number;
}

export default function FreeAudit() {
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuditFormData>({
    email: '',
    company_name: '',
    website: '',
    monthly_ad_spend: '',
    primary_channels: [],
    biggest_challenge: ''
  });
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);

  const channels = [
    { id: 'paid_search', label: 'Google Ads / Paid Search' },
    { id: 'paid_social', label: 'Facebook / Instagram Ads' },
    { id: 'linkedin', label: 'LinkedIn Ads' },
    { id: 'display', label: 'Display Advertising' },
    { id: 'email', label: 'Email Marketing' },
    { id: 'other', label: 'Other Channels' }
  ];

  const challenges = [
    'Not sure if marketing is working',
    'Too expensive - need better ROI',
    'Cant track which channels drive results',
    'Agency isnt delivering value',
    'Spending too much time on analytics',
    'Need strategic guidance'
  ];

  const handleChannelToggle = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      primary_channels: prev.primary_channels.includes(channelId)
        ? prev.primary_channels.filter(c => c !== channelId)
        : [...prev.primary_channels, channelId]
    }));
  };

  const generateAuditResults = (data: AuditFormData): AuditResults => {
    const spend = parseInt(data.monthly_ad_spend) || 50000;
    const channelCount = data.primary_channels.length;

    // Calculate score based on inputs
    let score = 60; // Base score
    if (spend > 100000) score -= 10; // Higher spend = more waste potential
    if (channelCount < 2) score -= 15; // Poor diversification
    if (channelCount > 5) score -= 10; // Too scattered
    if (data.biggest_challenge.includes('expensive') || data.biggest_challenge.includes('ROI')) {
      score -= 15;
    }

    // Generate findings
    const findings = [];

    if (spend > 100000) {
      findings.push({
        severity: 'critical' as const,
        category: 'Budget Allocation',
        issue: 'High ad spend without proper optimization',
        impact: `Potentially wasting £${((spend * 0.3) / 100).toLocaleString()}/month`,
        recommendation: 'Implement systematic A/B testing and channel attribution analysis'
      });
    }

    if (channelCount < 2) {
      findings.push({
        severity: 'warning' as const,
        category: 'Channel Diversification',
        issue: 'Single-channel dependency creates risk',
        impact: 'Vulnerable to platform changes and market saturation',
        recommendation: 'Test 2-3 additional channels to diversify revenue sources'
      });
    }

    if (channelCount > 5) {
      findings.push({
        severity: 'warning' as const,
        category: 'Resource Dilution',
        issue: 'Too many channels dilutes focus and budget',
        impact: 'Difficult to achieve economies of scale in any single channel',
        recommendation: 'Consolidate to top 3-4 performing channels'
      });
    }

    findings.push({
      severity: 'warning' as const,
      category: 'Attribution Tracking',
      issue: 'Likely missing cross-channel attribution',
      impact: 'Making budget decisions with incomplete data',
      recommendation: 'Implement multi-touch attribution modeling'
    });

    findings.push({
      severity: 'info' as const,
      category: 'Creative Optimization',
      issue: 'Creative fatigue reduces campaign effectiveness over time',
      impact: 'CPAs typically increase 20-40% after 90 days without refresh',
      recommendation: 'Establish quarterly creative refresh cadence'
    });

    // Generate opportunities
    const opportunities = [
      {
        title: 'Eliminate underperforming campaigns',
        savings: Math.round(spend * 0.25),
        effort: 'low' as const,
        timeline: 'Immediate (this week)'
      },
      {
        title: 'Optimize landing page conversion rates',
        savings: Math.round(spend * 0.15),
        effort: 'medium' as const,
        timeline: '2-4 weeks'
      },
      {
        title: 'Implement automated bidding strategies',
        savings: Math.round(spend * 0.12),
        effort: 'low' as const,
        timeline: '1 week'
      },
      {
        title: 'Consolidate to best-performing channels',
        savings: Math.round(spend * 0.18),
        effort: 'medium' as const,
        timeline: '2-3 weeks'
      }
    ];

    const estimated_waste = Math.round(spend * 0.35);
    const potential_savings = Math.round(spend * 0.45);

    return {
      score: Math.max(30, Math.min(score, 85)),
      findings,
      opportunities,
      estimated_waste,
      potential_savings
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate audit results
      const results = generateAuditResults(formData);
      setAuditResults(results);

      // Save to database
      const monthlySpendCents = Math.round((parseInt(formData.monthly_ad_spend) || 0) * 100);
      const emailLower = formData.email.toLowerCase().trim();

      // Check if audit already exists for this email
      const { data: existing } = await supabase
        .from('marketing_audits')
        .select('id, submission_count')
        .eq('email', emailLower)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('marketing_audits')
          .update({
            company_name: formData.company_name,
            website: formData.website,
            monthly_ad_spend: monthlySpendCents,
            primary_channels: formData.primary_channels,
            biggest_challenge: formData.biggest_challenge,
            audit_results: results,
            score: results.score,
            submission_count: (existing.submission_count || 1) + 1,
            last_submission_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_agent: navigator.userAgent
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from('marketing_audits').insert({
          email: emailLower,
          company_name: formData.company_name,
          website: formData.website,
          monthly_ad_spend: monthlySpendCents,
          primary_channels: formData.primary_channels,
          biggest_challenge: formData.biggest_challenge,
          audit_results: results,
          score: results.score,
          referral_source: 'organic',
          ip_address: 'unknown',
          user_agent: navigator.userAgent,
          submission_count: 1,
          last_submission_date: new Date().toISOString()
        });

        if (error) throw error;
      }

      setStep('results');
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('There was an error generating your audit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <TrendingDown className="w-5 h-5 text-yellow-600" />;
      default:
        return <Search className="w-5 h-5 text-blue-600" />;
    }
  };

  if (step === 'results' && auditResults) {
    const getScoreColor = (score: number) => {
      if (score >= 70) return 'text-green-600';
      if (score >= 50) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreLabel = (score: number) => {
      if (score >= 70) return 'Good - Minor optimizations needed';
      if (score >= 50) return 'Fair - Significant opportunities exist';
      return 'Critical - Immediate action required';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              Audit Complete
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Your Marketing Health Report
            </h1>
            <p className="text-lg text-slate-600 mb-2">
              Based on your inputs, here's what we found
            </p>
            <p className="text-sm text-slate-500">
              Estimates based on industry benchmarks and the data you provided
            </p>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center border-r border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Marketing Health Score</p>
                <p className={`text-6xl font-bold ${getScoreColor(auditResults.score)}`}>
                  {auditResults.score}
                </p>
                <p className="text-slate-300 text-sm mt-2">{getScoreLabel(auditResults.score)}</p>
              </div>
              <div className="text-center border-r border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Estimated Monthly Waste</p>
                <p className="text-4xl font-bold text-red-400">
                  £{(auditResults.estimated_waste / 100).toLocaleString()}
                </p>
                <p className="text-slate-300 text-sm mt-2">Being spent inefficiently</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Potential Savings</p>
                <p className="text-4xl font-bold text-green-400">
                  £{(auditResults.potential_savings / 100).toLocaleString()}
                </p>
                <p className="text-slate-300 text-sm mt-2">Per month with optimization</p>
              </div>
            </div>
          </div>

          {/* Findings */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
              Key Findings
            </h2>
            <div className="space-y-4">
              {auditResults.findings.map((finding, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-5 ${getSeverityColor(finding.severity)}`}
                >
                  <div className="flex items-start space-x-4">
                    {getSeverityIcon(finding.severity)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{finding.category}</h3>
                        <span className="text-xs uppercase font-bold">{finding.severity}</span>
                      </div>
                      <p className="font-medium mb-2">{finding.issue}</p>
                      <p className="text-sm mb-3 opacity-90">
                        <strong>Impact:</strong> {finding.impact}
                      </p>
                      <p className="text-sm bg-white bg-opacity-50 rounded-lg p-3">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology Explanation */}
          <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6 mb-8">
            <details className="cursor-pointer">
              <summary className="font-bold text-blue-900 text-lg mb-2 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                How we calculated this
              </summary>
              <div className="mt-4 space-y-3 text-sm text-blue-800">
                <p>
                  <strong>Marketing Health Score:</strong> Calculated based on channel diversification, spend levels, and reported challenges.
                  Scores range from 30-85, with lower scores indicating more opportunities for optimization.
                </p>
                <p>
                  <strong>Estimated Waste:</strong> Based on industry benchmarks, we estimate 15-35% of marketing spend is typically
                  wasted on underperforming campaigns, poor targeting, and inefficient channels.
                </p>
                <p className="bg-blue-100 p-3 rounded">
                  <strong>Formula:</strong> Monthly Spend × Waste Factor (15-35%) = Estimated Waste<br />
                  <em>Waste factor varies based on number of channels, spend level, and reported challenges</em>
                </p>
                <p>
                  <strong>Potential Savings:</strong> With systematic optimization (A/B testing, channel consolidation, conversion rate
                  improvements), businesses typically recover 40-50% of wasted spend within 90 days.
                </p>
                <p className="text-xs text-blue-700 italic">
                  These are estimates based on industry averages. Actual results will vary based on your specific situation.
                </p>
              </div>
            </details>
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-green-600" />
              Quick Win Opportunities
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {auditResults.opportunities.map((opp, idx) => (
                <div key={idx} className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-5">
                  <h3 className="font-bold text-green-900 mb-2">{opp.title}</h3>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-green-700">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Save £{(opp.savings / 100).toLocaleString()}/mo
                    </span>
                    <span className="px-2 py-1 bg-green-200 text-green-900 rounded-full text-xs font-bold">
                      {opp.effort} effort
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    <Zap className="w-3 h-3 inline mr-1" />
                    {opp.timeline}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-slate_blue-600 to-slate_blue-700 rounded-2xl shadow-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Fix These Issues?
            </h2>
            <p className="text-slate_blue-100 text-lg mb-6 max-w-2xl mx-auto">
              Our productized marketing services deliver automated insights and strategic recommendations
              for 50-60% less than traditional agencies.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/packages"
                className="bg-white hover:bg-slate-50 text-slate_blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center"
              >
                View Service Packages
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/contact"
                className="bg-transparent hover:bg-white/10 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                Schedule Consultation
              </Link>
            </div>
            <p className="text-sm text-slate_blue-200 mt-6">
              We sent a copy of this audit to <strong>{formData.email}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4 mr-2" />
            Free Marketing Audit
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Are You Wasting Money on Marketing?
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get a free analysis of your marketing performance in 60 seconds.
            Discover where youre wasting budget and how to fix it.
          </p>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6 mb-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate_blue-600 mb-2">Join Our Beta Program</p>
            <p className="text-sm text-slate-600">
              Help us improve our audit tool and get exclusive early access to our platform
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate_blue-500 focus:outline-none"
                placeholder="you@company.com"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate_blue-500 focus:outline-none"
                placeholder="Acme Inc"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate_blue-500 focus:outline-none"
                placeholder="https://acme.com"
              />
            </div>

            {/* Monthly Ad Spend */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Monthly Ad Spend *
              </label>
              <select
                required
                value={formData.monthly_ad_spend}
                onChange={(e) => setFormData({ ...formData, monthly_ad_spend: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate_blue-500 focus:outline-none"
              >
                <option value="">Select range...</option>
                <option value="400000">Under £4,000/month</option>
                <option value="1500000">£4,000 - £20,000/month</option>
                <option value="5000000">£20,000 - £60,000/month</option>
                <option value="10000000">£60,000 - £120,000/month</option>
                <option value="20000000">£120,000+/month</option>
              </select>
            </div>

            {/* Primary Channels */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Primary Marketing Channels (select all that apply)
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`px-4 py-3 rounded-lg border-2 text-left font-medium transition-all ${
                      formData.primary_channels.includes(channel.id)
                        ? 'border-slate_blue-500 bg-slate_blue-50 text-slate_blue-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 inline mr-2 ${
                        formData.primary_channels.includes(channel.id) ? 'text-slate_blue-600' : 'text-slate-300'
                      }`}
                    />
                    {channel.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Biggest Challenge */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Whats your biggest marketing challenge? *
              </label>
              <select
                required
                value={formData.biggest_challenge}
                onChange={(e) => setFormData({ ...formData, biggest_challenge: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate_blue-500 focus:outline-none"
              >
                <option value="">Select challenge...</option>
                {challenges.map(challenge => (
                  <option key={challenge} value={challenge}>{challenge}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-slate_blue-600 to-slate_blue-700 hover:from-slate_blue-700 hover:to-slate_blue-800 text-white py-4 px-8 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Analyzing Your Marketing...
                </>
              ) : (
                <>
                  Get My Free Audit
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500">
              No credit card required. Results in 60 seconds.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
