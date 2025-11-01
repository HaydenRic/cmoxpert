import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from './components/Analytics';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ErrorToastProvider, useErrorToast, NetworkStatus } from './components/ui/ErrorToast';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { initializeErrorHandling } from './lib/errorHandling';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { LandingPageEnhanced as LandingPage } from './components/LandingPageEnhanced';
import { EarlyAccessLanding } from './components/EarlyAccessLanding';
import { Contact } from './pages/Contact';

// Lazy load all non-critical route components
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Clients = lazy(() => import('./pages/Clients').then(module => ({ default: module.Clients })));
const ClientDetail = lazy(() => import('./pages/ClientDetail').then(module => ({ default: module.ClientDetail })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Playbooks = lazy(() => import('./pages/Playbooks').then(module => ({ default: module.Playbooks })));
const Performance = lazy(() => import('./pages/Performance').then(module => ({ default: module.Performance })));
const ClientOnboarding = lazy(() => import('./pages/ClientOnboarding').then(module => ({ default: module.ClientOnboarding })));
const MarketingAnalytics = lazy(() => import('./pages/MarketingAnalytics').then(module => ({ default: module.MarketingAnalytics })));
const ContentHub = lazy(() => import('./pages/ContentHub').then(module => ({ default: module.ContentHub })));
const CompetitiveIntelligence = lazy(() => import('./pages/CompetitiveIntelligence').then(module => ({ default: module.CompetitiveIntelligence })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Integrations = lazy(() => import('./pages/Integrations').then(module => ({ default: module.Integrations })));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback').then(module => ({ default: module.OAuthCallback })));
const ClientPortal = lazy(() => import('./pages/ClientPortal').then(module => ({ default: module.ClientPortal })));
const Workflows = lazy(() => import('./pages/Workflows').then(module => ({ default: module.Workflows })));
const AlertRules = lazy(() => import('./pages/AlertRules').then(module => ({ default: module.AlertRules })));
const Forecasting = lazy(() => import('./pages/Forecasting').then(module => ({ default: module.Forecasting })));
const RevenueAttribution = lazy(() => import('./pages/RevenueAttribution').then(module => ({ default: module.RevenueAttribution })));
const FraudAnalysis = lazy(() => import('./pages/FraudAnalysis').then(module => ({ default: module.default })));
const ActivationFunnel = lazy(() => import('./pages/ActivationFunnel').then(module => ({ default: module.default })));
const ComplianceChecker = lazy(() => import('./pages/ComplianceChecker').then(module => ({ default: module.default })));
const SpendOptimizer = lazy(() => import('./pages/SpendOptimizer').then(module => ({ default: module.default })));

// Lazy load pitch system pages
const PitchDemo = lazy(() => import('./pages/PitchDemo').then(module => ({ default: module.default })));
const Pricing = lazy(() => import('./pages/Pricing').then(module => ({ default: module.default })));
const PitchAnalytics = lazy(() => import('./pages/PitchAnalytics').then(module => ({ default: module.default })));

// Lazy load placeholder pages
const Settings = lazy(() => import('./components/StaticPages').then(module => ({ default: module.Settings })));
const Privacy = lazy(() => import('./pages/Privacy').then(module => ({ default: module.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));
const Support = lazy(() => import('./components/StaticPages').then(module => ({ default: module.Support })));
const Security = lazy(() => import('./components/StaticPages').then(module => ({ default: module.Security })));
const DebugAuth = lazy(() => import('./pages/DebugAuth').then(module => ({ default: module.DebugAuth })));

// Initialize error handling
initializeErrorHandling();

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-dark_moss_green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-pakistan_green-600">Loading page...</p>
    </div>
  </div>
);

function AppContent() {
  const { user, loading, error, skipLoading } = useAuth();
  const { toasts, closeToast } = useErrorToast();

  if (loading) {
    return (
      <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark_moss_green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pakistan_green-600">Loading cmoxpert...</p>
          <p className="text-xs text-slate-500 mt-2">Checking authentication status...</p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Reload page
            </button>
            <button 
              onClick={skipLoading} 
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Continue anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <NetworkStatus />
      <OfflineIndicator onRetry={() => window.location.reload()} />
      <Routes>
        {/* Public landing page */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LandingPage />
          }
        />

        {/* Early Access landing page */}
        <Route
          path="/early-access"
          element={
            user ? <Navigate to="/dashboard" replace /> : <EarlyAccessLanding />
          }
        />

        {/* Contact page */}
        <Route path="/contact" element={<Contact />} />

        {/* Pitch system public pages */}
        <Route
          path="/pitch"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <PitchDemo />
            </Suspense>
          }
        />

        <Route
          path="/pricing"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Pricing />
            </Suspense>
          }
        />

        {/* Auth routes */}
        <Route
          path="/auth"
          element={
            user ? <Navigate to="/dashboard" replace /> : <AuthForm />
          }
        />
        
        {/* Protected app routes with lazy loading */}
        <Route 
          path="/dashboard" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Dashboard />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/clients" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Clients />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/clients/:id" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ClientDetail />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/performance" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Performance />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/marketing-analytics" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <MarketingAnalytics />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/content" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ContentHub />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/competitive-intelligence" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <CompetitiveIntelligence />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/clients/:clientId/onboarding" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ClientOnboarding />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/reports" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Reports />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route
          path="/playbooks"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Playbooks />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/fraud-analysis"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <FraudAnalysis />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/activation-funnel"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ActivationFunnel />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/compliance-checker"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ComplianceChecker />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/spend-optimizer"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <SpendOptimizer />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/admin" 
          element={ 
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Admin />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route
          path="/integrations"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Integrations />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/integrations/oauth/callback"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <OAuthCallback />
            </Suspense>
          }
        />

        <Route
          path="/client-portal"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <ClientPortal />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/workflows"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Workflows />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/alert-rules"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <AlertRules />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/forecasting"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Forecasting />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/revenue-attribution"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <RevenueAttribution />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/pitch-analytics"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <PitchAnalytics />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/settings"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Settings />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Placeholder routes for Privacy, Terms, Support, and Security */}
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Privacy />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Terms />
            </Suspense>
          }
        />
        <Route
          path="/support"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Support />
            </Suspense>
          }
        />
        <Route
          path="/security"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <Security />
            </Suspense>
          }
        />

        <Route
          path="/debug"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <DebugAuth />
            </Suspense>
          }
        />

        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ErrorToastProvider>
          <AuthProvider>
            <Analytics trackingId={import.meta.env.VITE_GA_TRACKING_ID} />
            <PerformanceMonitor />
            <AppContent />
          </AuthProvider>
        </ErrorToastProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;