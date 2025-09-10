import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface AccessibleTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  value?: string;
  onChange?: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  tabListClassName?: string;
  tabPanelClassName?: string;
  lazy?: boolean;
}

export function AccessibleTabs({
  tabs,
  defaultTab,
  value,
  onChange,
  orientation = 'horizontal',
  variant = 'default',
  className,
  tabListClassName,
  tabPanelClassName,
  lazy = false
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = useState(value || defaultTab || tabs[0]?.id);
  const [loadedTabs, setLoadedTabs] = useState(new Set([activeTab]));
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Controlled vs uncontrolled
  const currentTab = value !== undefined ? value : activeTab;

  const handleTabChange = useCallback((tabId: string) => {
    if (onChange) {
      onChange(tabId);
    } else {
      setActiveTab(tabId);
    }
    
    // Mark tab as loaded for lazy loading
    if (lazy) {
      setLoadedTabs(prev => new Set([...prev, tabId]));
    }
  }, [onChange, lazy]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, tabId: string, index: number) => {
    let targetIndex = index;

    switch (event.key) {
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault();
          targetIndex = index > 0 ? index - 1 : tabs.length - 1;
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault();
          targetIndex = index < tabs.length - 1 ? index + 1 : 0;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault();
          targetIndex = index > 0 ? index - 1 : tabs.length - 1;
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault();
          targetIndex = index < tabs.length - 1 ? index + 1 : 0;
        }
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!tabs[index].disabled) {
          handleTabChange(tabId);
        }
        return;
      default:
        return;
    }

    // Find next non-disabled tab
    while (tabs[targetIndex]?.disabled) {
      if (orientation === 'horizontal') {
        targetIndex = event.key === 'ArrowLeft' 
          ? (targetIndex > 0 ? targetIndex - 1 : tabs.length - 1)
          : (targetIndex < tabs.length - 1 ? targetIndex + 1 : 0);
      } else {
        targetIndex = event.key === 'ArrowUp'
          ? (targetIndex > 0 ? targetIndex - 1 : tabs.length - 1)
          : (targetIndex < tabs.length - 1 ? targetIndex + 1 : 0);
      }
    }

    tabRefs.current[targetIndex]?.focus();
  }, [orientation, tabs, handleTabChange]);

  const getVariantClasses = (isActive: boolean, disabled: boolean) => {
    const baseClasses = "relative px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2";
    
    if (disabled) {
      return cn(baseClasses, "text-slate-400 cursor-not-allowed");
    }

    switch (variant) {
      case 'pills':
        return cn(
          baseClasses,
          "rounded-lg",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        );
      case 'underline':
        return cn(
          baseClasses,
          "border-b-2 rounded-none",
          isActive
            ? "border-slate-900 text-slate-900"
            : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
        );
      default:
        return cn(
          baseClasses,
          "border border-slate-200 rounded-t-lg",
          isActive
            ? "bg-white text-slate-900 border-b-white -mb-px"
            : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        );
    }
  };

  const currentTabData = tabs.find(tab => tab.id === currentTab);

  return (
    <div className={cn("w-full", className)}>
      {/* Tab list */}
      <div
        ref={tabListRef}
        className={cn(
          "flex",
          orientation === 'vertical' ? "flex-col space-y-1" : "space-x-1",
          variant === 'underline' && "border-b border-slate-200",
          tabListClassName
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === currentTab;
          
          return (
            <button
              key={tab.id}
              ref={el => tabRefs.current[index] = el}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
              className={getVariantClasses(isActive, !!tab.disabled)}
            >
              <div className="flex items-center space-x-2">
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-2 bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="mt-4">
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab;
          const shouldRender = !lazy || loadedTabs.has(tab.id) || isActive;

          return (
            <div
              key={tab.id}
              id={`panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab.id}`}
              tabIndex={0}
              className={cn(
                tabPanelClassName,
                !isActive && "hidden",
                "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-lg"
              )}
            >
              {shouldRender ? tab.content : (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm">Loading content...</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite">
        {currentTabData && `Currently viewing ${currentTabData.label} tab`}
      </div>
    </div>
  );
}

// Hook for managing tab state
export function useAccessibleTabs(tabs: TabItem[], defaultTab?: string) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const goToTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
    }
  }, [tabs]);

  const goToNext = useCallback(() => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    let nextIndex = (currentIndex + 1) % tabs.length;
    
    // Skip disabled tabs
    while (tabs[nextIndex]?.disabled && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % tabs.length;
    }
    
    if (!tabs[nextIndex]?.disabled) {
      setActiveTab(tabs[nextIndex].id);
    }
  }, [tabs, activeTab]);

  const goToPrevious = useCallback(() => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    let prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    
    // Skip disabled tabs
    while (tabs[prevIndex]?.disabled && prevIndex !== currentIndex) {
      prevIndex = prevIndex > 0 ? prevIndex - 1 : tabs.length - 1;
    }
    
    if (!tabs[prevIndex]?.disabled) {
      setActiveTab(tabs[prevIndex].id);
    }
  }, [tabs, activeTab]);

  return {
    activeTab,
    goToTab,
    goToNext,
    goToPrevious
  };
}