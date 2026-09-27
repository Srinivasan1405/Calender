import React, { useState, useEffect } from 'react';
import { performanceAPI, notesAPI } from '../utils/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDateRange, getHeatmapColor } from '../utils/helpers';

const Analytics = () => {
  const [dailyData, setDailyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRange, setSelectedRange] = useState('7');
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayNote, setDayNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = parseInt(selectedRange);
      const dateRange = getDateRange(days);
      const [dailyRes, statsRes, heatRes] = await Promise.all([
        performanceAPI.getDaily({
          startDate: dateRange[0],
          endDate: dateRange[dateRange.length - 1]
        }),
        performanceAPI.getStats(),
        performanceAPI.getHeatmap(90),
      ]);

      setDailyData(dailyRes.data);
      setStats(statsRes.data);
      setHeatmapData(heatRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = async (day) => {
    setSelectedDay(day);
    try {
      const noteRes = await notesAPI.getNote(day.date);
      setDayNote(noteRes.data);
    } catch (err) {
      setDayNote({ date: day.date, content: '', mood: '' });
    }
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const pieData = stats ? [
    { name: 'Completed', value: stats.completedVsNotCompleted.completed, color: '#10b981' },
    { name: 'Not Completed', value: stats.completedVsNotCompleted.notCompleted, color: '#ef4444' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-themed-primary">Analytics</h1>
        <p className="text-themed-secondary">Track your performance over time</p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {['7', '30', '90'].map((days) => (
          <button
            key={days}
            onClick={() => setSelectedRange(days)}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-medium transition-all text-sm sm:text-base flex-1 sm:flex-none ${
              selectedRange === days
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card">
            <div className="text-3xl mb-2">📈</div>
              <p className="text-sm text-themed-secondary">Avg Success</p>
            <p className={`text-2xl font-bold ${
              stats.averageSuccessRate >= 80 ? 'text-green-500' :
              stats.averageSuccessRate >= 50 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {stats.averageSuccessRate.toFixed(1)}%
            </p>
          </div>
          <div className="stat-card">
            <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-themed-secondary">Completed</p>
            <p className="text-2xl font-bold text-accent">{stats.completedTasksLast30}</p>
          </div>
          <div className="stat-card">
            <div className="text-3xl mb-2">🔥</div>
              <p className="text-sm text-themed-secondary">Current Streak</p>
            <p className="text-2xl font-bold text-orange-500">{stats.currentStreak}</p>
          </div>
          <div className="stat-card">
            <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm text-themed-secondary">Best Streak</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.bestStreak}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-bold text-themed-primary mb-4">Daily Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} stroke="var(--text-muted)" />
              <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                formatter={(value) => [`${value.toFixed(1)}%`, 'Success Rate']}
              />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--primary)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-bold text-themed-primary mb-4">Completion Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-lg font-bold text-themed-primary mb-4">90-Day Activity</h2>
        <div className="flex gap-px sm:gap-1 flex-wrap justify-center">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              className="w-3 h-3 sm:w-6 sm:h-6 rounded-sm sm:rounded-md cursor-pointer transition-transform hover:scale-110"
              style={{
                backgroundColor: day.totalTasks > 0 ? getHeatmapColor(day.successRate) : 'var(--bg-elevated)',
              }}
              title={day.totalTasks > 0 ? `${day.date}: ${day.successRate.toFixed(0)}%` : `${day.date}: No data`}
              onClick={() => day.totalTasks > 0 && handleDayClick(day)}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 text-xs sm:text-sm text-themed-secondary flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-themed-elevated"></div>
            <span>No data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-400"></div>
            <span>&lt;50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400"></div>
            <span>50-79%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>80%+</span>
          </div>
        </div>
      </div>

      {selectedDay && (
        <div className="card-modern p-6 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-themed-primary">{selectedDay.date}</h2>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-themed-muted hover:text-themed-primary"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-themed-subtle rounded-2xl">
              <p className="text-sm text-themed-secondary">Performance</p>
              <p className={`text-2xl font-bold ${
                selectedDay.successRate >= 80 ? 'text-green-500' :
                selectedDay.successRate >= 50 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {selectedDay.successRate.toFixed(0)}%
              </p>
            </div>
            <div className="p-4 bg-themed-subtle rounded-2xl">
              <p className="text-sm text-themed-secondary">Note</p>
              <p className="text-themed-primary mt-1">
                {dayNote?.content || 'No note'}
                {dayNote?.mood && <span className="ml-2">{dayNote.mood === 'happy' ? '😊' : dayNote.mood === 'neutral' ? '😐' : '😞'}</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;