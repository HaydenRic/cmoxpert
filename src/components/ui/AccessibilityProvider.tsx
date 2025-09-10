import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  autoPlay: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReader: false,
  keyboardNavigation: false,
  autoPlay: true
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {
        // Use defaults if parsing fails
      }
    }

    // Detect system preferences
    const detectSystemPreferences = () => {
      const updates: Partial<AccessibilitySettings> = {};

      // Reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updates.reducedMotion = true;
      }

      // High contrast (Windows)
      if (window.matchMedia('(forced-colors: active)').matches) {
        updates.highContrast = true;
      }

      // Screen reader detection (heuristic)
      if (navigator.userAgent.includes('NVDA') || 
          navigator.userAgent.includes('JAWS') || 
          navigator.userAgent.includes('VoiceOver')) {
        updates.screenReader = true;
      }

      // Keyboard navigation preference
      const hasKeyboardNavigation = !window.matchMedia('(pointer: fine)').matches;
      if (hasKeyboardNavigation) {
        updates.keyboardNavigation = true;
      }

      if (Object.keys(updates).length > 0) {
        setSettings(prev => ({ ...prev, ...updates }));
      }
    };

    detectSystemPreferences();

    // Listen for preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(forced-colors: active)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      updateSetting('reducedMotion', e.matches);
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      updateSetting('highContrast', e.matches);
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));

    // Apply CSS classes to document
    applyAccessibilityClasses(newSettings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    applyAccessibilityClasses(defaultSettings);
  };

  // Apply accessibility classes to document
  const applyAccessibilityClasses = (settings: AccessibilitySettings) => {
    const { documentElement } = document;
    
    // Reduced motion
    documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
    
    // High contrast
    documentElement.classList.toggle('high-contrast', settings.highContrast);
    
    // Large text
    documentElement.classList.toggle('large-text', settings.largeText);
    
    // Screen reader optimizations
    documentElement.classList.toggle('screen-reader', settings.screenReader);
    
    // Keyboard navigation
    documentElement.classList.toggle('keyboard-nav', settings.keyboardNavigation);
  };

  useEffect(() => {
    applyAccessibilityClasses(settings);
  }, [settings]);

  const value = {
    settings,
    updateSetting,
    resetSettings
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Accessibility settings panel
export function AccessibilitySettings() {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-slate-200">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Accessibility Settings
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Customize your experience to better suit your needs and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">Reduce Motion</div>
            <div className="text-sm text-slate-600">
              Minimize animations and transitions
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
        </label>

        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">High Contrast</div>
            <div className="text-sm text-slate-600">
              Increase color contrast for better visibility
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => updateSetting('highContrast', e.target.checked)}
            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
        </label>

        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">Large Text</div>
            <div className="text-sm text-slate-600">
              Increase text size for better readability
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.largeText}
            onChange={(e) => updateSetting('largeText', e.target.checked)}
            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
        </label>

        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">Disable Auto-play</div>
            <div className="text-sm text-slate-600">
              Prevent videos and carousels from auto-playing
            </div>
          </div>
          <input
            type="checkbox"
            checked={!settings.autoPlay}
            onChange={(e) => updateSetting('autoPlay', !e.target.checked)}
            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
        </label>

        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">Keyboard Navigation</div>
            <div className="text-sm text-slate-600">
              Optimize interface for keyboard-only navigation
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.keyboardNavigation}
            onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
        </label>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={resetSettings}
          className="text-sm text-slate-600 hover:text-slate-900 underline focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}