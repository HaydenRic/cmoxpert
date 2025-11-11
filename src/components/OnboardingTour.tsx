import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Users, Target, TrendingUp, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    path: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to cmoxpert!',
    description: "We're thrilled to have you here. Let's take a quick tour to show you how to get the most out of your client portfolio dashboard.",
    icon: <Sparkles className="w-12 h-12 text-earth_yellow-400" />
  },
  {
    title: 'Manage All Your Clients',
    description: 'Add your FinTech clients in one place. Track performance, health scores, contracts, and meeting notes. No more juggling spreadsheets.',
    icon: <Users className="w-12 h-12 text-blue-400" />,
    action: {
      label: 'Add Your First Client',
      path: '/clients'
    }
  },
  {
    title: 'Revenue Attribution',
    description: 'See which marketing channels actually drive revenue with 6+ attribution models including ML-based Shapley and Markov Chain.',
    icon: <TrendingUp className="w-12 h-12 text-green-400" />,
    action: {
      label: 'Explore Attribution',
      path: '/revenue-attribution'
    }
  },
  {
    title: 'Fraud Impact Analysis',
    description: 'Identify which channels are wasting budget on fraud. Calculate clean vs. dirty CAC to optimize spend.',
    icon: <Target className="w-12 h-12 text-red-400" />,
    action: {
      label: 'View Fraud Analysis',
      path: '/fraud-analysis'
    }
  },
  {
    title: 'Compliance Checking',
    description: 'Scan campaigns for FCA, SEC, and FINRA compliance issues before they become problems. Get fix suggestions instantly.',
    icon: <Shield className="w-12 h-12 text-purple-400" />,
    action: {
      label: 'Check Compliance',
      path: '/compliance-checker'
    }
  },
  {
    title: 'Save 10-15 Hours Per Week',
    description: "You're all set! Add your first client to get started. Our beta community is here to help if you need anything.",
    icon: <Clock className="w-12 h-12 text-earth_yellow-400" />,
    action: {
      label: 'Start Adding Clients',
      path: '/clients'
    }
  }
];

const TOUR_STORAGE_KEY = 'cmoxpert_tour_completed';

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (path: string) => {
    handleClose();
    navigate(path);
  };

  const currentStepData = TOUR_STEPS[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close tour"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            {currentStepData.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {currentStepData.action && (
          <button
            onClick={() => handleAction(currentStepData.action!.path)}
            className="w-full mb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            {currentStepData.action.label}
          </button>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleClose}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip tour
        </button>
      </div>
    </div>
  );
}
