import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { ArrowLeft } from 'lucide-react';

interface StaticPageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function StaticPageLayout({ children, title }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-cornsilk-50">
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <BrandLogo />
              <div>
                <h1 className="text-xl font-bold text-slate-900">cmoxpert</h1>
                <p className="text-xs text-slate-500">AI Marketing Co-Pilot</p>
              </div>
            </Link>
            
            <nav role="navigation" aria-label="Header navigation">
              <Link 
                to="/" 
                className="text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" 
        role="main"
        tabIndex={-1}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center" id="page-title">{title}</h1>
        <article className="bg-white rounded-xl shadow-lg p-8 prose prose-lg max-w-none" aria-labelledby="page-title">
          {children}
        </article>
      </main>

      {/* Footer - Copied from LandingPage for consistency */}
      <footer className="py-12 bg-slate-900" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Footer</h2>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <BrandLogo variant="text-only" size="sm" />
            </div>
            <nav className="flex items-center space-x-6 text-slate-400" aria-label="Footer navigation">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            </nav>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 cmoxpert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}