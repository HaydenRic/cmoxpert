import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';

const METRIC_OPTIONS = [
  'MRR',
  'Churn Rate',
  'New Customers',
  'CAC',
  'LTV',
  'Pipeline Value',
  'Website Traffic',
  'Lead Conversions',
  'Demo Requests',
  'Active Subscriptions',
  'Revenue',
];

interface ManualMetricEntryProps {
  clientId: string;
  onSuccess?: () => void;
}

export function ManualMetricEntry({ clientId, onSuccess }: ManualMetricEntryProps) {
  const [metric, setMetric] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metric || !date || !value) return;

    setLoading(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('metrics_daily')
        .upsert({
          client_id: clientId,
          metric_name: metric,
          metric_date: date,
          value: parseFloat(value),
          source: 'manual',
        }, {
          onConflict: 'client_id,metric_name,metric_date,source'
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setMetric('');
      setValue('');
      setTimeout(() => setSuccess(false), 2000);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to add metric:', err);
      setError(err instanceof Error ? err.message : 'Failed to add metric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        Add Metric Manually
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select metric...</option>
            {METRIC_OPTIONS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Add Metric'}
        </button>
        {success && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Metric added successfully!</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </form>
  );
}
