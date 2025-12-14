import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from './components/Analytics';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { ErrorToastProvider, useErrorToast, NetworkStatus } from './components/ui/ErrorToast';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { initializeErrorHandling } from './lib/errorHandling';
import { DemoBadge } from './components/DemoBadge';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { featureFlags } from './lib/featureFlags';
import SaaSLanding from './pages/SaaSLanding';
import { Contact } from './pages/Contact';
import ProductizedLanding from './pages/ProductizedLanding';
import FreeAudit from './pages/FreeAudit';
import Pricing from './pages/Pricing';
import BetaLanding from './pages/BetaLanding';

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
// Removed: AlertRules - over-engineered for small teams
const Forecasting = lazy(() => import('./pages/Forecasting').then(module => ({ default: module.Forecasting })));
const RevenueAttribution = lazy(() => import('./pages/RevenueAttribution').then(module => ({ default: module.RevenueAttribution })));
// Removed: FraudAnalysis, ActivationFunnel, ComplianceChecker, SpendOptimizer
// These features were not core to the fractional CMO service offering

// Lazy load pitch system pages
const PitchDemo = lazy(() => import('./pages/PitchDemo').then(module => ({ default: module.default })));
// Removed: PitchAnalytics - consolidated into ClientDetail
const ServicePackages = lazy(() => import('./pages/ServicePackages').then(module => ({ default: module.ServicePackages })));
const Deliverables = lazy(() => import('./pages/Deliverables').then(module => ({ default: module.Deliverables })));

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
const PageLoadingFallback = () => {
  console.log('[APP] Rendering PageLoadingFallback');
  return (
    <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-dark_moss_green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-pakistan_green-600">Loading page...</p>
      </div>
    </div>
  );
};

function AppContent() {
  const { user, loading, error, skipLoading } = useAuth();
  const { toasts, closeToast } = useErrorToast();

  console.log('[APP] Rendering AppContent - Loading:', loading, 'User:', !!user, 'Error:', error);

  if (loading) {
    console.log('[APP] Showing loading screen');
    return (
      <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 border-4 border-dark_moss_green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pakistan_green-600 font-medium text-lg">Loading cmoxpert...</p>
          <p className="text-xs text-slate-500 mt-2">Checking authentication status...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-red-700 text-sm font-medium mb-2">Connection Issue</p>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}
          <div className="mt-6 space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
            >
              Reload page
            </button>
            <button
              onClick={() => {
                console.log('[APP] User clicked skip loading');
                skipLoading();
              }}
              className="text-xs text-dark_moss_green-600 hover:text-dark_moss_green-700 underline font-medium transition-colors"
            >
              Continue anyway
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-4">Check browser console (F12) for details</p>
        </div>
      </div>
    );
  }

  console.log('[APP] Loading complete, rendering routes');

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <DemoBadge />
        <NetworkStatus />
        <OfflineIndicator onRetry={() => window.location.reload()} />
        <Routes>
        {/* Public landing page - always accessible */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <ProductizedLanding />
            </Suspense>
          }
        />

        {/* Alternative landing pages */}
        <Route
          path="/saas"
          element={<SaaSLanding />}
        />

        {/* Redirect early-access to beta */}
        <Route
          path="/early-access"
          element={<Navigate to="/beta" replace />}
        />

        {/* Beta landing page */}
        <Route
          path="/beta"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <BetaLanding />
            </Suspense>
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

        <Route
          path="/packages"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <ServicePackages />
            </Suspense>
          }
        />

        <Route
          path="/audit"
          element={
            <Suspense fallback={<PageLoadingFallback />}>
              <FreeAudit />
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

        {/* Login route - redirects to auth */}
        <Route
          path="/login"
          element={<Navigate to="/auth" replace />}
        />

        {/* Demo route - redirects to pitch demo */}
        <Route
          path="/demo"
          element={<Navigate to="/pitch" replace />}
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

        {/* Removed: fraud-analysis, activation-funnel, compliance-checker, spend-optimizer routes */}

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

        {/* Removed: alert-rules route */}

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

        {featureFlags.ENABLE_REVENUE_ATTRIBUTION && (
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
        )}

        <Route
          path="/deliverables"
          element={
            user ? (
              <Layout>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Deliverables />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Removed: pitch-analytics route - functionality moved to ClientDetail */}

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
    </ErrorBoundary>
  );
}

function App() {
  console.log('[APP] Rendering App component');
  return (
    <Router>
      <ErrorBoundary>
        <ErrorToastProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#363636',
                  padding: '16px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#10b981',
                    color: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#ef4444',
                    color: '#fff',
                  },
                },
              }}
            />
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