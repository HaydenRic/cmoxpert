// src/components/Layout.tsx
import React from 'react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import OnboardingTour from './OnboardingTour';
import {
  LayoutDashboard,
  Rocket,
  BarChart3,
  PoundSterling,
  Eye,
  FileText,
  Users,
  Sparkles,
  BookOpen,
  Settings,
  LogOut,
  Compass,
  Shield,
  Plug,
  UserPlus,
  Zap,
  Bell,
  TrendingUp,
  Target,
  AlertTriangle,
  TrendingDown,
  FileCheck,
  Sliders
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Content Hub', href: '/content', icon: Sparkles },
    { name: 'Performance', href: '/performance', icon: BarChart3 },
    { name: 'Research', href: '/competitive-intelligence', icon: Eye },
    { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
    { name: 'Integrations', href: '/integrations', icon: Plug },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-100" role="application" aria-label="cmoxpert Client Management Platform">
      <OnboardingTour />

      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside 
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg" 
        role="complementary"
        aria-label="Application sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <header className="flex items-center px-6 py-8" role="banner">
            <BrandLogo />
          </header>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2" role="navigation" aria-label="Main navigation">
            <h2 className="sr-only">Main Navigation</h2>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-cream-200 text-slate_blue-900 border-r-2 border-slate_blue-600'
                      : 'text-slate-600 hover:bg-cornsilk-100 hover:text-slate-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {(item as any).badge && (
                    <span className={clsx(
                      'px-2 py-0.5 text-xs font-bold text-white rounded-full',
                      (item as any).badgeColor || 'bg-slate_blue-500'
                    )}>
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <footer className="p-4 border-t border-slate-200" role="contentinfo">
            <h2 className="sr-only">User Account</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-tan-400 to-olive-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-slate-500">
                    {profile?.role === 'admin' ? 'Administrator' : 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Sign out"
                aria-label="Sign out of your account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </footer>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        <main 
          id="main-content"
          className="min-h-screen" 
          role="main"
          aria-label="Main content area"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}