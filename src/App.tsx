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
import { ProtectedRoute } from './components/ProtectedRoute';
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading page...</p>
      </div>
    </div>
  );
};

function AppContent() {
  const { user, loading, error } = useAuth();
  // const { toasts, closeToast } = useErrorToast(); // Unused

  console.log('[APP] Rendering AppContent - Loading:', loading, 'User:', !!user, 'Error:', error);

  // Don't block page load on auth — render routes immediately and show spinner on protected routes only.
  // Public pages (landing, pitch, pricing) load instantly while auth resolves in background.

  console.log('[APP] Rendering routes (auth loading in background if needed)');

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
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
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
                  background: '#18181b', // zinc-900
                  color: '#fff',
                  border: '1px solid #27272a', // zinc-800
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
                    background: '#18181b',
                    color: '#fff',
                    border: '1px solid #10b981',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#18181b',
                    color: '#fff',
                    border: '1px solid #ef4444',
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