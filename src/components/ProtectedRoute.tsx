import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper for protected app routes.
 * - If user is logged in: render content immediately
 * - If loading and not authenticated: show loading spinner
 * - If not authenticated after timeout: redirect to auth
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading && !user) {
    // Show a lightweight loading indicator only for protected routes
    return (
      <div className="min-h-screen bg-cornsilk-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark_moss_green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pakistan_green-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
