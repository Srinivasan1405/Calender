import React, { useState, useEffect } from 'react';
import { goalsAPI } from '../utils/api';
import { checkGrammar } from '../utils/grammarCheck';
import { getSuggestions } from '../utils/goalSuggestions';

const Goals = () => {
  const [yearlyGoals, setYearlyGoals] = useState([]);
  const [monthlyGoals, setMonthlyGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    type: 'monthly',
    title: '',
    description: '',
    progress: 0,
    status: 'not_started',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState({ type: 'monthly', titles: '', description: '' });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkGrammarHints, setBulkGrammarHints] = useState([]);
  const [addingSuggestions, setAddingSuggestions] = useState({ monthly: null, yearly: null });
  const [edditingSuggestionText, setEditingSuggestionText] = useState({});

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await goalsAPI.getGoals();
      setYearlyGoals(res.data.filter(g => g.type === 'yearly'));
      setMonthlyGoals(res.data.filter(g => g.type === 'monthly'));
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingGoal) {
        await goalsAPI.updateGoal(editingGoal._id, formData);
      } else {
        await goalsAPI.createGoal(formData);
      }
      await fetchGoals();
      resetForm();
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await goalsAPI.deleteGoal(id);
        await fetchGoals();
      } catch (err) {
        console.error('Error deleting goal:', err);
      }
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      type: goal.type,
      title: goal.title,
      description: goal.description || '',
      progress: goal.progress,
      status: goal.status,
      deadline: goal.deadline ? goal.deadline.split('T')[0] : ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingGoal(null);
    setFormData({
      type: 'monthly',
      title: '',
      description: '',
      progress: 0,
      status: 'not_started',
      deadline: ''
    });
  };

  const updateProgress = async (goal, newProgress) => {
    try {
      await goalsAPI.updateGoal(goal._id, {
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started'
      });
      await fetchGoals();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const titles = bulkData.titles.split('\n').map(t => t.trim()).filter(t => t);
    if (titles.length === 0) return;
    setBulkLoading(true);
    try {
      await goalsAPI.createBulkGoals({
        type: bulkData.type,
        titles,
        description: bulkData.description,
      });
      setShowBulkModal(false);
      setBulkData({ type: 'monthly', titles: '', description: '' });
      setBulkGrammarHints([]);
      await fetchGoals();
    } catch (err) {
      console.error('Error creating bulk goals:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    const hints = checkGrammar(bulkData.description);
    setBulkGrammarHints(hints);
  }, [bulkData.description]);

  const handleGrammarFix = (suggestion) => {
    const wrong = suggestion.word;
    const correction = suggestion.correction.split(' (')[0];
    setBulkData(prev => ({ ...prev, description: prev.description.replace(wrong, correction) }));
  };

  const addSuggestion = async (type, title) => {
    const key = type;
    setAddingSuggestions(prev => ({ ...prev, [key]: title }));
    try {
      await goalsAPI.createGoal({ type, title, status: 'not_started', progress: 0 });
      await fetchGoals();
    } catch (err) {
      console.error('Error adding suggestion:', err);
    } finally {
      setAddingSuggestions(prev => ({ ...prev, [key]: null }));
    }
  };

  const SuggestionCard = ({ type, title }) => {
    const isAdding = addingSuggestions[type] === title;
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-themed-subtle hover:bg-themed-elevated transition-all group">
        <span className="text-sm text-themed-primary flex-1 truncate">{title}</span>
        <button
          onClick={() => addSuggestion(type, title)}
          disabled={isAdding}
          className="px-3 py-1 text-xs font-medium text-accent rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50 flex-shrink-0" style={{ background: 'var(--overlay-active)' }}
        >
          {isAdding ? '...' : '+ Add'}
        </button>
      </div>
    );
  };

  const GoalCard = ({ goal }) => (
    <div className="card-modern p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-themed-primary">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-themed-secondary mt-1">{goal.description}</p>
          )}
        </div>
        <span className={`badge ${
          goal.status === 'completed' ? 'badge-success' :
          goal.status === 'in_progress' ? 'badge-primary' : 'badge-warning'
        }`}>
          {goal.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-themed-secondary">Progress</span>
          <span className="font-semibold text-themed-primary">{goal.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${goal.progress}%`,
              background: goal.progress >= 80
                ? 'linear-gradient(to right, var(--success), #34d399)'
                : goal.progress >= 50
                ? 'linear-gradient(to right, var(--primary), var(--primary-light))'
                : 'linear-gradient(to right, var(--text-muted), var(--text-secondary))'
            }}
          ></div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => updateProgress(goal, Math.max(0, goal.progress - 10))}
          className="px-3 py-1.5 text-sm bg-themed-elevated rounded-xl hover:bg-white/20 transition-colors text-themed-primary"
        >
          -10%
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={goal.progress}
          onChange={(e) => updateProgress(goal, parseInt(e.target.value))}
          className="flex-1 accent-violet-500"
        />
        <button
          onClick={() => updateProgress(goal, Math.min(100, goal.progress + 10))}
          className="px-3 py-1.5 text-sm bg-themed-elevated rounded-xl hover:bg-white/20 transition-colors text-themed-primary"
        >
          +10%
        </button>
      </div>
      {goal.deadline && (
        <p className="text-xs text-themed-muted mt-3">Due: {new Date(goal.deadline).toLocaleDateString()}</p>
      )}
      <div className="flex gap-3 mt-4 pt-4 border-t border-themed">
        <button
          onClick={() => handleEdit(goal)}
          className="text-sm text-accent font-medium hover:opacity-80"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(goal._id)}
          className="text-sm text-red-400 hover:text-red-300 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-themed-primary">Goals</h1>
          <p className="text-themed-secondary text-sm sm:text-base">Track your milestones</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setShowBulkModal(true)} className="btn-secondary text-sm sm:text-base py-2.5 px-4 sm:py-3 sm:px-6 flex-1 sm:flex-none">
            + Bulk Add
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm sm:text-base py-2.5 px-4 sm:py-3 sm:px-6 flex-1 sm:flex-none">
            + Add Goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-themed-primary flex items-center gap-2">
            🎯 Monthly Goals
          </h2>
          {monthlyGoals.length > 0 ? (
            monthlyGoals.map(goal => <GoalCard key={goal._id} goal={goal} />)
          ) : (
            <div className="card-modern p-5">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-themed-secondary font-medium">No monthly goals yet</p>
                <p className="text-themed-muted text-sm mt-1">Quick-add some suggestions below</p>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-hide px-1">
                {getSuggestions('monthly').slice(0, 8).map((title, i) => (
                  <SuggestionCard key={i} type="monthly" title={title} />
                ))}
              </div>
              <div className="text-center mt-4 pt-3 border-t border-themed">
                <button onClick={() => { setFormData({ ...formData, type: 'monthly' }); setShowAddModal(true); }} className="text-accent text-sm font-medium hover:opacity-80">
                  Or create your own →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-themed-primary flex items-center gap-2">
            🏆 Yearly Goals
          </h2>
          {yearlyGoals.length > 0 ? (
            yearlyGoals.map(goal => <GoalCard key={goal._id} goal={goal} />)
          ) : (
            <div className="card-modern p-5">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-themed-secondary font-medium">No yearly goals yet</p>
                <p className="text-themed-muted text-sm mt-1">Quick-add some suggestions below</p>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-hide px-1">
                {getSuggestions('yearly').slice(0, 8).map((title, i) => (
                  <SuggestionCard key={i} type="yearly" title={title} />
                ))}
              </div>
              <div className="text-center mt-4 pt-3 border-t border-themed">
                <button onClick={() => { setFormData({ ...formData, type: 'yearly' }); setShowAddModal(true); }} className="text-accent text-sm font-medium hover:opacity-80">
                  Or create your own →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern p-8 max-w-md w-full animate-slide-up">
            <h2 className="text-2xl font-bold text-themed-primary mb-6 text-center">
              {editingGoal ? 'Edit Goal' : 'New Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-modern"
                  disabled={editingGoal}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-modern"
                  placeholder="My goal..."
                  spellcheck="true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-modern h-20 resize-none"
                  placeholder="Details..."
                  spellcheck="true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-modern"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-modern"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Saving...' : 'Save Goal'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-modern p-8 max-w-lg w-full animate-slide-up">
            <h2 className="text-2xl font-bold text-themed-primary mb-6 text-center">Bulk Add Goals</h2>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">Type</label>
                <select
                  value={bulkData.type}
                  onChange={(e) => setBulkData({ ...bulkData, type: e.target.value })}
                  className="input-modern"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">
                  Goals <span className="text-themed-muted">(one per line)</span>
                </label>
                <textarea
                  required
                  value={bulkData.titles}
                  onChange={(e) => setBulkData({ ...bulkData, titles: e.target.value })}
                  className="input-modern h-40 resize-none font-mono"
                  placeholder={`Morning jog\nRead 20 pages\nMeditate 10min\nDrink 8 glasses water`}
                  spellcheck="true"
                />
                <p className="text-xs text-themed-muted mt-1">
                  {bulkData.titles.split('\n').filter(t => t.trim()).length} goals
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-themed-primary mb-2">
                  Common Description <span className="text-themed-muted">(optional, applies to all)</span>
                </label>
                <textarea
                  value={bulkData.description}
                  onChange={(e) => setBulkData({ ...bulkData, description: e.target.value })}
                  className="input-modern h-16 resize-none"
                  placeholder="Shared description for all these goals..."
                  spellcheck="true"
                />
                {bulkGrammarHints.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {bulkGrammarHints.slice(0, 2).map((hint, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-yellow-500/20 transition-colors"
                        onClick={() => handleGrammarFix(hint)}
                        title={hint.hint || ''}
                      >
                        <span>💡</span>
                        <span>"<span className="font-semibold underline decoration-dotted">{hint.word}</span>" → {hint.correction}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={bulkLoading} className="btn-primary flex-1">
                  {bulkLoading ? 'Creating...' : `Create ${bulkData.titles.split('\n').filter(t => t.trim()).length || 0} Goals`}
                </button>
                <button type="button" onClick={() => { setShowBulkModal(false); setBulkData({ type: 'monthly', titles: '', description: '' }); setBulkGrammarHints([]); }} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
