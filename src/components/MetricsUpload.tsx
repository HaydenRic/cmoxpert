import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle, AlertCircle, FileText, X } from 'lucide-react';

interface MetricsUploadProps {
  clientId: string;
  onSuccess?: () => void;
}

interface PreviewRow {
  metric_name: string;
  metric_date: string;
  value: string;
  [key: string]: string;
}

export function MetricsUpload({ clientId, onSuccess }: MetricsUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    try {
      const text = await selectedFile.text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) {
        setError('CSV file must have at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());

      const requiredHeaders = ['metric_name', 'metric_date', 'value'];
      const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

      if (!hasRequiredHeaders) {
        setError(`CSV must have columns: ${requiredHeaders.join(', ')}`);
        setPreview([]);
        return;
      }

      const rows: PreviewRow[] = lines.slice(1, Math.min(6, lines.length)).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: PreviewRow = {
          metric_name: '',
          metric_date: '',
          value: '',
        };
        headers.forEach((h, i) => {
          row[h] = values[i] || '';
        });
        return row;
      });

      setPreview(rows);
    } catch (err) {
      setError('Failed to parse CSV file');
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const fileContent = await file.text();
      const session = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/csv-import-commit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          csvContent: fileContent,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Import failed');
      }

      const result = await response.json();
      setSuccess(true);
      setFile(null);
      setPreview([]);

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Import Metrics from CSV
      </h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">
          Upload a CSV file with columns: <code className="bg-gray-100 px-2 py-1 rounded text-xs">metric_name</code>, <code className="bg-gray-100 px-2 py-1 rounded text-xs">metric_date</code>, <code className="bg-gray-100 px-2 py-1 rounded text-xs">value</code>
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 cursor-pointer"
        />
      </div>

      {file && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">{file.name}</span>
          </div>
          <button
            onClick={clearFile}
            className="text-blue-600 hover:text-blue-800"
            title="Clear file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 font-medium mb-2">Preview (first 5 rows):</p>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Metric Name</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-3">{row.metric_name}</td>
                    <td className="py-2 px-3">{row.metric_date}</td>
                    <td className="py-2 px-3">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Importing...' : 'Import Metrics'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Metrics imported successfully!</span>
        </div>
      )}
    </div>
  );
}
