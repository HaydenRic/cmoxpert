import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Sparkles,
  RefreshCw,
  Download,
  Info
} from 'lucide-react';

interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  regulation: string;
  rule: string;
  description: string;
  location?: string;
  suggestion: string;
}

interface ComplianceResult {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: ComplianceIssue[];
  passedChecks: number;
  totalChecks: number;
}

const COMPLIANCE_RULES = {
  fca: [
    {
      pattern: /\b(guaranteed|promise[ds]?|certain|100%|never lose|no risk|risk[- ]?free)\b/gi,
      rule: 'FCA 4.1.1 - Misleading Statements',
      description: 'Absolute guarantees about investment returns are prohibited',
      severity: 'critical' as const,
      suggestion: 'Replace with balanced language like "potential returns" or "historical performance"'
    },
    {
      pattern: /\b(get rich|millionaire|fortune|wealth quickly|easy money)\b/gi,
      rule: 'FCA 4.5.2 - Get Rich Quick Claims',
      description: 'Claims suggesting quick wealth generation are prohibited',
      severity: 'critical' as const,
      suggestion: 'Focus on realistic financial planning and long-term value'
    },
    {
      pattern: /\b(exclusive|limited time|act now|hurry|don\'t miss|last chance)\b/gi,
      rule: 'FCA 4.5.4 - Pressure Selling',
      description: 'High-pressure sales tactics are not permitted',
      severity: 'high' as const,
      suggestion: 'Remove urgency language and allow customers time to make informed decisions'
    },
    {
      pattern: /\b(free|no cost|without charge|complimentary)\b/gi,
      rule: 'FCA 4.5.3 - Free Offers',
      description: 'Free offers must be genuinely free with clear terms',
      severity: 'medium' as const,
      suggestion: 'If using "free", ensure there are no hidden fees and clearly state any conditions'
    }
  ],
  sec: [
    {
      pattern: /\b(guaranteed returns|assured profit|zero risk|cannot lose)\b/gi,
      rule: 'SEC Rule 156 - Investment Company Sales',
      description: 'Prohibits statements that guarantee investment returns or eliminate risk',
      severity: 'critical' as const,
      suggestion: 'Include risk disclosures and use language like "potential" instead of "guaranteed"'
    },
    {
      pattern: /\b(insider|secret|exclusive tip|wall street doesn\'t want)\b/gi,
      rule: 'SEC 10b-5 - Fraudulent Claims',
      description: 'Claims of insider information or exclusive access are prohibited',
      severity: 'critical' as const,
      suggestion: 'Base claims on publicly available information and research'
    },
    {
      pattern: /\b(\d+%\s*(?:return|profit|gain)|returns? of|guaranteed \$)\b/gi,
      rule: 'SEC Rule 156 - Performance Claims',
      description: 'Specific return percentages require proper context and disclaimers',
      severity: 'high' as const,
      suggestion: 'Include past performance disclaimers and timeframes. State "past performance is not indicative of future results"'
    }
  ],
  finra: [
    {
      pattern: /\b(safe|safety|secure investment|protected|insured returns)\b/gi,
      rule: 'FINRA 2210 - Communications with the Public',
      description: 'Cannot imply investments are safe, insured, or protected unless legally true',
      severity: 'critical' as const,
      suggestion: 'Clarify what is actually FDIC insured (deposits) vs. investments which carry risk'
    },
    {
      pattern: /\b(best|#1|top rated|highest|superior|outperform)\b/gi,
      rule: 'FINRA 2210(d)(1)(B) - Superlative Claims',
      description: 'Superlative claims must be substantiated and include time period',
      severity: 'high' as const,
      suggestion: 'Support claims with third-party rankings, include time period, and cite source'
    },
    {
      pattern: /\b(instant|immediate|same day|immediate approval)\b/gi,
      rule: 'FINRA 2210(d)(1)(F) - Time-Sensitive Claims',
      description: 'Time-sensitive claims must be accurate and substantiated',
      severity: 'medium' as const,
      suggestion: 'Be specific about timeframes and include any conditions or requirements'
    }
  ],
  general: [
    {
      pattern: /\b(FDIC|SIPC|insured)\b/gi,
      rule: 'Deposit Insurance Accuracy',
      description: 'Must accurately describe what is and is not insured',
      severity: 'critical' as const,
      suggestion: 'Clearly state: "Deposits are FDIC insured up to $250,000. Investments in securities are not FDIC insured, not bank guaranteed, and may lose value."'
    }
  ]
};

export default function ComplianceChecker() {
  const [campaignText, setCampaignText] = useState('');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [checking, setChecking] = useState(false);

  const runComplianceCheck = () => {
    if (!campaignText.trim()) return;

    setChecking(true);

    setTimeout(() => {
      const issues: ComplianceIssue[] = [];
      let totalChecks = 0;

      Object.entries(COMPLIANCE_RULES).forEach(([regulation, rules]) => {
        rules.forEach(rule => {
          totalChecks++;
          const matches = campaignText.match(rule.pattern);
          if (matches) {
            matches.forEach(match => {
              const context = getContext(campaignText, match);
              issues.push({
                severity: rule.severity,
                regulation: regulation.toUpperCase(),
                rule: rule.rule,
                description: rule.description,
                location: context,
                suggestion: rule.suggestion
              });
            });
          }
        });
      });

      const passedChecks = totalChecks - issues.length;
      const overallScore = Math.round((passedChecks / totalChecks) * 100);

      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const highCount = issues.filter(i => i.severity === 'high').length;

      if (criticalCount > 0) {
        riskLevel = 'critical';
      } else if (highCount > 1) {
        riskLevel = 'high';
      } else if (issues.length > 2) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }

      setResult({
        overallScore,
        riskLevel,
        issues,
        passedChecks,
        totalChecks
      });

      setChecking(false);
    }, 1500);
  };

  const getContext = (text: string, match: string): string => {
    const index = text.toLowerCase().indexOf(match.toLowerCase());
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + match.length + 30);
    return '...' + text.substring(start, end) + '...';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportReport = () => {
    if (!result) return;

    const report = `
COMPLIANCE CHECK REPORT
Generated: ${new Date().toLocaleDateString()}

OVERALL SCORE: ${result.overallScore}/100
RISK LEVEL: ${result.riskLevel.toUpperCase()}
PASSED CHECKS: ${result.passedChecks}/${result.totalChecks}

${result.issues.length > 0 ? `
ISSUES FOUND (${result.issues.length}):
${result.issues.map((issue, index) => `
${index + 1}. [${issue.severity.toUpperCase()}] ${issue.regulation} - ${issue.rule}
   Description: ${issue.description}
   Context: ${issue.location}
   Suggestion: ${issue.suggestion}
`).join('\n')}
` : 'No compliance issues found.'}

CAMPAIGN TEXT:
${campaignText}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${Date.now()}.txt`;
    a.click();
  };

  const exampleCampaigns = [
    {
      title: 'Poor Example (Multiple Violations)',
      text: 'Get rich quick with our guaranteed returns! Limited time offer - act now! 100% safe and risk-free investment. Join now and see immediate profits of 25% monthly. Exclusive insider access to top-rated opportunities. FDIC insured returns!'
    },
    {
      title: 'Good Example (Compliant)',
      text: 'Build your financial future with our investment platform. Our diversified portfolio approach offers potential for growth over time. Past performance is not indicative of future results. Investments carry risk and may lose value. Deposits are FDIC insured up to $250,000. Securities and investments are not FDIC insured. Learn more about how we can help you plan for your financial goals.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Checker</h1>
          <p className="text-gray-600 mt-1">Scan your marketing copy for FCA, SEC, and FINRA violations</p>
        </div>
        {result && (
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Text
              </label>
              <textarea
                value={campaignText}
                onChange={(e) => setCampaignText(e.target.value)}
                placeholder="Paste your ad copy, landing page text, email content, or any marketing material here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                {campaignText.length} characters
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={runComplianceCheck}
                disabled={!campaignText.trim() || checking}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checking ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Check Compliance
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setCampaignText('');
                  setResult(null);
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Compliance Report</h2>
                  <div className={`px-4 py-2 rounded-full font-semibold ${getRiskLevelColor(result.riskLevel)}`}>
                    {result.riskLevel.toUpperCase()} RISK
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{result.overallScore}</div>
                    <div className="text-sm text-gray-600">Compliance Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{result.passedChecks}</div>
                    <div className="text-sm text-gray-600">Passed Checks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{result.issues.length}</div>
                    <div className="text-sm text-gray-600">Issues Found</div>
                  </div>
                </div>

                {result.issues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
                    <p className="text-gray-600">No compliance issues detected in your campaign text.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.issues.map((issue, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <XCircle className={`w-5 h-5 ${
                              issue.severity === 'critical' ? 'text-red-600' :
                              issue.severity === 'high' ? 'text-orange-600' :
                              issue.severity === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(issue.severity)}`}>
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">{issue.regulation}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{issue.rule}</h4>
                            <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                            {issue.location && (
                              <div className="bg-gray-50 px-3 py-2 rounded text-sm text-gray-600 mb-2 font-mono">
                                {issue.location}
                              </div>
                            )}
                            <div className="flex items-start gap-2 bg-blue-50 px-3 py-2 rounded">
                              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-blue-900">
                                <span className="font-medium">Suggestion:</span> {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <Shield className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Why Compliance Matters</h3>
            <p className="text-sm text-gray-700 mb-4">
              FinTech marketing is heavily regulated. A single violation can result in:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Fines up to $1M+ per violation</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>License suspension or revocation</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Reputation damage and lost trust</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Mandatory corrective advertising</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <FileText className="w-10 h-10 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Campaigns</h3>
            <div className="space-y-4">
              {exampleCampaigns.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setCampaignText(example.text)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900 mb-1">{example.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{example.text}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Regulations Checked</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>FCA (Financial Conduct Authority)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>SEC (Securities and Exchange Commission)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>FINRA (Financial Industry Regulatory Authority)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
