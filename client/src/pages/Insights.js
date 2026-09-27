import React, { useState, useEffect } from 'react';
import { insightsAPI } from '../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchInsights();
  }, [selectedDays]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [insightsRes, predictionsRes] = await Promise.all([
        insightsAPI.getDaily(selectedDays),
        insightsAPI.getPredictions()
      ]);
      setInsights(insightsRes.data);
      setPredictions(predictionsRes.data);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="text-center animate-slide-up">
        <h1 className="text-3xl font-bold text-themed-primary mb-2">🧠 Smart Insights</h1>
        <p className="text-themed-secondary">AI-powered analysis of your habits</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center gap-2 sm:gap-3 animate-slide-up">
        {['7', '30', '90'].map(days => (
          <button
            key={days}
            onClick={() => setSelectedDays(parseInt(days))}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-medium transition-all text-sm sm:text-base flex-1 sm:flex-none ${
              selectedDays === parseInt(days)
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Smart Suggestions */}
      {insights?.suggestions && insights.suggestions.length > 0 && (
        <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-themed-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span> Smart Suggestions
          </h2>
          <div className="space-y-3">
            {insights.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'linear-gradient(to right, var(--overlay-active), transparent)' }}>
                <span className="text-2xl">✨</span>
                <p className="text-themed-primary font-medium">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance by Day of Week */}
      {insights?.performanceByDay && (
        <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold text-themed-primary mb-4">📅 Performance by Day</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={insights.performanceByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" />
              <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                formatter={(value) => [`${value}%`, 'Success Rate']}
              />
              <Bar dataKey="rate" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary-light)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance by Time Slot */}
      {insights?.timeSlotPerformance && (
        <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-bold text-themed-primary mb-4">⏰ Performance by Time Slot</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {insights.timeSlotPerformance.slice(0, 8).map((slot, index) => (
              <div key={index} className="p-4 bg-themed-subtle rounded-2xl text-center">
                <p className="font-bold text-themed-primary">{slot.timeSlot}</p>
                <p className={`text-2xl font-bold ${
                  slot.rate >= 80 ? 'text-green-500' :
                  slot.rate >= 50 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {slot.rate}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best/Worst Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="card-modern p-6">
          <h2 className="text-lg font-bold text-themed-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">🏆</span> Best Performance
          </h2>
          <div className="space-y-3">
            {insights?.bestDay && (
              <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded-2xl">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-bold text-themed-primary">{insights.bestDay.day}</p>
                  <p className="text-green-400 font-semibold">{insights.bestDay.rate}% success</p>
                </div>
              </div>
            )}
            {insights?.bestTimeSlot && (
              <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded-2xl">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-bold text-themed-primary">{insights.bestTimeSlot.timeSlot}</p>
                  <p className="text-green-400 font-semibold">{insights.bestTimeSlot.rate}% success</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card-modern p-6">
          <h2 className="text-lg font-bold text-themed-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span> Areas to Improve
          </h2>
          <div className="space-y-3">
            {insights?.worstDay && (
              <div className="flex items-center gap-3 p-3 bg-red-500/20 rounded-2xl">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-bold text-themed-primary">{insights.worstDay.day}</p>
                  <p className="text-red-400 font-semibold">{insights.worstDay.rate}% success</p>
                </div>
              </div>
            )}
            {insights?.worstTimeSlot && (
              <div className="flex items-center gap-3 p-3 bg-red-500/20 rounded-2xl">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-bold text-themed-primary">{insights.worstTimeSlot.timeSlot}</p>
                  <p className="text-red-400 font-semibold">{insights.worstTimeSlot.rate}% success</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Predictions & Warnings */}
      {predictions && (
        <div className={`card-modern p-6 animate-slide-up ${predictions.onTrack ? 'border-green-500' : 'border-yellow-500'}`} style={{ animationDelay: '0.5s' }}>
          <h2 className="text-lg font-bold text-themed-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">{predictions.onTrack ? '🎉' : '⚠️'}</span>
            {predictions.onTrack ? 'Great Progress!' : 'Attention Needed'}
          </h2>
          <p className="text-themed-secondary mb-4">{predictions.encouragement}</p>
          {predictions.warnings && predictions.warnings.length > 0 && (
            <div className="space-y-2">
              {predictions.warnings.map((warning, index) => (
                <div key={index} className="flex items-center gap-2 text-yellow-400">
                  <span>⚠️</span>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;