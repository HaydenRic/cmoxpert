import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  BarChart3,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  features: string[];
}

const tourSteps: TourStep[] = [
  {
    id: 'fraud-detection',
    title: 'Real-Time Fraud Detection',
    description: 'AI-powered traffic quality scoring catches fraudulent installs, bot traffic, and fake accounts before you pay for them.',
    icon: Shield,
    image: 'fraud-dashboard',
    features: [
      'Real-time fraud scoring for every click',
      'Automated traffic quality analysis',
      'Blacklist management for known fraud sources',
      'Integration with all major ad platforms'
    ]
  },
  {
    id: 'attribution',
    title: 'Multi-Touch Attribution',
    description: 'Understand the complete customer journey with attribution built for complex B2B and FinTech buyer paths.',
    icon: Target,
    title: 'Multi-Touch Attribution',
    description: 'Understand the complete customer journey with attribution built for complex B2B and FinTech buyer paths.',
    icon: Target,
    image: 'attribution-model',
    features: [
      'Custom attribution models for FinTech',
      'Cross-device and cross-channel tracking',
      'Account-based marketing attribution',
      'Revenue attribution to marketing touchpoints'
    ]
  },
  {
    id: 'analytics',
    title: 'Channel Performance Analytics',
    description: 'Get instant visibility into which channels drive real customers vs. fraud. Optimize spend in real-time.',
    icon: BarChart3,
    image: 'channel-analytics',
    features: [
      'Real-time performance dashboards',
      'CAC and LTV tracking by channel',
      'Cohort analysis and retention metrics',
      'Custom reports and exports'
    ]
  },
  {
    id: 'predictive',
    title: 'Predictive Intelligence',
    description: 'ML models forecast CAC, LTV, and channel performance 90 days ahead so you can optimize before problems occur.',
    icon: TrendingUp,
    image: 'predictive-analytics',
    features: [
      'CAC forecasting by channel',
      'LTV predictions for customer cohorts',
      'Budget optimization recommendations',
      'Anomaly detection and alerts'
    ]
  },
  {
    id: 'compliance',
    title: 'Automated Compliance',
    description: 'FCA-compliant campaign checking and documentation built-in. Launch campaigns faster with confidence.',
    icon: CheckCircle2,
    image: 'compliance-checker',
    features: [
      'Automated FCA compliance checking',
      'Campaign approval workflows',
      'Audit trail and documentation',
      'Risk flagging and recommendations'
    ]
  }
];

interface ProductTourProps {
  onClose?: () => void;
}

export default function ProductTour({ onClose }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Product Tour</h3>
              <p className="text-blue-100 text-sm">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-1">
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-white'
                  : idx < currentStep
                  ? 'bg-blue-300'
                  : 'bg-blue-800'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          <div className="mb-6">
            <h4 className="text-3xl font-bold text-gray-900 mb-3">{step.title}</h4>
            <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4 border-2 border-blue-300">
              <div className="text-center">
                <Icon className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                <p className="text-blue-700 font-semibold">{step.image} Preview</p>
                <p className="text-sm text-blue-600 mt-2">Interactive dashboard mockup</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h5 className="font-bold text-gray-900 mb-4">Key Features:</h5>
            {step.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>

          {currentStep === tourSteps.length - 1 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Tour Complete!</p>
                  <p className="text-sm text-green-700">Ready to see it in action?</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex gap-2">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {currentStep === tourSteps.length - 1 ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
