import React, { useState, useEffect, useRef } from 'react';
import { tasksAPI, gamificationAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDisplayDate, getDayInfo, STATUS_NEXT, getStatusIcon, getStatusLabel, calculateSuccessRate, calculateStatusBreakdown } from '../utils/helpers';

const TaskRow = ({ task, index, onCycleStatus, onDelete, onStartEdit, editingField, editValue, onEditChange, onEditSave, onEditCancel }) => {
  const editRef = useRef(null);
  const isEditingName = editingField === 'taskName' && editValue.field === 'taskName';
  const isEditingTime = editingField === 'timeSlot' && editValue.field === 'timeSlot';

  useEffect(() => {
    if ((isEditingName || isEditingTime) && editRef.current) {
      editRef.current.focus();
    }
  }, [isEditingName, isEditingTime]);

  return (
    <div className={`task-item status-${task.status}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <button
          onClick={() => onCycleStatus(task)}
          className={`status-btn ${task.status}`}
          title={`Status: ${getStatusLabel(task.status)}. Click to cycle.`}
        >
          {getStatusIcon(task.status)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditingTime ? (
              <input
                ref={editRef}
                type="time"
                value={editValue.value}
                onChange={(e) => onEditChange('timeSlot', e.target.value)}
                onBlur={onEditSave}
                onKeyDown={(e) => { if (e.key === 'Enter') onEditSave(); if (e.key === 'Escape') onEditCancel(); }}
                className="input-modern w-24 py-1 px-2 text-sm"
              />
            ) : (
              <span
                className="text-xs text-themed-muted cursor-pointer hover:text-accent transition-colors px-1 -ml-1 rounded"
                onClick={() => onStartEdit(task, 'timeSlot')}
                title="Click to edit time"
              >
                {task.timeSlot}
              </span>
            )}
            {task.isFromTemplate && (
              <span className="text-[10px] text-themed-muted bg-themed-subtle px-1.5 py-0.5 rounded">template</span>
            )}
          </div>
          {isEditingName ? (
            <input
              ref={editRef}
              type="text"
              value={editValue.value}
              onChange={(e) => onEditChange('taskName', e.target.value)}
              onBlur={onEditSave}
              onKeyDown={(e) => { if (e.key === 'Enter') onEditSave(); if (e.key === 'Escape') onEditCancel(); }}
              className="input-modern py-1 px-2 text-sm mt-0.5"
              placeholder="Task name..."
            />
          ) : (
            <p
              className="task-text font-medium text-themed-primary cursor-pointer hover:text-accent transition-colors"
              onClick={() => onStartEdit(task, 'taskName')}
              title="Click to edit"
            >
              {task.taskName}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
          task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
          task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
          task.status === 'incomplete' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-themed-secondary'
        }`}>
          {getStatusLabel(task.status)}
        </span>
        <button
          onClick={(e) => onDelete(task, e)}
          className="p-2 text-themed-muted hover:text-red-400 transition-colors flex-shrink-0"
          title="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const RoutineTracker = () => {
  const { user, updateDefaultRoutine } = useAuth();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateTasks, setTemplateTasks] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState({ field: '', value: '', task: null });

  const dayInfo = getDayInfo(selectedDate);
  const addInputRef = useRef(null);

  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (user?.defaultRoutine) {
      setTemplateTasks(user.defaultRoutine);
    }
  }, [user]);

  useEffect(() => {
    if (showAddForm && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddForm]);

  const fetchTasks = async (date) => {
    try {
      setLoading(true);
      const res = await tasksAPI.getTasks(date);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const cycleStatus = async (task) => {
    const newStatus = STATUS_NEXT[task.status] || 'not_started';
    const matchTask = (t) => t._id && task._id
      ? t._id === task._id
      : t._id === null && task._id === null && t.timeSlot === task.timeSlot;

    setTasks(prev => prev.map(t => matchTask(t) ? { ...t, status: newStatus } : t));

    try {
      let updatedTask;
      if (task._id) {
        const res = await tasksAPI.updateTask(task._id, { status: newStatus });
        updatedTask = res.data;
      } else {
        const res = await tasksAPI.updateOrCreate({
          date: selectedDate,
          timeSlot: task.timeSlot,
          taskName: task.taskName,
          status: newStatus
        });
        updatedTask = res.data;
      }

      setTasks(prev => prev.map(t => matchTask(t) ? { ...t, ...updatedTask, status: newStatus } : t));

      if (newStatus === 'completed') {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        try {
          await gamificationAPI.taskCompleted(updatedTask._id, new Date().getHours() < 12);
        } catch (xpErr) {
          console.error('Error awarding XP:', xpErr);
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);
      await fetchTasks(selectedDate);
    }
  };

  const deleteTask = async (task, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${task.taskName}"?`)) return;

    if (task._id) {
      try {
        await tasksAPI.deleteTask(task._id);
        setTasks(tasks.filter(t => t._id !== task._id));
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    } else {
      setTasks(tasks.filter(t => !(t.timeSlot === task.timeSlot && t.taskName === task.taskName)));
    }
  };

  const addTask = async () => {
    if (!newTaskName.trim() || !newTaskTime) return;
    setAddingTask(true);
    try {
      await tasksAPI.createSingleTask({
        date: selectedDate,
        timeSlot: newTaskTime,
        taskName: newTaskName.trim()
      });
      setNewTaskName('');
      setNewTaskTime('');
      setShowAddForm(false);
      await fetchTasks(selectedDate);
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const startEdit = (task, field) => {
    setEditingField(field);
    setEditValue({ field, value: task[field], task });
  };

  const handleEditChange = (field, value) => {
    setEditValue(prev => ({ ...prev, value }));
  };

  const saveEdit = async () => {
    if (!editValue.task || !editValue.field) return;
    const { task, field, value } = editValue;
    if (value === task[field] || !value.trim()) {
      setEditingField(null);
      setEditValue({ field: '', value: '', task: null });
      return;
    }

    try {
      if (task._id) {
        await tasksAPI.updateTask(task._id, { [field]: value });
      } else {
        await tasksAPI.updateOrCreate({
          date: selectedDate,
          timeSlot: field === 'timeSlot' ? value : task.timeSlot,
          taskName: field === 'taskName' ? value : task.taskName,
          status: task.status
        });
      }
      setEditingField(null);
      setEditValue({ field: '', value: '', task: null });
      await fetchTasks(selectedDate);
    } catch (err) {
      console.error('Error saving edit:', err);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue({ field: '', value: '', task: null });
  };

  const saveTemplate = async () => {
    try {
      setLoading(true);
      await updateDefaultRoutine(templateTasks);
      setEditingTemplate(false);
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTemplateTask = () => {
    setTemplateTasks([...templateTasks, { timeSlot: '09:00', taskName: '' }]);
  };

  const removeTemplateTask = (index) => {
    setTemplateTasks(templateTasks.filter((_, i) => i !== index));
  };

  const updateTemplateTask = (index, field, value) => {
    const updated = [...templateTasks];
    updated[index][field] = value;
    setTemplateTasks(updated);
  };

  const successRate = calculateSuccessRate(tasks);
  const breakdown = calculateStatusBreakdown(tasks);

  return (
    <div className="space-y-6">
      {!editingTemplate ? (
        <>
          {dayInfo.specialDay && (
            <div className={`relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r ${dayInfo.specialDay.color} text-white animate-slide-up`}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <div className="text-7xl transform translate-x-12 -translate-y-4">{dayInfo.specialDay.emoji}</div>
              </div>
              <p className="text-white/80 text-sm font-medium">{dayInfo.weekday}</p>
              <h2 className="text-xl font-bold mt-1">{dayInfo.specialDay.name}</h2>
              <p className="text-white/90 text-sm mt-1">{formatDisplayDate(selectedDate)}</p>
            </div>
          )}

          {!dayInfo.specialDay && (
            <div className="rounded-3xl p-5 animate-slide-up text-white" style={{ background: 'linear-gradient(to right, var(--primary-dark), var(--primary))' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    {dayInfo.isToday ? "Today" : dayInfo.weekday}
                  </p>
                  <h1 className="text-2xl font-bold mt-1">{formatDisplayDate(selectedDate)}</h1>
                </div>
                <div className="text-right">
                  <div className="text-3xl">{dayInfo.isWeekend ? '🎉' : '💪'}</div>
                  {dayInfo.isWeekend && <p className="text-white/80 text-sm">Weekend!</p>}
                </div>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg animate-slide-up z-50">
              ✓ Great job! Keep going!
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-modern w-full sm:w-44"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(formatDate(d));
                }}
                className="btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                ← Prev
              </button>
              <button
                onClick={() => setSelectedDate(formatDate(new Date()))}
                className="btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(formatDate(d));
                }}
                className="btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="stat-card py-3">
              <p className="text-sm text-themed-muted">Completed</p>
              <p className="text-xl font-bold text-emerald-400">{breakdown.completed}</p>
            </div>
            <div className="stat-card py-3">
              <p className="text-sm text-themed-muted">Working</p>
              <p className="text-xl font-bold text-blue-400">{breakdown.in_progress}</p>
            </div>
            <div className="stat-card py-3">
              <p className="text-sm text-themed-muted">Missed</p>
              <p className="text-xl font-bold text-red-400">{breakdown.incomplete}</p>
            </div>
            <div className="stat-card py-3">
              <p className="text-sm text-themed-muted">Pending</p>
              <p className="text-xl font-bold text-themed-secondary">{breakdown.not_started}</p>
            </div>
          </div>

          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {tasks.map((task, index) => (
              <TaskRow
                key={task._id || `task-${index}`}
                task={task}
                index={index}
                onCycleStatus={cycleStatus}
                onDelete={deleteTask}
                onStartEdit={startEdit}
                editingField={editingField}
                editValue={editValue}
                onEditChange={handleEditChange}
                onEditSave={saveEdit}
                onEditCancel={cancelEdit}
              />
            ))}

            {showAddForm && (
              <div className="task-item" style={{ borderColor: 'var(--overlay-active)', background: 'var(--overlay-subtle)' }}>
                <div className="flex gap-3 flex-1 w-full">
                  <div className="w-[34px] h-[34px] rounded-full border-2 border-dashed flex items-center justify-center text-accent text-lg flex-shrink-0" style={{ borderColor: 'var(--primary)' }}>
                    +
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        className="input-modern w-24 py-1.5 px-2 text-sm flex-shrink-0"
                        placeholder="09:00"
                      />
                      <input
                        ref={addInputRef}
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') { setShowAddForm(false); setNewTaskName(''); setNewTaskTime(''); } }}
                        className="input-modern flex-1 py-1.5 px-3 text-sm min-w-0"
                        placeholder="New habit name..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addTask}
                        disabled={addingTask || !newTaskName.trim() || !newTaskTime}
                        className="btn-primary py-1.5 px-4 text-sm disabled:opacity-50 flex-1 sm:flex-none"
                      >
                        {addingTask ? '...' : 'Add'}
                      </button>
                      <button
                        onClick={() => { setShowAddForm(false); setNewTaskName(''); setNewTaskTime(''); }}
                        className="p-1.5 text-themed-muted hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tasks.length === 0 && !showAddForm && !loading && (
              <div className="card-modern text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-themed-muted text-lg">No habits for today</p>
                <p className="text-themed-muted text-sm mt-2">Add one below or set up your template</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                setShowAddForm(true);
                const now = new Date();
                if (!newTaskTime) setNewTaskTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
              }}
              className="btn-secondary py-2.5 sm:py-3 text-sm sm:text-base"
            >
              + Add Habit
            </button>
            <button
              onClick={() => setEditingTemplate(true)}
              className="btn-secondary py-2.5 sm:py-3 text-sm sm:text-base"
            >
              ⚙️ Edit Template
            </button>
          </div>
        </>
      ) : (
        <div className="animate-slide-up">
          <button
            onClick={() => setEditingTemplate(false)}
            className="mb-4 text-themed-secondary hover:text-white flex items-center gap-2"
          >
            ← Back to Habits
          </button>

          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-themed-primary">Edit Habit Template</h2>
                <p className="text-sm text-themed-muted mt-1">These habits will appear every day</p>
              </div>
              <span className="text-sm text-themed-muted">{templateTasks.length} habits</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
              {templateTasks.map((task, index) => (
                <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 items-center bg-themed-elevated p-3 rounded-2xl group hover:bg-gray-800/80 transition-colors">
                  <span className="w-8 h-8 rounded-full text-accent flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'var(--overlay-active)' }}>
                    {index + 1}
                  </span>
                  <input
                    type="time"
                    value={task.timeSlot}
                    onChange={(e) => updateTemplateTask(index, 'timeSlot', e.target.value)}
                    className="input-modern w-24 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={task.taskName}
                    onChange={(e) => updateTemplateTask(index, 'taskName', e.target.value)}
                    className="input-modern flex-1 min-w-0"
                    placeholder="Habit name..."
                  />
                  <button
                    onClick={() => removeTemplateTask(index)}
                    className="p-2 text-red-400 md:text-red-500 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {templateTasks.length === 0 && (
                <div className="text-center py-8 text-themed-muted">
                  <p>No habits in template yet</p>
                  <p className="text-sm mt-1">Add your first habit below</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={addTemplateTask} className="btn-secondary flex-1">
                + Add Habit
              </button>
              <button onClick={saveTemplate} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineTracker;
