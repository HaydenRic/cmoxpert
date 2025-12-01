import { useState } from 'react';
import { X, Search, TrendingUp, Target, Star, FileText, BarChart3, Users, ChevronRight, Clock, DollarSign, TrendingUpIcon } from 'lucide-react';
import { playbookTemplates, PlaybookTemplate, getCategoryCounts } from '../lib/playbookTemplates';
import clsx from 'clsx';

interface PlaybookTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PlaybookTemplate) => void;
}

const categoryInfo = {
  'growth-strategy': { icon: TrendingUp, label: 'Growth Strategy', color: 'blue' },
  'demand-generation': { icon: Target, label: 'Demand Generation', color: 'orange' },
  'brand-positioning': { icon: Star, label: 'Brand Positioning', color: 'yellow' },
  'content-marketing': { icon: FileText, label: 'Content Marketing', color: 'purple' },
  'competitive-analysis': { icon: BarChart3, label: 'Competitive Analysis', color: 'red' },
  'customer-retention': { icon: Users, label: 'Customer Retention', color: 'green' }
};

export function PlaybookTemplateModal({ isOpen, onClose, onSelectTemplate }: PlaybookTemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categoryCounts = getCategoryCounts();

  const filteredTemplates = playbookTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.industry?.some(ind => ind.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: PlaybookTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 z-50 overflow-hidden">
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                <span>Playbook Templates</span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {playbookTemplates.length} proven marketing playbooks with detailed tactics
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-white"
              aria-label="Close templates modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search playbooks by name, industry, or tactics..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Category Sidebar */}
            <div className="w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto">
              <div className="p-4 space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between',
                    selectedCategory === 'all'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-white'
                  )}
                >
                  <span>All Playbooks</span>
                  <span className="text-sm font-semibold">{playbookTemplates.length}</span>
                </button>

                {Object.entries(categoryInfo).map(([key, info]) => {
                  const Icon = info.icon;
                  const count = categoryCounts[key as keyof typeof categoryCounts];
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={clsx(
                        'w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between',
                        selectedCategory === key
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-slate-700 hover:bg-white'
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{info.label}</span>
                      </div>
                      <span className="text-sm font-semibold">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => {
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="text-left bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all group"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{template.icon}</div>
                            <div>
                              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {template.name}
                              </h3>
                              {template.industry && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {template.industry.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 mb-4">
                          {template.description}
                        </p>

                        {/* Tactics Count */}
                        <div className="flex items-center space-x-4 mb-4 text-xs text-slate-600">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{template.tactics.length} tactics</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{template.timeline}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{template.estimatedBudget}</span>
                          </div>
                        </div>

                        {/* Key Tactics Preview */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Key Tactics:</p>
                          {template.tactics.slice(0, 3).map((tactic, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <div className={clsx(
                                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                                tactic.priority === 'high' ? 'bg-red-100 text-red-700' :
                                tactic.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              )}>
                                {idx + 1}
                              </div>
                              <p className="text-xs text-slate-700 leading-tight">{tactic.title}</p>
                            </div>
                          ))}
                          {template.tactics.length > 3 && (
                            <p className="text-xs text-slate-500 italic pl-7">
                              +{template.tactics.length - 3} more tactics
                            </p>
                          )}
                        </div>

                        {/* Expected ROI Badge */}
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            <span>Expected ROI: {template.expectedROI}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No playbooks found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Select a playbook to customize for your client</span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Skip templates
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
