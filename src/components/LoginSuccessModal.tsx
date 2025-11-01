import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

interface LoginSuccessModalProps {
  email?: string;
  onComplete: () => void;
}

export function LoginSuccessModal({ email, onComplete }: LoginSuccessModalProps) {
  const [step, setStep] = useState<'verifying' | 'loading' | 'success'>('verifying');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const verifyTimer = setTimeout(() => {
      setStep('loading');
      setProgress(33);
    }, 600);

    const loadingTimer = setTimeout(() => {
      setStep('success');
      setProgress(100);
    }, 1200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(verifyTimer);
      clearTimeout(loadingTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const getStepMessage = () => {
    switch (step) {
      case 'verifying':
        return 'Verifying credentials...';
      case 'loading':
        return 'Loading your profile...';
      case 'success':
        return 'Login successful!';
      default:
        return 'Please wait...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center">
          {step === 'success' ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-green-600 animate-check-draw" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-slate_blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader className="w-12 h-12 text-slate_blue-600 animate-spin" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'success' ? 'Welcome Back!' : 'Signing You In'}
          </h2>

          {email && step === 'success' && (
            <p className="text-gray-600 mb-4">{email}</p>
          )}

          <p className="text-gray-600 mb-6">{getStepMessage()}</p>

          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-slate_blue-600 to-charcoal-700 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {step === 'success' && (
            <p className="text-sm text-gray-500 mt-4 animate-fade-in">
              Redirecting to dashboard...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
