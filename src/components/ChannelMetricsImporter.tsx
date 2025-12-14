import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle, Loader, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ValidationRow {
  rowNumber: number;
  date: string;
  channel: string;
  errors?: string[];
}

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  preview: ValidationRow[];
  errors: string[];
}

interface CommitResult {
  success: boolean;
  rowsInserted: number;
  rowsFailed: number;
  errors: string[];
}

interface ChannelMetricsImporterProps {
  clientId: string;
  onImportSuccess?: (result: CommitResult) => void;
}

export function ChannelMetricsImporter({ clientId, onImportSuccess }: ChannelMetricsImporterProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [csvContent, setCsvContent] = useState('');
  const [filename, setFilename] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);

  const downloadTemplate = () => {
    const template = `date,channel,spend,clicks,impressions,conversions,leads,sqls,opps,revenue,notes
2024-12-01,paid_search,500.00,150,5000,30,10,5,2,5000,Q4 campaign
2024-12-01,paid_social,300.00,200,8000,25,8,3,1,4000,Facebook ads
2024-12-02,organic_search,,100,3000,20,7,3,1,3500,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'channel_metrics_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateCsv = async () => {
    if (!csvContent.trim()) {
      toast.error('Please paste CSV content or upload a file');
      return;
    }

    setLoading(true);
    try {
        const { data, error } = await supabase.functions.invoke('channel-csv-validate', {
          body: { csvContent }
        });

        if (error) {
          toast.error(error.message || 'Validation failed');
          return;
        }

        const result = data as ValidationResult;

      setValidationResult(result);
      if (result.valid || result.validRows > 0) {
        setStep('preview');
      } else {
        toast.error('No valid rows found in CSV');
      }
    } catch (error) {
      toast.error(`Validation error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const commitCsv = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('channel-csv-commit', {
        body: {
          clientId,
          filename,
          csvContent,
        }
      });

      if (error) {
        toast.error(error.message || 'Import failed');
        return;
      }

      const result = data as CommitResult;

      setCommitResult(result);
      setStep('complete');
      toast.success(`Imported ${result.rowsInserted} rows successfully`);
      onImportSuccess?.(result);
    } catch (error) {
      toast.error(`Import error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  };

  if (step === 'upload') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Import Channel Metrics</h3>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-3">
              Import daily marketing channel metrics (spend, clicks, conversions, revenue, etc.)
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Download size={16} />
              Download CSV Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <label className="cursor-pointer">
              <Upload className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV file (max 10MB)</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {filename && (
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <p className="text-sm text-green-800">
                <CheckCircle className="inline mr-1" size={14} />
                {filename} selected
              </p>
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or paste CSV content:
            </label>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="date,channel,spend,clicks,impressions,conversions,leads,sqls,opps,revenue,notes&#10;2024-12-01,paid_search,500.00,150,5000,30,10,5,2,5000,Q4 campaign"
              className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={validateCsv}
            disabled={loading || !csvContent.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            Validate & Preview
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview' && validationResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Review Import</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm text-gray-600">Total Rows</p>
              <p className="text-2xl font-bold text-blue-600">{validationResult.totalRows}</p>
            </div>
            <div className="bg-green-50 rounded p-3">
              <p className="text-sm text-gray-600">Valid Rows</p>
              <p className="text-2xl font-bold text-green-600">{validationResult.validRows}</p>
            </div>
            <div className={`${validationResult.invalidRows > 0 ? 'bg-red-50' : 'bg-gray-50'} rounded p-3`}>
              <p className="text-sm text-gray-600">Invalid Rows</p>
              <p className={`text-2xl font-bold ${validationResult.invalidRows > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {validationResult.invalidRows}
              </p>
            </div>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-900 mb-2">Issues Found:</p>
              <ul className="text-sm text-yellow-800 space-y-1">
                {validationResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {validationResult.errors.length > 5 && (
                  <li>• ... and {validationResult.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Row</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Channel</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {validationResult.preview.map((row) => (
                  <tr key={row.rowNumber} className={row.errors && row.errors.length > 0 ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2">{row.rowNumber}</td>
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2">{row.channel}</td>
                    <td className="px-4 py-2">
                      {row.errors && row.errors.length > 0 ? (
                        <span className="text-red-600 text-xs font-medium flex items-center gap-1">
                          <AlertCircle size={14} /> Invalid
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                          <CheckCircle size={14} /> Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('upload')}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={commitCsv}
              disabled={loading || validationResult.validRows === 0}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Import {validationResult.validRows} Rows
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete' && commitResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          {commitResult.success ? (
            <>
              <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
              <h3 className="text-lg font-semibold text-green-900">Import Successful</h3>
            </>
          ) : (
            <>
              <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
              <h3 className="text-lg font-semibold text-red-900">Import Failed</h3>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded p-4">
            <p className="text-sm text-gray-600">Rows Imported</p>
            <p className="text-3xl font-bold text-green-600">{commitResult.rowsInserted}</p>
          </div>
          {commitResult.rowsFailed > 0 && (
            <div className="bg-red-50 rounded p-4">
              <p className="text-sm text-gray-600">Rows Failed</p>
              <p className="text-3xl font-bold text-red-600">{commitResult.rowsFailed}</p>
            </div>
          )}
        </div>

        {commitResult.errors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-yellow-900 mb-2">Errors:</p>
            <ul className="text-sm text-yellow-800 space-y-1">
              {commitResult.errors.slice(0, 5).map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => {
            setStep('upload');
            setCsvContent('');
            setFilename('');
            setValidationResult(null);
            setCommitResult(null);
          }}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Import Another File
        </button>
      </div>
    );
  }

  return null;
}
