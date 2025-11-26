import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Brain, Sparkles, BookOpen, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    link: string;
  };
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to cmoxpert!',
    description: 'Let us show you the powerful AI features that will save you 10-15 hours per week managing your B2B SaaS clients.',
    icon: Brain,
    highlight: 'primary'
  },
  {
    title: 'AI-Powered Playbooks',
    description: 'Generate custom marketing strategies for each client. Get 8-12 actionable tactics tailored to their industry, goals, and market position.',
    icon: BookOpen,
    action: {
      label: 'Try Playbooks',
      link: '/playbooks'
    },
    highlight: 'playbooks'
  },
  {
    title: 'Content Generation',
    description: 'Create blog posts, social media content, email campaigns, and ad copy in seconds. Uses professional templates with AI enhancement when configured.',
    icon: Sparkles,
    action: {
      label: 'Generate Content',
      link: '/content-hub'
    },
    highlight: 'content'
  },
  {
    title: 'Integration Health',
    description: 'Monitor all your marketing integrations in one place. Track sync status, performance metrics, and get alerts when something needs attention.',
    icon: Activity,
    action: {
      label: 'View Integrations',
      link: '/integrations'
    },
    highlight: 'integrations'
  },
  {
    title: 'Ready to Get Started?',
    description: 'Start by creating your first client, then explore the AI features. Need help? Visit the Admin page to configure your API keys for full AI power.',
    icon: Check,
    action: {
      label: 'Create First Client',
      link: '/clients'
    },
    highlight: 'complete'
  }
];

interface AIFeatureTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function AIFeatureTour({ onComplete, onSkip }: AIFeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentStepData = tourSteps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkipTour = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  const getHighlightColor = () => {
    switch (currentStepData.highlight) {
      case 'primary':
        return 'from-blue-500 to-cyan-500';
      case 'playbooks':
        return 'from-orange-500 to-amber-500';
      case 'content':
        return 'from-purple-500 to-pink-500';
      case 'integrations':
        return 'from-green-500 to-emerald-500';
      case 'complete':
        return 'from-blue-600 to-indigo-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300" />

      {/* Tour Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getHighlightColor()} p-6 rounded-t-2xl relative`}>
            <button
              onClick={handleSkipTour}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {currentStepData.title}
                </h2>
                <p className="text-white/90 text-sm">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              {currentStepData.description}
            </p>

            {currentStepData.action && (
              <Link
                to={currentStepData.action.link}
                onClick={handleComplete}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <span>{currentStepData.action.label}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}

            {/* Progress Dots */}
            <div className="flex items-center justify-center space-x-2 mt-8 mb-6">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-blue-600'
                      : index < currentStep
                      ? 'w-2 bg-green-500'
                      : 'w-2 bg-slate-300'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Previous</span>
              </button>

              <button
                onClick={handleSkipTour}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
              >
                Skip Tour
              </button>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}</span>
                {currentStep === tourSteps.length - 1 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
