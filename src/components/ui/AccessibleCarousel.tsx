import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselItem {
  id: string;
  content: React.ReactNode;
  title?: string;
  description?: string;
}

interface AccessibleCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  ariaLabel?: string;
  reducedMotion?: boolean;
}

export function AccessibleCarousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className,
  ariaLabel = "Content carousel",
  reducedMotion = false
}: AccessibleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Respect user's motion preferences
  const prefersReducedMotion = reducedMotion || 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const goToSlide = useCallback((index: number, focus = false) => {
    setCurrentIndex(index);
    setUserHasInteracted(true);
    
    if (focus && itemRefs.current[index]) {
      // Focus the slide for screen readers
      itemRefs.current[index]?.focus();
    }
  }, []);

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    goToSlide(nextIndex, true);
  }, [currentIndex, items.length, goToSlide]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    goToSlide(prevIndex, true);
  }, [currentIndex, items.length, goToSlide]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    setUserHasInteracted(true);
  }, [isPlaying]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !userHasInteracted && !prefersReducedMotion) {
      intervalRef.current = setInterval(goToNext, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, userHasInteracted, prefersReducedMotion, goToNext, autoPlayInterval]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
      case 'Home':
        event.preventDefault();
        goToSlide(0, true);
        break;
      case 'End':
        event.preventDefault();
        goToSlide(items.length - 1, true);
        break;
      case ' ':
      case 'Enter':
        if (event.target === carouselRef.current) {
          event.preventDefault();
          togglePlayPause();
        }
        break;
    }
  }, [goToPrevious, goToNext, goToSlide, items.length, togglePlayPause]);

  // Pause on hover/focus for accessibility
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !userHasInteracted && !prefersReducedMotion) {
      intervalRef.current = setInterval(goToNext, autoPlayInterval);
    }
  };

  if (items.length === 0) {
    return null;
  }

  // Progressive enhancement: Show all items if JavaScript is disabled
  return (
    <div className={cn("relative", className)}>
      {/* Screen reader announcement for current slide */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        Slide {currentIndex + 1} of {items.length}
        {items[currentIndex].title && `: ${items[currentIndex].title}`}
      </div>

      {/* Main carousel container */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        role="region"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Carousel track */}
        <div 
          className={cn(
            "flex transition-transform duration-300 ease-in-out",
            prefersReducedMotion && "transition-none"
          )}
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${items.length * 100}%`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={el => itemRefs.current[index] = el}
              className="w-full flex-shrink-0 focus:outline-none"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${items.length}${item.title ? `: ${item.title}` : ''}`}
              tabIndex={index === currentIndex ? 0 : -1}
            >
              {item.content}
            </div>
          ))}
        </div>

        {/* Navigation controls */}
        {showControls && items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Play/Pause control */}
            {autoPlay && (
              <button
                onClick={togglePlayPause}
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}
          </>
        )}
      </div>

      {/* Slide indicators */}
      {showIndicators && items.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2" role="tablist" aria-label="Carousel slides">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index, true)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2",
                index === currentIndex
                  ? "bg-slate-900"
                  : "bg-slate-300 hover:bg-slate-400"
              )}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1}${item.title ? `: ${item.title}` : ''}`}
              tabIndex={index === currentIndex ? 0 : -1}
            />
          ))}
        </div>
      )}

      {/* Alternative list view for users who prefer it */}
      <details className="mt-4">
        <summary className="text-sm text-slate-600 cursor-pointer hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded">
          View all items as list
        </summary>
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={`list-${item.id}`}
              onClick={() => goToSlide(index, true)}
              className={cn(
                "w-full text-left p-2 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500",
                index === currentIndex
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.title || `Item ${index + 1}`}
              {item.description && (
                <div className="text-xs text-slate-500 mt-1">{item.description}</div>
              )}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}