import { X, Command, Search, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: 'global' | 'navigation' | 'actions';
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts: Shortcut[] = [
    // Global
    { keys: ['⌘', 'K'], description: 'Open command palette', category: 'global' },
    { keys: ['⌘', '/'], description: 'Show keyboard shortcuts', category: 'global' },
    { keys: ['Esc'], description: 'Close modals and dialogs', category: 'global' },

    // Navigation (with command palette)
    { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'navigation' },
    { keys: ['G', 'C'], description: 'Go to Clients', category: 'navigation' },
    { keys: ['G', 'R'], description: 'Go to Reports', category: 'navigation' },
    { keys: ['G', 'P'], description: 'Go to Playbooks', category: 'navigation' },
    { keys: ['G', 'I'], description: 'Go to Integrations', category: 'navigation' },

    // Actions
    { keys: ['N'], description: 'Create new (when on list pages)', category: 'actions' },
    { keys: ['S'], description: 'Focus search field', category: 'actions' },
    { keys: ['/'], description: 'Focus search field (alternative)', category: 'actions' }
  ];

  const groupedShortcuts = {
    global: shortcuts.filter(s => s.category === 'global'),
    navigation: shortcuts.filter(s => s.category === 'navigation'),
    actions: shortcuts.filter(s => s.category === 'actions')
  };

  if (!isOpen) return null;

  const renderKey = (key: string) => {
    const specialKeys: Record<string, React.ReactNode> = {
      '⌘': <Command className="w-3 h-3" />,
      'Esc': 'Esc',
      '↑': <ArrowUp className="w-3 h-3" />,
      '↓': <ArrowDown className="w-3 h-3" />,
      '↵': <CornerDownLeft className="w-3 h-3" />,
      '/': <Search className="w-3 h-3" />
    };

    return (
      <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700">
        {specialKeys[key] || key}
      </kbd>
    );
  };

  const renderShortcutGroup = (title: string, shortcuts: Shortcut[]) => (
    <div className="mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-700">{shortcut.description}</span>
            <div className="flex items-center space-x-1">
              {shortcut.keys.map((key, keyIndex) => (
                <span key={keyIndex} className="flex items-center">
                  {renderKey(key)}
                  {keyIndex < shortcut.keys.length - 1 && (
                    <span className="mx-1 text-slate-400">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Command className="w-5 h-5 text-blue-600" />
                <span>Keyboard Shortcuts</span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Work faster with keyboard shortcuts
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-white"
              aria-label="Close shortcuts modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {renderShortcutGroup('Global', groupedShortcuts.global)}
            {renderShortcutGroup('Navigation', groupedShortcuts.navigation)}
            {renderShortcutGroup('Actions', groupedShortcuts.actions)}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-slate-600">
                <Command className="w-4 h-4" />
                <span>Command palette accessible from anywhere</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-500">
                <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">⌘/</kbd>
                <span>to reopen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
