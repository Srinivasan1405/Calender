import React, { useState, useEffect } from 'react';
import { tasksAPI, notesAPI, performanceAPI, goalsAPI, gamificationAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getToday, formatDisplayDate, getDayInfo, STATUS_NEXT, getStatusIcon, getStatusLabel, calculateSuccessRate, calculateStatusBreakdown, getNextSuggestedTask } from '../utils/helpers';
import TodayNotes from '../components/TodayNotes';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayNote, setTodayNote] = useState({ content: '', mood: '' });
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ timeSlot: '09:00', taskName: '' });
  const [addingTask, setAddingTask] = useState(false);

  const today = getToday();
  const dayInfo = getDayInfo(today);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, noteRes, statsRes, goalsRes] = await Promise.all([
        tasksAPI.getTasks(today),
        notesAPI.getNote(today),
        performanceAPI.getStats(),
        goalsAPI.getGoals(),
      ]);

      setTodayTasks(tasksRes.data);
      setTodayNote(noteRes.data);
      setStats(statsRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const cycleStatus = async (task) => {
    const newStatus = STATUS_NEXT[task.status] || 'not_started';
    const matchTask = (t) => t._id && task._id
      ? t._id === task._id
      : t._id === null && task._id === null && t.timeSlot === task.timeSlot;

    setTodayTasks(prev => prev.map(t => matchTask(t) ? { ...t, status: newStatus } : t));

    try {
      let updatedTask;
      if (task._id) {
        const res = await tasksAPI.updateTask(task._id, { status: newStatus });
        updatedTask = res.data;
      } else {
        const res = await tasksAPI.updateOrCreate({
          date: today,
          timeSlot: task.timeSlot,
          taskName: task.taskName,
          status: newStatus
        });
        updatedTask = res.data;
      }

      setTodayTasks(prev => prev.map(t => matchTask(t) ? { ...t, ...updatedTask, status: newStatus } : t));

      if (newStatus === 'completed') {
        try {
          await gamificationAPI.taskCompleted(updatedTask._id, new Date().getHours() < 12);
        } catch (xpErr) {
          console.error('Error awarding XP:', xpErr);
        }
      }

      const statsRes = await performanceAPI.getStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error updating task:', err);
      const tasksRes = await tasksAPI.getTasks(today);
      setTodayTasks(tasksRes.data);
    }
  };

  const updateNote = async (content, mood) => {
    try {
      const res = await notesAPI.createNote({ date: today, content, mood });
      setTodayNote(res.data);
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const addQuickTask = async () => {
    if (!newTask.taskName.trim()) return;
    try {
      setAddingTask(true);
      await tasksAPI.updateOrCreate({
        date: today,
        timeSlot: newTask.timeSlot,
        taskName: newTask.taskName,
        status: 'not_started'
      });
      setNewTask({ timeSlot: '09:00', taskName: '' });
      await fetchDashboardData();
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const deleteTask = async (task) => {
    if (!task._id) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.deleteTask(task._id);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const successRate = calculateSuccessRate(todayTasks);
  const breakdown = calculateStatusBreakdown(todayTasks);
  const totalTasks = todayTasks.length;
  const nextTask = getNextSuggestedTask(todayTasks);

  const ActivityAnalysis = ({ tasks, breakdown: b, rate }) => {
    return (
      <div className="card-modern p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 10px 40px var(--primary-glow)' }}>
            📊
          </div>
          <div>
            <h2 className="text-lg font-bold text-themed-primary">Activity Analysis</h2>
            <p className="text-xs text-themed-muted">Today's performance breakdown</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-emerald-500/10 rounded-2xl p-4 text-center border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400">{b.completed}</div>
            <div className="text-xs text-themed-muted mt-1">✓ Done</div>
          </div>
          <div className="bg-blue-500/10 rounded-2xl p-4 text-center border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">{b.in_progress}</div>
            <div className="text-xs text-themed-muted mt-1">⟳ Working</div>
          </div>
          <div className="bg-red-500/10 rounded-2xl p-4 text-center border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{b.incomplete}</div>
            <div className="text-xs text-themed-muted mt-1">✕ Missed</div>
          </div>
          <div className="bg-gray-500/10 rounded-2xl p-4 text-center border border-gray-500/20">
            <div className="text-2xl font-bold text-themed-secondary">{b.not_started}</div>
            <div className="text-xs text-themed-muted mt-1">○ Pending</div>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-themed-muted mb-3">Progress Overview</p>
            <div className="h-4 rounded-full bg-gray-800 overflow-hidden flex">
              {b.completed > 0 && (
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(b.completed / tasks.length) * 100}%` }} title={`Completed: ${b.completed}`} />
              )}
              {b.in_progress > 0 && (
                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(b.in_progress / tasks.length) * 100}%` }} title={`In Progress: ${b.in_progress}`} />
              )}
              {b.incomplete > 0 && (
                <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${(b.incomplete / tasks.length) * 100}%` }} title={`Incomplete: ${b.incomplete}`} />
              )}
              {b.not_started > 0 && (
                <div className="bg-gray-600 h-full transition-all duration-500" style={{ width: `${(b.not_started / tasks.length) * 100}%` }} title={`Not Started: ${b.not_started}`} />
              )}
            </div>
            <div className="flex justify-between text-xs text-themed-muted mt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{rate}% complete</span>
              <span>{tasks.length} total tasks</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dayInfo.specialDay && (
        <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r ${dayInfo.specialDay.color} text-white animate-slide-up`}>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <div className="text-9xl transform translate-x-16 -translate-y-8">{dayInfo.specialDay.emoji}</div>
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Today's Special</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">{dayInfo.specialDay.name}</h2>
            <p className="text-white/90 mt-2">{dayInfo.weekday}, {formatDisplayDate(today)}</p>
          </div>
        </div>
      )}

      {!dayInfo.specialDay && (
        <div className="rounded-3xl p-6 animate-slide-up text-white" style={{ background: 'linear-gradient(to right, var(--primary-dark), var(--primary))' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm font-medium">
                {dayInfo.isToday ? "Today" : dayInfo.weekday}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-white/90 mt-2">{formatDisplayDate(today)}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl">{dayInfo.isWeekend ? '🎉' : '💪'}</div>
              {dayInfo.isWeekend && <p className="text-white/80 text-sm mt-1">Weekend Vibes!</p>}
            </div>
          </div>
        </div>
      )}

      {nextTask && successRate < 100 && (
        <div className="card-modern p-5 animate-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ animationDelay: '0.08s', borderColor: 'var(--primary)', borderWidth: '1px' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'var(--overlay-active)' }}>
              {nextTask.status === 'in_progress' ? '⟳' : '🎯'}
            </div>
            <div>
              <p className="text-xs text-themed-muted uppercase tracking-wider font-medium">Smart Focus — Up Next</p>
              <p className="text-lg font-bold text-themed-primary">{nextTask.taskName}</p>
              <p className="text-sm text-themed-muted">Scheduled at {nextTask.timeSlot}</p>
            </div>
          </div>
          <button
            onClick={() => cycleStatus(nextTask)}
            className="btn-primary py-2.5 px-6 whitespace-nowrap"
          >
            {nextTask.status === 'in_progress' ? 'Mark Complete' : 'Start Now'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm text-themed-muted">Today's Progress</p>
          <p className={`text-2xl font-bold ${
            successRate >= 80 ? 'text-emerald-400' : successRate >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {successRate}%
          </p>
        </div>
        <div className="stat-card">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm text-themed-muted">Completed</p>
          <p className="text-2xl font-bold text-accent">{breakdown.completed}/{totalTasks}</p>
        </div>
        <div className="stat-card">
          <div className="text-3xl mb-2">🔥</div>
          <p className="text-sm text-themed-muted">Current Streak</p>
          <p className="text-2xl font-bold text-orange-400">{stats?.currentStreak || 0}</p>
        </div>
        <div className="stat-card">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-sm text-themed-muted">Best Streak</p>
          <p className="text-2xl font-bold text-yellow-400">{stats?.bestStreak || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="p-5 rounded-[20px] shadow-lg" style={{ border: '1px solid var(--overlay-active)', background: 'linear-gradient(to right, var(--overlay-active), transparent)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">➕</span>
                <h2 className="text-lg font-bold text-themed-primary">Add New Task</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="time"
                    value={newTask.timeSlot}
                    onChange={(e) => setNewTask({ ...newTask, timeSlot: e.target.value })}
                    className="input-modern w-24 sm:w-28"
                    style={{ position: 'relative', zIndex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && addQuickTask()}
                  />
                  <input
                    type="text"
                    value={newTask.taskName}
                    onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                    className="input-modern flex-1 min-w-0"
                    style={{ position: 'relative', zIndex: 1 }}
                    placeholder="Enter task name..."
                    onKeyDown={(e) => e.key === 'Enter' && addQuickTask()}
                    spellCheck="true"
                  />
                </div>
                <button
                  onClick={addQuickTask}
                  disabled={addingTask || !newTask.taskName.trim()}
                  className="btn-primary py-3 px-6 disabled:opacity-50 w-full sm:w-auto"
                >
                  {addingTask ? 'Adding...' : '+ Add'}
                </button>
              </div>
            </div>
          </div>

          <div className="card-modern p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--overlay-active)' }}>
                  <span className="text-sm">✅</span>
                </div>
                <h2 className="text-lg font-bold text-themed-primary">Today's Tasks</h2>
              </div>
              <div className="hidden sm:block text-xs text-themed-muted">
                Click status to cycle: <span className="text-themed-secondary">○ → ⟳ → ✓ → ✕</span>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
              {todayTasks.map((task, index) => (
                <div
                  key={task._id || `task-${index}`}
                  className={`task-item status-${task.status}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => cycleStatus(task)}
                      className={`status-btn ${task.status}`}
                      title={`Status: ${getStatusLabel(task.status)}. Click to change.`}
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1">
                      <p className="task-text font-medium text-themed-primary">{task.taskName}</p>
                      <p className="text-xs text-themed-muted">{task.timeSlot}</p>
                    </div>
                  </div>
                  {task._id && (
                    <button
                      onClick={() => deleteTask(task)}
                      className="p-2 text-themed-muted hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {todayTasks.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-themed-muted">No tasks for today</p>
                  <p className="text-themed-muted text-sm mt-1">Add tasks from the form above</p>
                </div>
              )}
            </div>
          </div>

          {stats && (
            <div className="card-modern p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-sm">📈</span>
                </div>
                <h2 className="text-lg font-bold text-themed-primary">Last 30 Days</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 rounded-2xl bg-themed-elevated">
                  <p className="text-2xl sm:text-3xl font-bold text-accent">{stats.completedTasksLast30}</p>
                  <p className="text-xs sm:text-sm text-themed-muted">Tasks Completed</p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-2xl bg-themed-elevated">
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.averageSuccessRate.toFixed(0)}%</p>
                  <p className="text-xs sm:text-sm text-themed-muted">Avg Success Rate</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ActivityAnalysis tasks={todayTasks} breakdown={breakdown} rate={successRate} />

          <TodayNotes note={todayNote} onUpdate={updateNote} date={today} />

          <div className="card-modern p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <span className="text-sm">🏆</span>
              </div>
              <h2 className="text-lg font-bold text-themed-primary">Your Goals</h2>
            </div>
            <div className="space-y-3">
              {goals.length > 0 ? goals.slice(0, 3).map((goal) => (
                <div key={goal._id} className="bg-themed-elevated p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-themed-primary text-sm">{goal.title}</span>
                    <span className={`badge ${
                      goal.progress >= 80 ? 'badge-success' :
                      goal.progress >= 50 ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${goal.progress}%`, background: 'linear-gradient(to right, var(--primary), var(--primary-dark))' }}
                    ></div>
                  </div>
                </div>
              )) : (
                <p className="text-themed-muted text-center py-4">No goals yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
