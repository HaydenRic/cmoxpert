import React, { useEffect, useState } from 'react';

// Live region for dynamic announcements
interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export function LiveRegion({ 
  message, 
  politeness = 'polite', 
  atomic = true,
  relevant = 'all',
  className = 'sr-only'
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className}
    >
      {message}
    </div>
  );
}

// Status announcer for form states, loading, etc.
interface StatusAnnouncerProps {
  status: 'loading' | 'success' | 'error' | 'idle';
  message?: string;
  customMessages?: {
    loading?: string;
    success?: string;
    error?: string;
    idle?: string;
  };
}

export function StatusAnnouncer({ 
  status, 
  message, 
  customMessages = {} 
}: StatusAnnouncerProps) {
  const defaultMessages = {
    loading: 'Loading, please wait...',
    success: 'Operation completed successfully',
    error: 'An error occurred',
    idle: ''
  };

  const messages = { ...defaultMessages, ...customMessages };
  const currentMessage = message || messages[status];

  return (
    <LiveRegion 
      message={currentMessage}
      politeness={status === 'error' ? 'assertive' : 'polite'}
    />
  );
}

// Progress announcer for multi-step processes
interface ProgressAnnouncerProps {
  currentStep: number;
  totalSteps: number;
  stepName?: string;
  completed?: boolean;
}

export function ProgressAnnouncer({ 
  currentStep, 
  totalSteps, 
  stepName,
  completed = false 
}: ProgressAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (completed) {
      setAnnouncement('Process completed successfully');
    } else {
      const stepInfo = stepName ? ` ${stepName}` : '';
      setAnnouncement(`Step ${currentStep} of ${totalSteps}${stepInfo}`);
    }
  }, [currentStep, totalSteps, stepName, completed]);

  return <LiveRegion message={announcement} />;
}

// Heading hierarchy validator (development only)
export function HeadingStructureValidator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const validateHeadingStructure = () => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const issues: string[] = [];

      // Check for multiple h1s
      const h1Count = headings.filter(h => h.tagName === 'H1').length;
      if (h1Count > 1) {
        issues.push(`Found ${h1Count} h1 elements. Should have only one per page.`);
      }

      // Check for heading level skips
      let previousLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        
        if (index === 0 && level !== 1) {
          issues.push(`First heading should be h1, found ${heading.tagName.toLowerCase()}`);
        }
        
        if (level > previousLevel + 1) {
          issues.push(`Heading level skip: ${heading.tagName.toLowerCase()} follows h${previousLevel}`);
        }
        
        previousLevel = level;
      });

      // Check for empty headings
      headings.forEach(heading => {
        if (!heading.textContent?.trim()) {
          issues.push(`Empty heading found: ${heading.tagName.toLowerCase()}`);
        }
      });

      if (issues.length > 0) {
        console.warn('Heading structure issues found:', issues);
      }
    };

    // Run validation after component mounts
    const timer = setTimeout(validateHeadingStructure, 100);
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}

// Landmark navigation helper
export function LandmarkNavigationMenu() {
  const [landmarks, setLandmarks] = useState<Array<{ id: string; label: string; type: string }>>([]);

  useEffect(() => {
    const findLandmarks = () => {
      const landmarkSelectors = [
        'header[role="banner"], [role="banner"]',
        'nav[role="navigation"], [role="navigation"]', 
        'main[role="main"], [role="main"]',
        'aside[role="complementary"], [role="complementary"]',
        'footer[role="contentinfo"], [role="contentinfo"]',
        '[role="search"]',
        '[role="form"]',
        '[role="region"]'
      ];

      const foundLandmarks: Array<{ id: string; label: string; type: string }> = [];

      landmarkSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const id = element.id || `landmark-${foundLandmarks.length}`;
          const label = element.getAttribute('aria-label') || 
                       element.getAttribute('aria-labelledby') ||
                       element.tagName.toLowerCase();
          const type = element.getAttribute('role') || element.tagName.toLowerCase();
          
          foundLandmarks.push({ id, label, type });
        });
      });

      setLandmarks(foundLandmarks);
    };

    // Find landmarks after component mounts
    const timer = setTimeout(findLandmarks, 100);
    return () => clearTimeout(timer);
  }, []);

  if (landmarks.length === 0) return null;

  return (
    <nav 
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:right-4 focus-within:z-50 focus-within:bg-white focus-within:border focus-within:border-slate-300 focus-within:rounded-lg focus-within:p-4 focus-within:shadow-lg focus-within:max-w-xs"
      aria-label="Page landmarks"
    >
      <h2 className="text-sm font-medium text-slate-900 mb-3">Jump to section</h2>
      <ul className="space-y-2">
        {landmarks.map((landmark) => (
          <li key={landmark.id}>
            <a
              href={`#${landmark.id}`}
              className="block text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              <span className="capitalize">{landmark.type}</span>: {landmark.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Breadcrumb navigation component
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <Navigation 
      type="breadcrumb" 
      className={cn("py-2 px-4 bg-slate-50 border-b border-slate-200", className)}
    >
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-slate-400" aria-hidden="true">/</span>
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
              >
                {item.label}
              </a>
            ) : (
              <span 
                className={cn(
                  item.current ? "text-slate-900 font-medium" : "text-slate-600"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </Navigation>
  );
}

// Page header with proper heading hierarchy
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string; current?: boolean }>;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  breadcrumbs,
  className 
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-slate-200 bg-white", className)}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      
      <div className="px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="text-slate-600 mt-2">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Section with proper heading
interface SectionProps {
  title?: string;
  titleLevel?: 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export function Section({ 
  title, 
  titleLevel = 2, 
  children, 
  className, 
  id,
  ariaLabel 
}: SectionProps) {
  const HeadingTag = `h${titleLevel}` as keyof JSX.IntrinsicElements;
  const headingId = title ? `${id || 'section'}-heading` : undefined;

  return (
    <section
      id={id}
      className={className}
      aria-labelledby={headingId}
      aria-label={!title ? ariaLabel : undefined}
    >
      {title && (
        <HeadingTag id={headingId} className="text-xl font-semibold text-slate-900 mb-4">
          {title}
        </HeadingTag>
      )}
      {children}
    </section>
  );
}