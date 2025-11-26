import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Eye,
  BarChart3,
  Plug,
  Settings,
  Plus,
  Zap,
  TrendingUp,
  GitBranch,
  PoundSterling,
  Globe,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'navigation' | 'actions' | 'settings';
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Go to dashboard',
      icon: Home,
      category: 'navigation',
      action: () => navigate('/dashboard'),
      keywords: ['home', 'overview']
    },
    {
      id: 'nav-clients',
      label: 'Clients',
      description: 'View all clients',
      icon: Users,
      category: 'navigation',
      action: () => navigate('/clients')
    },
    {
      id: 'nav-reports',
      label: 'Reports',
      description: 'View all reports',
      icon: FileText,
      category: 'navigation',
      action: () => navigate('/reports')
    },
    {
      id: 'nav-content',
      label: 'Content Hub',
      description: 'AI content generation',
      icon: Sparkles,
      category: 'navigation',
      action: () => navigate('/content'),
      keywords: ['ai', 'generate', 'blog', 'social']
    },
    {
      id: 'nav-playbooks',
      label: 'Playbooks',
      description: 'Marketing strategies',
      icon: BookOpen,
      category: 'navigation',
      action: () => navigate('/playbooks'),
      keywords: ['strategy', 'tactics', 'ai']
    },
    {
      id: 'nav-research',
      label: 'Research',
      description: 'Competitive intelligence',
      icon: Eye,
      category: 'navigation',
      action: () => navigate('/competitive-intelligence'),
      keywords: ['competitive', 'intelligence', 'analysis']
    },
    {
      id: 'nav-performance',
      label: 'Performance',
      description: 'Analytics and metrics',
      icon: BarChart3,
      category: 'navigation',
      action: () => navigate('/performance'),
      keywords: ['analytics', 'metrics', 'data']
    },
    {
      id: 'nav-attribution',
      label: 'Attribution',
      description: 'Revenue attribution',
      icon: PoundSterling,
      category: 'navigation',
      action: () => navigate('/revenue-attribution'),
      keywords: ['revenue', 'roi', 'tracking']
    },
    {
      id: 'nav-forecasting',
      label: 'Forecasting',
      description: 'Predictive analytics',
      icon: TrendingUp,
      category: 'navigation',
      action: () => navigate('/forecasting'),
      keywords: ['predict', 'forecast', 'trends']
    },
    {
      id: 'nav-integrations',
      label: 'Integrations',
      description: 'Connect your tools',
      icon: Plug,
      category: 'navigation',
      action: () => navigate('/integrations'),
      keywords: ['connect', 'sync', 'oauth']
    },
    {
      id: 'nav-workflows',
      label: 'Workflows',
      description: 'Automation workflows',
      icon: GitBranch,
      category: 'navigation',
      action: () => navigate('/workflows'),
      keywords: ['automation', 'process']
    },
    {
      id: 'nav-portal',
      label: 'Client Portal',
      description: 'Client self-service',
      icon: Globe,
      category: 'navigation',
      action: () => navigate('/client-portal'),
      keywords: ['client', 'access']
    },

    // Actions
    {
      id: 'action-new-client',
      label: 'Create New Client',
      description: 'Add a new client to your portfolio',
      icon: Plus,
      category: 'actions',
      action: () => navigate('/clients?action=new'),
      keywords: ['add', 'create', 'new']
    },
    {
      id: 'action-generate-content',
      label: 'Generate Content',
      description: 'Create marketing content with AI',
      icon: Sparkles,
      category: 'actions',
      action: () => navigate('/content'),
      keywords: ['create', 'ai', 'write']
    },
    {
      id: 'action-generate-playbook',
      label: 'Generate Playbook',
      description: 'Create marketing strategy',
      icon: BookOpen,
      category: 'actions',
      action: () => navigate('/playbooks'),
      keywords: ['create', 'strategy', 'ai']
    },
    {
      id: 'action-sync-integrations',
      label: 'Sync Integrations',
      description: 'Refresh data from integrations',
      icon: Zap,
      category: 'actions',
      action: () => navigate('/integrations'),
      keywords: ['refresh', 'update', 'sync']
    },

    // Settings
    {
      id: 'settings-general',
      label: 'Settings',
      description: 'Account settings',
      icon: Settings,
      category: 'settings',
      action: () => navigate('/settings')
    },
    ...(isAdmin ? [{
      id: 'settings-admin',
      label: 'Admin Panel',
      description: 'System administration',
      icon: Shield,
      category: 'settings' as const,
      action: () => navigate('/admin'),
      keywords: ['admin', 'configuration', 'api']
    }] : [])
  ];

  const filteredCommands = commands.filter(command => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    const matchesLabel = command.label.toLowerCase().includes(searchLower);
    const matchesDescription = command.description?.toLowerCase().includes(searchLower);
    const matchesKeywords = command.keywords?.some(k => k.toLowerCase().includes(searchLower));

    return matchesLabel || matchesDescription || matchesKeywords;
  });

  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    actions: filteredCommands.filter(c => c.category === 'actions'),
    settings: filteredCommands.filter(c => c.category === 'settings')
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  const renderCommandGroup = (title: string, commands: Command[], startIndex: number) => {
    if (commands.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
        <div className="space-y-1">
          {commands.map((command, localIndex) => {
            const globalIndex = startIndex + localIndex;
            const isSelected = globalIndex === selectedIndex;
            const Icon = command.icon;

            return (
              <button
                key={command.id}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors ${
                  isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{command.label}</div>
                  {command.description && (
                    <div className="text-xs text-slate-500 truncate">{command.description}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  let currentIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-slate-200">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands or navigate..."
              className="flex-1 text-slate-900 placeholder-slate-400 outline-none"
            />
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <>
                {renderCommandGroup('Navigation', groupedCommands.navigation, currentIndex)}
                {(currentIndex += groupedCommands.navigation.length) && ''}
                {renderCommandGroup('Actions', groupedCommands.actions, currentIndex)}
                {(currentIndex += groupedCommands.actions.length) && ''}
                {renderCommandGroup('Settings', groupedCommands.settings, currentIndex)}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-slate-500">
                No commands found for "{search}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs">↵</kbd>
                <span>Select</span>
              </span>
            </div>
            <span>Cmd+K to toggle</span>
          </div>
        </div>
      </div>
    </>
  );
}
