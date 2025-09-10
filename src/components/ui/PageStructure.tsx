import React from 'react';
import { Banner, Navigation, Main, Complementary, ContentInfo, SkipLink } from './LandmarkRegions';
import { cn } from '@/lib/utils';

// Page structure templates for consistent landmark usage

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  skipLinks?: Array<{ href: string; label: string }>;
}

// Standard page layout with all landmarks
export function StandardPageLayout({
  children,
  header,
  navigation,
  sidebar,
  footer,
  className,
  skipLinks = [{ href: '#main-content', label: 'Skip to main content' }]
}: PageLayoutProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      {/* Skip links */}
      {skipLinks.map((link) => (
        <SkipLink key={link.href} href={link.href}>
          {link.label}
        </SkipLink>
      ))}

      {/* Header */}
      {header && (
        <Banner className="sticky top-0 z-50">
          {header}
        </Banner>
      )}

      {/* Main navigation */}
      {navigation && (
        <Navigation type="primary" className="border-b border-slate-200">
          {navigation}
        </Navigation>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        {sidebar && (
          <Complementary 
            id="sidebar"
            className="w-64 bg-white shadow-lg"
            ariaLabel="Application sidebar"
          >
            {sidebar}
          </Complementary>
        )}

        {/* Main content */}
        <Main className={cn("flex-1", sidebar && "pl-64")}>
          {children}
        </Main>
      </div>

      {/* Footer */}
      {footer && (
        <ContentInfo>
          {footer}
        </ContentInfo>
      )}
    </div>
  );
}

// Dashboard layout with sidebar
export function DashboardLayout({
  children,
  sidebar,
  className
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-cream-100", className)} role="application" aria-label="cmoxpert Dashboard">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      <div className="flex">
        <Complementary 
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg"
          ariaLabel="Application sidebar"
        >
          {sidebar}
        </Complementary>

        <Main className="pl-64 flex-1">
          {children}
        </Main>
      </div>
    </div>
  );
}

// Landing page layout
export function LandingPageLayout({
  children,
  header,
  footer,
  className
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen", className)}>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      {header && (
        <Banner className="sticky top-0 z-50">
          {header}
        </Banner>
      )}

      <Main>
        {children}
      </Main>

      {footer && (
        <ContentInfo>
          {footer}
        </ContentInfo>
      )}
    </div>
  );
}

// Article layout for content pages
export function ArticleLayout({
  title,
  children,
  sidebar,
  breadcrumbs,
  className
}: {
  title: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-white", className)}>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      {breadcrumbs && (
        <Navigation type="breadcrumb" className="bg-slate-50 border-b border-slate-200 py-2">
          {breadcrumbs}
        </Navigation>
      )}

      <div className="flex">
        {sidebar && (
          <Complementary 
            className="w-64 bg-slate-50 border-r border-slate-200 p-6"
            ariaLabel="Article sidebar"
          >
            {sidebar}
          </Complementary>
        )}

        <Main className="flex-1 max-w-4xl mx-auto px-6 py-12">
          <article aria-labelledby="article-title">
            <h1 id="article-title" className="text-4xl font-bold text-slate-900 mb-8">
              {title}
            </h1>
            <div className="prose prose-lg max-w-none">
              {children}
            </div>
          </article>
        </Main>
      </div>
    </div>
  );
}

// Form page layout
export function FormPageLayout({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-slate-50 flex items-center justify-center p-4", className)}>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      
      <Main className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <header className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
            {description && (
              <p className="text-slate-600">{description}</p>
            )}
          </header>

          {children}
        </div>
      </Main>
    </div>
  );
}