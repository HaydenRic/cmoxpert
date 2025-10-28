import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CalculationResults {
  currentMonthlyWaste: number;
  currentAnnualWaste: number;
  estimatedFraudRate: number;
  projectedSavings: number;
  projectedAnnualSavings: number;
  newCAC: number;
  cacReduction: number;
  ltvImprovementPercent: number;
  paybackPeriod: number;
}

export default function ROICalculator() {
  const [monthlySpend, setMonthlySpend] = useState<string>('50000');
  const [currentCAC, setCurrentCAC] = useState<string>('150');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const calculateROI = () => {
    const spend = parseFloat(monthlySpend) || 0;
    const cac = parseFloat(currentCAC) || 0;

    if (spend === 0 || cac === 0) return;

    const estimatedFraudRate = spend < 30000 ? 0.15 : spend < 100000 ? 0.22 : 0.34;

    const currentMonthlyWaste = spend * estimatedFraudRate;
    const currentAnnualWaste = currentMonthlyWaste * 12;

    const fraudReductionRate = 0.85;
    const projectedSavings = currentMonthlyWaste * fraudReductionRate;
    const projectedAnnualSavings = projectedSavings * 12;

    const cacReduction = estimatedFraudRate * fraudReductionRate;
    const newCAC = cac * (1 - cacReduction);

    const ltvImprovementPercent = 22;

    const platformCost = spend < 50000 ? 2500 : spend < 200000 ? 5000 : 8000;
    const netMonthlySavings = projectedSavings - platformCost;
    const paybackPeriod = netMonthlySavings > 0 ? platformCost / netMonthlySavings : 0;

    const calculationResults: CalculationResults = {
      currentMonthlyWaste,
      currentAnnualWaste,
      estimatedFraudRate: estimatedFraudRate * 100,
      projectedSavings,
      projectedAnnualSavings,
      newCAC,
      cacReduction: cacReduction * 100,
      ltvImprovementPercent,
      paybackPeriod
    };

    setResults(calculationResults);

    supabase.from('roi_calculations').insert({
      session_id: sessionId,
      monthly_spend_gbp: spend,
      current_cac_gbp: cac,
      estimated_fraud_rate: estimatedFraudRate * 100,
      calculated_savings_gbp: projectedSavings,
      projected_cac_reduction: cacReduction * 100,
      projected_ltv_improvement: ltvImprovementPercent
    }).then();
  };

  useEffect(() => {
    if (monthlySpend && currentCAC) {
      const timer = setTimeout(calculateROI, 500);
      return () => clearTimeout(timer);
    }
  }, [monthlySpend, currentCAC]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Calculator className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">ROI Calculator</h3>
          <p className="text-gray-600">See your potential savings in real-time</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Monthly Marketing Spend (GBP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
            <input
              type="number"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
              placeholder="50000"
              min="0"
              step="1000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Total monthly spend across all channels</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Current CAC (GBP)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
            <input
              type="number"
              value={currentCAC}
              onChange={(e) => setCurrentCAC(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
              placeholder="150"
              min="0"
              step="10"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Your average customer acquisition cost</p>
        </div>
      </div>

      {results && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-red-900 text-lg mb-1">Current Fraud Tax</h4>
                <p className="text-sm text-red-700">Estimated waste from invalid traffic and fraud</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-red-700 mb-1">Monthly Waste</p>
                <p className="text-3xl font-bold text-red-900">{formatCurrency(results.currentMonthlyWaste)}</p>
              </div>
              <div>
                <p className="text-sm text-red-700 mb-1">Annual Waste</p>
                <p className="text-3xl font-bold text-red-900">{formatCurrency(results.currentAnnualWaste)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-sm text-red-700">
                <span className="font-semibold">{results.estimatedFraudRate.toFixed(0)}% fraud rate</span> based on your spend level
              </p>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-green-900 text-lg mb-1">With cmoxpert</h4>
                <p className="text-sm text-green-700">Your projected savings and improvements</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-green-700 mb-1">Monthly Savings</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(results.projectedSavings)}</p>
              </div>
              <div>
                <p className="text-sm text-green-700 mb-1">Annual Savings</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(results.projectedAnnualSavings)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 mb-1">New CAC</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(results.newCAC)}</p>
              <p className="text-xs text-blue-600 mt-1">↓ {results.cacReduction.toFixed(0)}% reduction</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 mb-1">LTV Boost</p>
              <p className="text-2xl font-bold text-purple-900">+{results.ltvImprovementPercent}%</p>
              <p className="text-xs text-purple-600 mt-1">Higher quality leads</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <Calculator className="w-5 h-5 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-700 mb-1">Payback</p>
              <p className="text-2xl font-bold text-orange-900">
                {results.paybackPeriod < 1 ? '<1' : results.paybackPeriod.toFixed(1)}
              </p>
              <p className="text-xs text-orange-600 mt-1">Months to ROI</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total First Year Value</p>
                <p className="text-3xl font-bold">{formatCurrency(results.projectedAnnualSavings)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
