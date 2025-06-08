import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { LandingPage } from './components/LandingPage';
import { Contact } from './pages/Contact';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { Admin } from './pages/Admin';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark_moss_green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pakistan_green-600">Loading cmoxpert...</p>
        </div>
      </div>
    );
  }

  return (
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
      
      {/* Protected app routes */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <Layout>
              <Dashboard />
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
              <Clients />
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
              <ClientDetail />
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
              <div className="p-8">
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-pakistan_green-600 mt-2">Reports page coming soon...</p>
              </div>
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
              <div className="p-8">
                <h1 className="text-3xl font-bold">Playbooks</h1>
                <p className="text-pakistan_green-600 mt-2">Playbooks page coming soon...</p>
              </div>
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
              <Admin />
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
              <div className="p-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-pakistan_green-600 mt-2">Settings page coming soon...</p>
              </div>
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
          <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
              <p className="text-slate-600">Privacy Policy page coming soon...</p>
            </div>
          </div>
        } 
      />
      <Route 
        path="/terms" 
        element={
          <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Terms of Service</h1>
              <p className="text-slate-600">Terms of Service page coming soon...</p>
            </div>
          </div>
        } 
      />
      <Route 
        path="/support" 
        element={
          <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Support</h1>
              <p className="text-slate-600">Support page coming soon...</p>
            </div>
          </div>
        } 
      />
      
      {/* Fallback routes */}
      <Route path="*" element={<Navigate to="/\" replace />} />
    </Routes>
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