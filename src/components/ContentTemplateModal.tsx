import { useState } from 'react';
import { X, Search, FileText, MessageSquare, Mail, Target, Globe, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { contentTemplates, ContentTemplate, getCategoryCounts } from '../lib/contentTemplates';
import clsx from 'clsx';

interface ContentTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContentTemplate) => void;
}

const categoryInfo = {
  blog: { icon: FileText, label: 'Blog Posts', color: 'blue' },
  social: { icon: MessageSquare, label: 'Social Media', color: 'purple' },
  email: { icon: Mail, label: 'Email', color: 'green' },
  ad: { icon: Target, label: 'Ads', color: 'orange' },
  landing: { icon: Globe, label: 'Landing Pages', color: 'cyan' },
  press: { icon: BookOpen, label: 'Press Releases', color: 'slate' }
};

export function ContentTemplateModal({ isOpen, onClose, onSelectTemplate }: ContentTemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categoryCounts = getCategoryCounts();

  const filteredTemplates = contentTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: ContentTemplate) => {
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
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Content Templates</span>
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {contentTemplates.length} professional templates to jumpstart your content
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
                placeholder="Search templates..."
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
                  <span>All Templates</span>
                  <span className="text-sm font-semibold">{contentTemplates.length}</span>
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
                          ? `bg-${info.color}-100 text-${info.color}-700 font-medium`
                          : 'text-slate-700 hover:bg-white'
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{info.label}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => {
                    const categoryColor = categoryInfo[template.category].color;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="text-left bg-white border-2 border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{template.icon}</div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={`px-2 py-1 bg-${categoryColor}-100 text-${categoryColor}-700 rounded-full font-medium`}>
                            {template.tone}
                          </span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                            {template.length}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No templates found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Select a template to pre-fill the content form</span>
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
