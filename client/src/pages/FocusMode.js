import React, { useState, useEffect, useRef } from 'react';
import { focusAPI, gamificationAPI } from '../utils/api';

const FocusMode = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [timerType, setTimerType] = useState('pomodoro_25');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [todayStats, setTodayStats] = useState({ totalMinutes: 0, completedSessions: 0, todayGoal: 120 });
  const [loading, setLoading] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  
  const timerRef = useRef(null);
  
  const timerOptions = [
    { value: 'pomodoro_25', label: '25 min', seconds: 25 * 60 },
    { value: 'pomodoro_50', label: '50 min', seconds: 50 * 60 },
    { value: 'custom', label: 'Custom', seconds: 15 * 60 }
  ];

  useEffect(() => {
    fetchTodayStats();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const fetchTodayStats = async () => {
    try {
      const res = await focusAPI.getToday();
      setTodayStats(res.data);
    } catch (err) {
      console.error('Error fetching focus stats:', err);
    }
  };

  const startSession = async () => {
    try {
      setLoading(true);
      const res = await focusAPI.start(null, timerType);
      setSessionId(res.data._id);
      setSessionActive(true);
      
      const selectedTimer = timerOptions.find(t => t.value === timerType);
      setTimeLeft(selectedTimer.seconds);
      setIsRunning(true);
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = async () => {
    try {
      setIsRunning(false);
      await focusAPI.end(sessionId);
      
      const minutes = timerType === 'pomodoro_50' ? 50 : timerType === 'pomodoro_25' ? 25 : 15;
      const xpRes = await gamificationAPI.focusCompleted(minutes);
      
      setXpEarned(xpRes.data.xpEarned);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
      
      await fetchTodayStats();
      
      setSessionActive(false);
      setSessionId(null);
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  const stopSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setSessionActive(false);
    setSessionId(null);
    const selectedTimer = timerOptions.find(t => t.value === timerType);
    setTimeLeft(selectedTimer.seconds);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timerType === 'pomodoro_50' 
    ? ((50 * 60 - timeLeft) / (50 * 60)) * 100
    : timerType === 'pomodoro_25'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((15 * 60 - timeLeft) / (15 * 60)) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center animate-slide-up">
        <h1 className="text-3xl font-bold text-themed-primary mb-2">🎯 Focus Mode</h1>
        <p className="text-themed-secondary">Stay concentrated and track your productivity</p>
      </div>

      {/* Timer Selection */}
      <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {!sessionActive && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
            {timerOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setTimerType(option.value);
                  setTimeLeft(option.seconds);
                }}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-medium transition-all text-sm sm:text-base ${
                  timerType === option.value
                    ? 'btn-primary'
                    : 'bg-themed-elevated text-themed-primary hover:bg-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Timer Display */}
        <div className="relative flex justify-center mb-6 sm:mb-8">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="8"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'var(--primary)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--primary-light)' }} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-6xl font-bold text-themed-primary font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-themed-secondary mt-1 sm:mt-2 text-sm sm:text-base">
                {isRunning ? 'Focus Time!' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!sessionActive ? (
            <button
              onClick={startSession}
              disabled={loading}
              className="btn-primary px-8 py-4 text-lg"
            >
              {loading ? 'Starting...' : '▶ Start Focus'}
            </button>
          ) : (
            <>
              <button
                onClick={stopSession}
                className="px-6 py-4 bg-red-500/20 text-red-400 rounded-2xl font-medium hover:bg-red-500/30 transition-colors"
              >
                ⏹ Stop
              </button>
              {isRunning && (
                <button
                  onClick={() => setIsRunning(false)}
                  className="btn-secondary px-6 py-4"
                >
                  ⏸ Pause
                </button>
              )}
              {!isRunning && timeLeft > 0 && (
                <button
                  onClick={() => setIsRunning(true)}
                  className="btn-primary px-6 py-4"
                >
                  ▶ Resume
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Today's Stats */}
      <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-bold text-themed-primary mb-4">Today's Focus</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-themed-subtle rounded-2xl">
            <p className="text-3xl font-bold text-accent">{todayStats.totalMinutes}</p>
            <p className="text-sm text-themed-secondary">Minutes</p>
          </div>
          <div className="p-4 bg-themed-subtle rounded-2xl">
            <p className="text-3xl font-bold text-green-500">{todayStats.completedSessions}</p>
            <p className="text-sm text-themed-secondary">Sessions</p>
          </div>
          <div className="p-4 bg-themed-subtle rounded-2xl">
            <div className="flex flex-col items-center">
              <div className="w-full bg-themed-elevated rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-dark))' }}
                  style={{ width: `${Math.min(100, (todayStats.totalMinutes / todayStats.todayGoal) * 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-themed-secondary">{todayStats.todayGoal} min goal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reward Popup */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative glass-card p-8 rounded-3xl text-center animate-slide-up">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-themed-primary mb-2">Focus Session Complete!</h2>
            <p className="text-themed-secondary mb-4">Great job staying focused!</p>
            <div className="text-white px-6 py-3 rounded-2xl inline-block" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-dark))' }}>
              <span className="font-bold">+{xpEarned} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-bold text-themed-primary mb-4">💡 Focus Tips</h2>
        <ul className="space-y-2 text-themed-secondary">
          <li className="flex items-start gap-2">
            <span>🎯</span>
            <span>Remove all distractions before starting a focus session</span>
          </li>
          <li className="flex items-start gap-2">
            <span>💧</span>
            <span>Keep water nearby and stay hydrated</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🏃</span>
            <span>Take short breaks between sessions to stay fresh</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FocusMode;