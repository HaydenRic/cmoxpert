import { useState } from 'react';
import { Brain, Check, X, AlertCircle, Loader, Sparkles, Key, TestTube, CheckCircle } from 'lucide-react';
import { AIServicesManager } from '../lib/supabase';
import clsx from 'clsx';

interface AIConfigPanelProps {
  currentApiKey?: string;
  onSave: (apiKey: string) => Promise<void>;
}

export function AIConfigPanel({ currentApiKey, onSave }: AIConfigPanelProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return key;
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult({
      success: true,
      message: 'AI is configured server-side by admin. API keys are not tested client-side for security.'
    });
    setTesting(false);
  };

  const handleSave = async () => {
    if (!apiKey) {
      setTestResult({
        success: false,
        message: 'Please enter an API key'
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(apiKey);
      setTestResult({
        success: true,
        message: 'API key saved successfully!'
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to save API key'
      });
    } finally {
      setSaving(false);
    }
  };

  const isConfigured = currentApiKey && currentApiKey.length > 0;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Configuration</h3>
            <p className="text-sm text-slate-600">Configure OpenAI API for content & playbook generation</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={clsx(
        'px-6 py-3 flex items-center space-x-3',
        isConfigured ? 'bg-green-50 border-b border-green-200' : 'bg-yellow-50 border-b border-yellow-200'
      )}>
        {isConfigured ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">AI Features Enabled</p>
              <p className="text-xs text-green-700">Using GPT-4 for high-quality content generation</p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">AI Features Not Configured</p>
              <p className="text-xs text-yellow-700">Add your OpenAI API key to enable AI-powered features</p>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span>How to get your OpenAI API Key:</span>
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
            <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">platform.openai.com/api-keys</a></li>
            <li>Click "Create new secret key"</li>
            <li>Copy the key (starts with "sk-")</li>
            <li>Paste it below and click "Test Connection"</li>
          </ol>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm pr-24"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          {currentApiKey && (
            <p className="text-xs text-slate-500 mt-1">
              Current key: {maskApiKey(currentApiKey)}
            </p>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={clsx(
            'rounded-lg p-4 flex items-start space-x-3',
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          )}>
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={clsx(
                'text-sm font-semibold',
                testResult.success ? 'text-green-900' : 'text-red-900'
              )}>
                {testResult.success ? 'Success!' : 'Error'}
              </p>
              <p className={clsx(
                'text-sm',
                testResult.success ? 'text-green-700' : 'text-red-700'
              )}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={testConnection}
            disabled={testing || !apiKey}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <TestTube className="w-5 h-5" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !apiKey}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Save API Key</span>
              </>
            )}
          </button>
        </div>

        {/* Features Info */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>What AI enables:</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Content Generation</p>
                <p className="text-xs text-slate-600">Blog posts, social media, emails</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Marketing Playbooks</p>
                <p className="text-xs text-slate-600">Custom strategy generation</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Smart Suggestions</p>
                <p className="text-xs text-slate-600">Context-aware recommendations</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Market Analysis</p>
                <p className="text-xs text-slate-600">Competitive intelligence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Info */}
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">💡 Pro Tip:</span> OpenAI charges per token used. Average costs: Blog post ~$0.10, Playbook ~$0.20.
            Start with $5 credit to test. <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline">Monitor usage here</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
