import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Progressive enhancement wrapper component
interface ProgressiveEnhancementProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  feature?: string;
  timeout?: number;
  className?: string;
}

export function ProgressiveEnhancement({
  children,
  fallback,
  feature,
  timeout = 3000,
  className
}: ProgressiveEnhancementProps) {
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if JavaScript is enabled and feature is supported
    const checkEnhancement = () => {
      let supported = true;

      // Check specific feature support
      if (feature) {
        switch (feature) {
          case 'intersection-observer':
            supported = 'IntersectionObserver' in window;
            break;
          case 'resize-observer':
            supported = 'ResizeObserver' in window;
            break;
          case 'web-animations':
            supported = 'animate' in document.createElement('div');
            break;
          case 'css-grid':
            supported = CSS.supports('display', 'grid');
            break;
          case 'css-custom-properties':
            supported = CSS.supports('color', 'var(--test)');
            break;
          case 'fetch':
            supported = 'fetch' in window;
            break;
          case 'local-storage':
            try {
              localStorage.setItem('test', 'test');
              localStorage.removeItem('test');
              supported = true;
            } catch {
              supported = false;
            }
            break;
          default:
            supported = true;
        }
      }

      if (supported) {
        setIsEnhanced(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    // Set timeout for fallback
    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      if (!isEnhanced) {
        console.warn(`Progressive enhancement timeout for feature: ${feature}`);
      }
    }, timeout);

    // Check immediately
    checkEnhancement();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [feature, timeout, isEnhanced]);

  return (
    <div className={className}>
      {isEnhanced ? children : (hasTimedOut || !feature) ? fallback : null}
    </div>
  );
}

// Reduced motion wrapper
interface ReducedMotionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function ReducedMotionWrapper({
  children,
  fallback,
  className
}: ReducedMotionProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={className}>
      {prefersReducedMotion ? (fallback || children) : children}
    </div>
  );
}

// High contrast mode detection
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const isWindows = navigator.platform.indexOf('Win') > -1;
      if (isWindows) {
        const testElement = document.createElement('div');
        testElement.style.border = '1px solid';
        testElement.style.borderColor = 'ButtonText';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const isHighContrast = computedStyle.borderColor !== 'ButtonText';
        
        document.body.removeChild(testElement);
        setIsHighContrast(isHighContrast);
      }

      // Check for forced-colors media query (newer browsers)
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(forced-colors: active)');
        setIsHighContrast(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
          setIsHighContrast(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    };

    checkHighContrast();
  }, []);

  return isHighContrast;
}

// Focus management utilities
export function useFocusManagement() {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const getFocusableElements = useCallback((container: HTMLElement) => {
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [getFocusableElements]);

  const restoreFocus = useCallback((element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      // Use setTimeout to ensure the element is ready to receive focus
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  }, []);

  return {
    getFocusableElements,
    trapFocus,
    restoreFocus
  };
}

// Skip link component for keyboard navigation
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

// Accessible heading hierarchy
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Heading({ level, children, className, id }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const defaultClasses = {
    1: "text-3xl font-bold",
    2: "text-2xl font-semibold", 
    3: "text-xl font-semibold",
    4: "text-lg font-medium",
    5: "text-base font-medium",
    6: "text-sm font-medium"
  };

  return (
    <Tag 
      id={id}
      className={cn(defaultClasses[level], "text-slate-900", className)}
    >
      {children}
    </Tag>
  );
}