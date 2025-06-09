import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { LandingPage } from './components/LandingPage';
import { Contact } from './pages/Contact';

// Lazy load all non-critical route components
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Clients = lazy(() => import('./pages/Clients').then(module => ({ default: module.Clients })));
const ClientDetail = lazy(() => import('./pages/ClientDetail').then(module => ({ default: module.ClientDetail })));
const Playbooks = lazy(() => import('./pages/Playbooks').then(module => ({ default: module.Playbooks })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

// Lazy load placeholder pages
const Reports = lazy(() => import('./components/PlaceholderPages').then(module => ({ default: module.Reports })));
const Settings = lazy(() => import('./components/PlaceholderPages').then(module => ({ default: module.Settings })));
const Privacy = lazy(() => import('./components/PlaceholderPages').then(module => ({ default: module.Privacy })));
const Terms = lazy(() => import('./components/PlaceholderPages').then(module => ({ default: module.Terms })));
const Support = lazy(() => import('./components/PlaceholderPages').then(module => ({ default: module.Support })));

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

  console.log('App state:', { 
    user: !!user, 
    loading, 
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

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
      <Routes>
        {/* Public landing page */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard\" replace /> : <LandingPage />
          } 
        />
        
        {/* Contact page */}
        <Route path="/contact" element={<Contact />} />
        
        {/* Auth routes */}
        <Route 
          path="/auth" 
          element={
            user ? <Navigate to="/dashboard\" replace /> : <AuthForm />
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

        {/* Placeholder routes for Privacy, Terms, and Support */}
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
        
        {/* Fallback routes */}
        <Route path="*" element={<Navigate to="/\" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;