import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw, List, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfiniteScrollItem {
  id: string;
  content: React.ReactNode;
}

interface AccessibleInfiniteScrollProps {
  items: InfiniteScrollItem[];
  hasMore: boolean;
  loading: boolean;
  error?: string;
  onLoadMore: () => void;
  onRetry?: () => void;
  className?: string;
  itemClassName?: string;
  loadingMessage?: string;
  endMessage?: string;
  errorMessage?: string;
  threshold?: number;
  pageSize?: number;
  showViewToggle?: boolean;
  initialView?: 'list' | 'grid';
  ariaLabel?: string;
}

export function AccessibleInfiniteScroll({
  items,
  hasMore,
  loading,
  error,
  onLoadMore,
  onRetry,
  className,
  itemClassName,
  loadingMessage = "Loading more items...",
  endMessage = "No more items to load",
  errorMessage = "Failed to load items",
  threshold = 200,
  pageSize = 20,
  showViewToggle = false,
  initialView = 'list',
  ariaLabel = "Content list"
}: AccessibleInfiniteScrollProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(initialView);
  const [showLoadButton, setShowLoadButton] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [itemsLoaded, setItemsLoaded] = useState(0);
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadButtonRef = useRef<HTMLButtonElement>(null);

  // Respect user's motion preferences
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intersection Observer for automatic loading
  useEffect(() => {
    if (!hasMore || loading || error || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !showLoadButton) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, error, onLoadMore, threshold, showLoadButton, prefersReducedMotion]);

  // Show manual load button for users who prefer reduced motion
  useEffect(() => {
    setShowLoadButton(prefersReducedMotion);
  }, [prefersReducedMotion]);

  // Announce new items to screen readers
  useEffect(() => {
    if (items.length > itemsLoaded && itemsLoaded > 0) {
      const newItemsCount = items.length - itemsLoaded;
      setAnnouncement(`${newItemsCount} new ${newItemsCount === 1 ? 'item' : 'items'} loaded`);
    }
    setItemsLoaded(items.length);
  }, [items.length, itemsLoaded]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !error) {
      onLoadMore();
    }
  }, [loading, hasMore, error, onLoadMore]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      handleLoadMore();
    }
  }, [onRetry, handleLoadMore]);

  // Keyboard navigation for load more button
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLoadMore();
    }
  }, [handleLoadMore]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* View toggle */}
      {showViewToggle && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            {items.length} {itemName} {hasMore && '(loading more...)'}
          </div>
          <div 
            role="group" 
            aria-label="View options"
            className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1"
          >
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
                viewMode === 'list'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
                viewMode === 'grid'
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Items container */}
      <div
        ref={containerRef}
        role="feed"
        aria-label={ariaLabel}
        aria-busy={loading}
        className={cn(
          "space-y-4",
          viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0"
        )}
      >
        {items.map((item, index) => (
          <article
            key={item.id}
            className={cn(
              "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-lg",
              itemClassName
            )}
            aria-posinset={index + 1}
            aria-setsize={hasMore ? -1 : items.length}
            tabIndex={0}
          >
            {item.content}
          </article>
        ))}
      </div>

      {/* Loading/Error/End states */}
      <div className="text-center py-4">
        {loading && (
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error || errorMessage}</span>
            </div>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && hasMore && (showLoadButton || prefersReducedMotion) && (
          <button
            ref={loadButtonRef}
            onClick={handleLoadMore}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              "bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
              "flex items-center space-x-2"
            )}
            aria-describedby="load-more-description"
          >
            <span>Load More {itemName}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {!loading && !error && !hasMore && (
          <div className="text-slate-500">
            {endMessage}
          </div>
        )}
      </div>

      {/* Hidden description for load more button */}
      <div id="load-more-description" className="sr-only">
        Load approximately {pageSize} more {itemName}. 
        Currently showing {items.length} {itemName}.
      </div>

      {/* Invisible sentinel for intersection observer */}
      {hasMore && !showLoadButton && !prefersReducedMotion && (
        <div
          ref={sentinelRef}
          className="h-1"
          aria-hidden="true"
        />
      )}

      {/* Skip to end link for screen readers */}
      {items.length > 10 && (
        <div className="sr-only">
          <button
            onClick={() => {
              const lastItem = containerRef.current?.lastElementChild as HTMLElement;
              lastItem?.focus();
            }}
            className="underline"
          >
            Skip to end of list
          </button>
        </div>
      )}
    </div>
  );
}