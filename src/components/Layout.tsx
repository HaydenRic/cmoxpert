// src/components/Layout.tsx
import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import OnboardingTour from './OnboardingTour';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { BackToTop } from './BackToTop';
import {
  LayoutDashboard,
  Rocket,
  BarChart3,
  Eye,
  FileText,
  Users,
  Sparkles,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  Plug,
  Zap,
  TrendingUp,
  Menu,
  X,
  Globe,
  GitBranch,
  PoundSterling
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';
import { useRecentPages, getRecentPages } from '../hooks/useRecentPages';
import { Clock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [recentPages, setRecentPages] = useState<Array<{path: string; title: string}>>([]);

  useRecentPages();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (user) {
      loadBadgeCounts();
    }
  }, [user]);

  useEffect(() => {
    const updateRecentPages = () => {
      setRecentPages(getRecentPages());
    };
    updateRecentPages();
    window.addEventListener('storage', updateRecentPages);
    const interval = setInterval(updateRecentPages, 1000);
    return () => {
      window.removeEventListener('storage', updateRecentPages);
      clearInterval(interval);
    };
  }, [location.pathname]);

  const loadBadgeCounts = async () => {
    try {
      const newBadges: Record<string, number> = {};

      const { count: needsOnboarding } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'needs_onboarding');

      if (needsOnboarding && needsOnboarding > 0) {
        newBadges['clients'] = needsOnboarding;
      }

      const { count: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'pending');

      if (pendingReports && pendingReports > 0) {
        newBadges['reports'] = pendingReports;
      }

      const { count: failedIntegrations } = await supabase
        .from('integrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'error');

      if (failedIntegrations && failedIntegrations > 0) {
        newBadges['integrations'] = failedIntegrations;
      }

      setBadges(newBadges);
    } catch (error) {
      console.error('Error loading badge counts:', error);
    }
  };

  const navigationSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Clients',
      items: [
        { name: 'Clients', href: '/clients', icon: Users, badge: badges['clients'], badgeColor: 'bg-orange-500' },
        { name: 'Client Portal', href: '/client-portal', icon: Globe }
      ]
    },
    {
      title: 'AI Features',
      items: [
        { name: 'Content Hub', href: '/content', icon: Sparkles },
        { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
        { name: 'Research', href: '/competitive-intelligence', icon: Eye }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports', href: '/reports', icon: FileText, badge: badges['reports'], badgeColor: 'bg-blue-500' },
        { name: 'Performance', href: '/performance', icon: BarChart3 },
        { name: 'Attribution', href: '/revenue-attribution', icon: PoundSterling },
        { name: 'Forecasting', href: '/forecasting', icon: TrendingUp }
      ]
    },
    {
      title: 'Tools',
      items: [
        { name: 'Integrations', href: '/integrations', icon: Plug, badge: badges['integrations'], badgeColor: 'bg-red-500' },
        { name: 'Workflows', href: '/workflows', icon: GitBranch },
        { name: 'Deliverables', href: '/deliverables', icon: Zap }
      ]
    },
    {
      title: 'Settings',
      items: [
        ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
        { name: 'Settings', href: '/settings', icon: Settings }
      ]
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderNavSection = (section: NavSection, index: number) => (
    <div key={section.title} className="mb-6">
      <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {section.title}
      </h3>
      <div className="space-y-1">
        {section.items.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-3'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center">
                <item.icon className={clsx(
                  'w-5 h-5 mr-3 transition-colors',
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                )} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={clsx(
                  'px-2 py-0.5 text-xs font-bold rounded-full',
                  item.badgeColor || 'bg-blue-600 text-white'
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100" role="application" aria-label="cmoxpert Client Management Platform">
      <OnboardingTour />
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <KeyboardShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-slate-700" />
          ) : (
            <Menu className="w-6 h-6 text-slate-700" />
          )}
        </button>
      )}

      {/* Mobile overlay */}
      {mobileMenuOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out',
          isMobile && !mobileMenuOpen && '-translate-x-full'
        )}
        role="complementary"
        aria-label="Application sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <header className="flex items-center px-6 py-8" role="banner">
            <BrandLogo />
          </header>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto" role="navigation" aria-label="Main navigation">
            <h2 className="sr-only">Main Navigation</h2>
            {navigationSections.map((section, index) => renderNavSection(section, index))}

            {/* Recent Pages */}
            {recentPages.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>Recent</span>
                </h3>
                <div className="space-y-1">
                  {recentPages.slice(0, 3).map((page) => {
                    const isActive = location.pathname === page.path;
                    return (
                      <Link
                        key={page.path}
                        to={page.path}
                        className={clsx(
                          'flex items-center px-4 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <span className="truncate">{page.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
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
      <div className="lg:pl-64">
        <main
          id="main-content"
          className="min-h-screen"
          role="main"
          aria-label="Main content area"
          tabIndex={-1}
        >
          {children}
        </main>
        <BackToTop />
      </div>
    </div>
  );
}