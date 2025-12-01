import { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Check, AlertCircle, DollarSign, Clock, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { PlaybookTactic } from '../lib/playbookTemplates';
import clsx from 'clsx';

interface PlaybookBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialTactics: PlaybookTactic[];
  playbookName: string;
  onSave: (tactics: PlaybookTactic[], metadata: PlaybookMetadata) => void;
}

interface PlaybookMetadata {
  name: string;
  category: string;
  estimatedBudget: string;
  timeline: string;
}

export function PlaybookBuilder({ isOpen, onClose, initialTactics, playbookName, onSave }: PlaybookBuilderProps) {
  const [tactics, setTactics] = useState<PlaybookTactic[]>(initialTactics);
  const [metadata, setMetadata] = useState<PlaybookMetadata>({
    name: playbookName,
    category: 'growth-strategy',
    estimatedBudget: '',
    timeline: ''
  });
  const [expandedTactics, setExpandedTactics] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleTacticExpanded = (tacticId: string) => {
    const newExpanded = new Set(expandedTactics);
    if (newExpanded.has(tacticId)) {
      newExpanded.delete(tacticId);
    } else {
      newExpanded.add(tacticId);
    }
    setExpandedTactics(newExpanded);
  };

  const toggleTacticCompleted = (tacticId: string) => {
    setTactics(tactics.map(t =>
      t.id === tacticId ? { ...t, completed: !t.completed } : t
    ));
  };

  const updateTactic = (tacticId: string, updates: Partial<PlaybookTactic>) => {
    setTactics(tactics.map(t =>
      t.id === tacticId ? { ...t, ...updates } : t
    ));
  };

  const deleteTactic = (tacticId: string) => {
    if (confirm('Remove this tactic from the playbook?')) {
      setTactics(tactics.filter(t => t.id !== tacticId));
    }
  };

  const addNewTactic = () => {
    const newTactic: PlaybookTactic = {
      id: `custom-${Date.now()}`,
      title: 'New Tactic',
      description: 'Add description...',
      priority: 'medium',
      estimatedCost: '$0',
      timeframe: '1-2 weeks',
      kpis: ['Add KPI'],
      implementation: ['Add step'],
      completed: false
    };
    setTactics([...tactics, newTactic]);
    setExpandedTactics(new Set([...expandedTactics, newTactic.id]));
  };

  const handleSave = () => {
    onSave(tactics, metadata);
    onClose();
  };

  const completedCount = tactics.filter(t => t.completed).length;
  const totalCount = tactics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const highPriority = tactics.filter(t => t.priority === 'high' && !t.completed).length;
  const totalBudget = tactics.reduce((sum, t) => {
    const cost = parseInt(t.estimatedCost.replace(/[^0-9]/g, '')) || 0;
    return sum + cost;
  }, 0);

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
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={metadata.name}
                  onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                  className="text-xl font-bold text-slate-900 bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  placeholder="Playbook Name"
                />
                <p className="text-sm text-slate-600 mt-1 px-2">
                  Customize tactics, set priorities, and track progress
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-white"
                aria-label="Close builder"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Progress</span>
                <span className="text-slate-600">{completedCount} of {totalCount} tactics completed</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center space-x-2 text-red-600 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">High Priority</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{highPriority}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center space-x-2 text-green-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-semibold">Est. Budget</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">${(totalBudget / 1000).toFixed(0)}k</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center space-x-2 text-blue-600 mb-1">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-semibold">Complete</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{progressPercent}%</p>
              </div>
            </div>
          </div>

          {/* Tactics List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3 mb-4">
              {tactics.map((tactic, index) => {
                const isExpanded = expandedTactics.has(tactic.id);
                return (
                  <div
                    key={tactic.id}
                    className={clsx(
                      'border-2 rounded-lg transition-all',
                      tactic.completed ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white',
                      'hover:shadow-md'
                    )}
                  >
                    {/* Tactic Header */}
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Drag Handle */}
                        <button className="text-slate-400 hover:text-slate-600 cursor-move mt-1">
                          <GripVertical className="w-5 h-5" />
                        </button>

                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTacticCompleted(tactic.id)}
                          className={clsx(
                            'w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all mt-1',
                            tactic.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-slate-300 hover:border-green-500'
                          )}
                        >
                          {tactic.completed && <Check className="w-4 h-4 text-white" />}
                        </button>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={tactic.title}
                                onChange={(e) => updateTactic(tactic.id, { title: e.target.value })}
                                className={clsx(
                                  'font-semibold text-slate-900 bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-blue-500 rounded px-2 py-1',
                                  tactic.completed && 'line-through text-slate-500'
                                )}
                              />
                              <textarea
                                value={tactic.description}
                                onChange={(e) => updateTactic(tactic.id, { description: e.target.value })}
                                className="text-sm text-slate-600 bg-transparent border-none outline-none w-full focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 mt-1"
                                rows={2}
                              />
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              {/* Priority Badge */}
                              <select
                                value={tactic.priority}
                                onChange={(e) => updateTactic(tactic.id, { priority: e.target.value as 'high' | 'medium' | 'low' })}
                                className={clsx(
                                  'text-xs font-semibold px-2 py-1 rounded-full border-none outline-none cursor-pointer',
                                  tactic.priority === 'high' && 'bg-red-100 text-red-700',
                                  tactic.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                                  tactic.priority === 'low' && 'bg-green-100 text-green-700'
                                )}
                              >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>

                              {/* Expand/Collapse */}
                              <button
                                onClick={() => toggleTacticExpanded(tactic.id)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => deleteTactic(tactic.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center space-x-4 text-xs text-slate-600">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <input
                                type="text"
                                value={tactic.estimatedCost}
                                onChange={(e) => updateTactic(tactic.id, { estimatedCost: e.target.value })}
                                className="w-24 bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                              />
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <input
                                type="text"
                                value={tactic.timeframe}
                                onChange={(e) => updateTactic(tactic.id, { timeframe: e.target.value })}
                                className="w-24 bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                              />
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                              {/* KPIs */}
                              <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Key Metrics (KPIs)</label>
                                <div className="space-y-1">
                                  {tactic.kpis.map((kpi, idx) => (
                                    <input
                                      key={idx}
                                      type="text"
                                      value={kpi}
                                      onChange={(e) => {
                                        const newKpis = [...tactic.kpis];
                                        newKpis[idx] = e.target.value;
                                        updateTactic(tactic.id, { kpis: newKpis });
                                      }}
                                      className="w-full text-sm px-3 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Implementation Steps */}
                              <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Implementation Steps</label>
                                <div className="space-y-1">
                                  {tactic.implementation.map((step, idx) => (
                                    <div key={idx} className="flex items-start space-x-2">
                                      <span className="text-xs text-slate-500 mt-1">{idx + 1}.</span>
                                      <input
                                        type="text"
                                        value={step}
                                        onChange={(e) => {
                                          const newSteps = [...tactic.implementation];
                                          newSteps[idx] = e.target.value;
                                          updateTactic(tactic.id, { implementation: newSteps });
                                        }}
                                        className="flex-1 text-sm px-3 py-1 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Tactic Button */}
            <button
              onClick={addNewTactic}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Custom Tactic</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium flex items-center space-x-2 shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Playbook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
