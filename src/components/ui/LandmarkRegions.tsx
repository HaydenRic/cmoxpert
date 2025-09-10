import React from 'react';
import { cn } from '@/lib/utils';

// Semantic landmark components for consistent ARIA structure

interface LandmarkProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

// Banner landmark (header)
export function Banner({ children, className, id, ariaLabel, ariaLabelledBy }: LandmarkProps) {
  return (
    <header
      id={id}
      className={cn("", className)}
      role="banner"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </header>
  );
}

// Navigation landmark
interface NavigationProps extends LandmarkProps {
  type?: 'primary' | 'secondary' | 'breadcrumb' | 'pagination';
}

export function Navigation({ children, className, id, ariaLabel, ariaLabelledBy, type = 'primary' }: NavigationProps) {
  const getDefaultLabel = () => {
    switch (type) {
      case 'primary': return 'Main navigation';
      case 'secondary': return 'Secondary navigation';
      case 'breadcrumb': return 'Breadcrumb navigation';
      case 'pagination': return 'Pagination navigation';
      default: return 'Navigation';
    }
  };

  return (
    <nav
      id={id}
      className={cn("", className)}
      role="navigation"
      aria-label={ariaLabel || getDefaultLabel()}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </nav>
  );
}

// Main content landmark
export function Main({ children, className, id = "main-content", ariaLabel = "Main content" }: LandmarkProps) {
  return (
    <main
      id={id}
      className={cn("", className)}
      role="main"
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {children}
    </main>
  );
}

// Complementary landmark (sidebar)
export function Complementary({ children, className, id, ariaLabel, ariaLabelledBy }: LandmarkProps) {
  return (
    <aside
      id={id}
      className={cn("", className)}
      role="complementary"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </aside>
  );
}

// Content info landmark (footer)
export function ContentInfo({ children, className, id, ariaLabel = "Footer" }: LandmarkProps) {
  return (
    <footer
      id={id}
      className={cn("", className)}
      role="contentinfo"
      aria-label={ariaLabel}
    >
      {children}
    </footer>
  );
}

// Search landmark
export function Search({ children, className, id, ariaLabel = "Search" }: LandmarkProps) {
  return (
    <section
      id={id}
      className={cn("", className)}
      role="search"
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

// Form landmark
interface FormLandmarkProps extends LandmarkProps {
  name?: string;
}

export function FormLandmark({ children, className, id, ariaLabel, ariaLabelledBy, name }: FormLandmarkProps) {
  return (
    <section
      id={id}
      className={cn("", className)}
      role="form"
      aria-label={ariaLabel || (name ? `${name} form` : 'Form')}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </section>
  );
}

// Region landmark for generic sections
interface RegionProps extends LandmarkProps {
  heading?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function Region({ children, className, id, ariaLabel, ariaLabelledBy, heading, headingLevel = 2 }: RegionProps) {
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;
  const headingId = heading ? `${id || 'region'}-heading` : undefined;

  return (
    <section
      id={id}
      className={cn("", className)}
      role="region"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy || headingId}
    >
      {heading && (
        <HeadingTag id={headingId} className="sr-only">
          {heading}
        </HeadingTag>
      )}
      {children}
    </section>
  );
}

// Skip link component
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50",
        "bg-slate-900 text-white px-4 py-2 rounded-lg font-medium",
        "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
}

// Landmark navigation helper
export function LandmarkNavigation() {
  const landmarks = [
    { href: '#main-content', label: 'Main content' },
    { href: '#navigation', label: 'Navigation' },
    { href: '#sidebar', label: 'Sidebar' },
    { href: '#footer', label: 'Footer' }
  ];

  return (
    <nav className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:bg-white focus-within:border focus-within:border-slate-300 focus-within:rounded-lg focus-within:p-4 focus-within:shadow-lg">
      <h2 className="text-sm font-medium text-slate-900 mb-2">Page landmarks</h2>
      <ul className="space-y-1">
        {landmarks.map((landmark) => (
          <li key={landmark.href}>
            <a
              href={landmark.href}
              className="text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
            >
              {landmark.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}