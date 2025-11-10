import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, PoundSterling, Target, PieChart } from 'lucide-react';

interface ChannelData {
  name: string;
  spend: number;
  fraudRate: number;
}

const defaultChannels: ChannelData[] = [
  { name: 'Google Ads', spend: 0, fraudRate: 0.15 },
  { name: 'Meta Ads', spend: 0, fraudRate: 0.28 },
  { name: 'TikTok', spend: 0, fraudRate: 0.42 },
  { name: 'LinkedIn', spend: 0, fraudRate: 0.08 },
  { name: 'Affiliate', spend: 0, fraudRate: 0.55 },
  { name: 'Display', spend: 0, fraudRate: 0.38 }
];

export default function FraudTaxCalculator() {
  const [channels, setChannels] = useState<ChannelData[]>(defaultChannels);

  const handleSpendChange = (index: number, value: string) => {
    const newChannels = [...channels];
    newChannels[index].spend = parseFloat(value) || 0;
    setChannels(newChannels);
  };

  const totalSpend = channels.reduce((sum, ch) => sum + ch.spend, 0);
  const totalFraudWaste = channels.reduce((sum, ch) => sum + (ch.spend * ch.fraudRate), 0);
  const averageFraudRate = totalSpend > 0 ? (totalFraudWaste / totalSpend) * 100 : 0;
  const annualFraudWaste = totalFraudWaste * 12;
  const potentialSavings = totalFraudWaste * 0.85;
  const annualSavings = potentialSavings * 12;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getChannelColor = (fraudRate: number) => {
    if (fraudRate < 0.15) return 'bg-green-100 text-green-800 border-green-300';
    if (fraudRate < 0.30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Fraud Tax Calculator</h3>
          <p className="text-gray-600">Calculate fraud waste by channel</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-sm text-gray-600 mb-4">
          Enter your monthly spend by channel to see fraud exposure
        </p>

        {channels.map((channel, index) => (
          <div key={channel.name} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="font-semibold text-gray-900">{channel.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getChannelColor(channel.fraudRate)}`}>
                  {(channel.fraudRate * 100).toFixed(0)}% fraud rate
                </span>
              </div>
              <div className="relative w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  value={channel.spend || ''}
                  onChange={(e) => handleSpendChange(index, e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="0"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            {channel.spend > 0 && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-600">Estimated fraud waste:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(channel.spend * channel.fraudRate)}/month
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalSpend > 0 && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <PoundSterling className="w-4 h-4" />
                  <span>Total Monthly Spend</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpend)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <PieChart className="w-4 h-4" />
                  <span>Average Fraud Rate</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{averageFraudRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-red-900 text-lg mb-1">Your Fraud Tax</h4>
                <p className="text-sm text-red-700">Money lost to fraudulent traffic and invalid clicks</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-red-700 mb-1">Monthly Waste</p>
                <p className="text-3xl font-bold text-red-900">{formatCurrency(totalFraudWaste)}</p>
              </div>
              <div>
                <p className="text-sm text-red-700 mb-1">Annual Waste</p>
                <p className="text-3xl font-bold text-red-900">{formatCurrency(annualFraudWaste)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-green-900 text-lg mb-1">Potential Savings with cmoxpert</h4>
                <p className="text-sm text-green-700">Eliminate 85% of fraud waste with AI-powered detection</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700 mb-1">Monthly Savings</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(potentialSavings)}</p>
              </div>
              <div>
                <p className="text-sm text-green-700 mb-1">Annual Savings</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(annualSavings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Channel Recommendations</h4>
            </div>
            <ul className="space-y-2 text-sm">
              {channels
                .filter(ch => ch.spend > 0)
                .sort((a, b) => b.fraudRate - a.fraudRate)
                .slice(0, 3)
                .map((ch) => (
                  <li key={ch.name} className="flex items-center justify-between text-blue-800">
                    <span>
                      <span className="font-semibold">{ch.name}</span> has high fraud exposure
                    </span>
                    <span className="text-red-600 font-bold">
                      {formatCurrency(ch.spend * ch.fraudRate * 0.85)} recoverable
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
            <p className="text-lg mb-2">Your estimated annual savings:</p>
            <p className="text-4xl font-bold mb-4">{formatCurrency(annualSavings)}</p>
            <p className="text-blue-100 text-sm">
              This represents a {((annualSavings / (totalSpend * 12)) * 100).toFixed(1)}% improvement in marketing efficiency
            </p>
          </div>
        </div>
      )}

      {totalSpend === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Enter your monthly spend by channel to calculate your fraud tax
          </p>
        </div>
      )}
    </div>
  );
}
