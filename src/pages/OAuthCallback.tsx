import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback } from '../lib/integrations/oauth';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/integrations'), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authentication parameters');
        setTimeout(() => navigate('/integrations'), 3000);
        return;
      }

      try {
        const result = await handleOAuthCallback(code, state);

        if (result.success) {
          setStatus('success');
          setMessage('Integration connected successfully! Redirecting...');
          setTimeout(() => navigate('/integrations'), 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to complete authentication');
          setTimeout(() => navigate('/integrations'), 3000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => navigate('/integrations'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Processing Authentication</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Success!</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Authentication Failed</h2>
              <p className="text-gray-600">{message}</p>
              <button
                onClick={() => navigate('/integrations')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Integrations
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
