import React, { useState } from 'react';
import { Building2, TrendingUp, TrendingDown, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface CaseStudy {
  id: string;
  institutionType: string;
  description: string;
  industry: string;
  size: string;
  challenge: string;
  solution: string[];
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  timeline: string;
  quote: string;
  quoteAuthor: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'digital-bank',
    institutionType: 'Digital Banking Institution',
    description: 'A UK-based digital bank serving 500,000+ customers',
    industry: 'Digital Banking',
    size: '£12M annual marketing spend',
    challenge: 'High CAC (£180) with 34% of marketing spend going to fraudulent installs and fake accounts. Customer verification drop-off at 22% was significantly impacting growth targets.',
    solution: [
      'Implemented real-time fraud detection across all acquisition channels',
      'Applied ML-powered traffic quality scoring',
      'Optimized channel mix based on LTV:CAC ratios',
      'Deployed automated compliance checking for FCA regulations'
    ],
    results: [
      {
        metric: 'CAC Reduction',
        value: '29%',
        description: 'From £180 to £128 per customer'
      },
      {
        metric: 'Fraud Prevention',
        value: '£3.2M',
        description: 'Annual savings from eliminated fraud'
      },
      {
        metric: 'Drop-off Improvement',
        value: '18%',
        description: 'Reduced verification abandonment'
      },
      {
        metric: 'LTV Increase',
        value: '22%',
        description: 'Higher quality customer cohorts'
      }
    ],
    timeline: '3 months to full implementation, ROI positive in 6 weeks',
    quote: 'cmoxpert helped us identify that over a third of our marketing spend was going to fraudulent traffic. The savings alone paid for the platform 10x over.',
    quoteAuthor: 'Head of Growth'
  },
  {
    id: 'payment-processor',
    institutionType: 'Payment Processing Platform',
    description: 'A rapidly growing B2B payment platform processing £500M+ annually',
    industry: 'Payment Processing',
    size: '£8M annual marketing spend',
    challenge: 'Struggling to scale profitably with CAC of £420 and limited visibility into which channels drove highest-value merchants. Compliance requirements made experimentation slow.',
    solution: [
      'Implemented attribution modeling for B2B buyer journeys',
      'Created merchant quality scoring system',
      'Automated compliance checks for marketing materials',
      'Built predictive models for merchant LTV'
    ],
    results: [
      {
        metric: 'Marketing Efficiency',
        value: '41%',
        description: 'Improvement in cost per quality lead'
      },
      {
        metric: 'Channel Performance',
        value: '3.2x',
        description: 'Better ROI from top channels'
      },
      {
        metric: 'Compliance Time',
        value: '78%',
        description: 'Faster campaign launch cycles'
      },
      {
        metric: 'Merchant Quality',
        value: '31%',
        description: 'Higher average transaction volume'
      }
    ],
    timeline: '4 months to full deployment, positive ROI in 2 months',
    quote: 'The B2B attribution alone was worth the investment. We finally understand which touchpoints actually drive high-value merchants.',
    quoteAuthor: 'VP of Marketing'
  },
  {
    id: 'wealth-management',
    institutionType: 'Digital Wealth Management Firm',
    description: 'A UK wealth management platform managing £2B+ in assets',
    industry: 'Wealth Management',
    size: '£6M annual marketing spend',
    challenge: 'High-net-worth acquisition was expensive (£650 CAC) with no clear way to distinguish between browsers and serious investors. FCA compliance added complexity to all campaigns.',
    solution: [
      'Built intent-based lead scoring system',
      'Implemented competitive intelligence tracking',
      'Created automated compliance documentation',
      'Deployed predictive analytics for AUM forecasting'
    ],
    results: [
      {
        metric: 'CAC Optimization',
        value: '38%',
        description: 'Reduced cost per qualified investor'
      },
      {
        metric: 'Lead Quality',
        value: '2.8x',
        description: 'Higher average initial deposit'
      },
      {
        metric: 'Conversion Rate',
        value: '54%',
        description: 'From lead to funded account'
      },
      {
        metric: 'Compliance Efficiency',
        value: '85%',
        description: 'Faster regulatory review process'
      }
    ],
    timeline: '5 months to complete rollout, ROI positive in 3 months',
    quote: 'We went from guessing which prospects were serious to knowing exactly who to focus on. Our sales team loves the quality of leads now.',
    quoteAuthor: 'Chief Marketing Officer'
  }
];

export default function CaseStudies() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Real Results from UK FinTech Leaders
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See how leading financial institutions eliminated fraud waste and improved their marketing ROI
        </p>
      </div>

      <div className="grid gap-6">
        {caseStudies.map((study) => (
          <div
            key={study.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6 lg:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {study.institutionType}
                  </h3>
                  <p className="text-gray-600 mb-2">{study.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {study.industry}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                      {study.size}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {study.results.map((result, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-green-700 uppercase">
                        {result.metric}
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-green-900 mb-1">
                      {result.value}
                    </p>
                    <p className="text-xs text-green-700">{result.description}</p>
                  </div>
                ))}
              </div>

              {expandedId === study.id && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      The Challenge
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{study.challenge}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      The Solution
                    </h4>
                    <ul className="space-y-2">
                      {study.solution.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex gap-3">
                      <div className="text-blue-600 text-5xl font-serif leading-none">"</div>
                      <div>
                        <p className="text-gray-800 italic text-lg mb-3 leading-relaxed">
                          {study.quote}
                        </p>
                        <p className="text-sm font-semibold text-blue-900">
                          {study.quoteAuthor}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">Timeline:</span> {study.timeline}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => toggleExpanded(study.id)}
                className="mt-4 w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors"
              >
                {expandedId === study.id ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Read Full Case Study</span>
                    <ChevronDown className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
