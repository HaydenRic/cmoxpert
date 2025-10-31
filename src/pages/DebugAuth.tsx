import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const info = {
      supabaseExists: !!supabase,
      supabaseType: typeof supabase,
      hasAuth: !!(supabase as any)?.auth,
      envUrl: import.meta.env.VITE_SUPABASE_URL,
      envKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      envMode: import.meta.env.MODE,
      envDev: import.meta.env.DEV,
    };
    setDebugInfo(info);
  }, []);

  const testConnection = async () => {
    try {
      setTestResult('Testing...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setTestResult(`Error: ${error.message}`);
      } else {
        setTestResult(`Success! Session: ${data.session ? 'Exists' : 'None'}`);
      }
    } catch (err: any) {
      setTestResult(`Exception: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold text-lg mb-2">Supabase Client Info</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold text-lg mb-2">Connection Test</h2>
            <button
              onClick={testConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Connection
            </button>
            {testResult && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                {testResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
