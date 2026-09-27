import React from 'react';

const LevelProgress = ({ stats }) => {
  const xpProgress = stats ? (stats.xp % 100) : 0;
  
  return (
    <div className="stat-card">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-sm text-themed-muted">Level</p>
          <p className="text-3xl font-bold text-accent">{stats?.level || 1}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-themed-muted">Total XP</p>
          <p className="text-xl font-bold text-themed-primary">{stats?.xp || 0}</p>
        </div>
      </div>
      <div className="progress-bar mb-2">
        <div
          className="progress-fill"
          style={{ width: `${xpProgress}%`, background: 'linear-gradient(to right, var(--primary), var(--primary-dark))' }}
        ></div>
      </div>
      <p className="text-xs text-themed-muted">{100 - xpProgress} XP to next level</p>
    </div>
  );
};

const BadgeCard = ({ badge }) => {
  return (
    <div className={`p-4 rounded-2xl text-center transition-all ${
      badge.earned 
        ? 'card-modern'
        : 'opacity-50'
    }`} style={badge.earned ? { background: 'var(--overlay-active)' } : { background: 'var(--bg-elevated)' }}>
      <div className="text-4xl mb-2">{badge.icon}</div>
      <p className={`font-medium ${badge.earned ? 'text-themed-primary' : 'text-themed-muted'}`}>
        {badge.name}
      </p>
      <p className="text-xs text-themed-muted mt-1">{badge.description}</p>
      {badge.earned && badge.earnedAt && (
        <p className="text-xs text-accent mt-2">Earned {new Date(badge.earnedAt).toLocaleDateString()}</p>
      )}
    </div>
  );
};

const StreakDisplay = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="stat-card text-center">
        <div className="text-4xl mb-2">🔥</div>
        <p className="text-sm text-themed-muted">Current Streak</p>
        <p className="text-3xl font-bold text-orange-500">{stats?.streaks?.current || 0}</p>
      </div>
      <div className="stat-card text-center">
        <div className="text-4xl mb-2">⭐</div>
        <p className="text-sm text-themed-muted">Best Streak</p>
        <p className="text-3xl font-bold text-yellow-500">{stats?.streaks?.best || 0}</p>
      </div>
    </div>
  );
};

const XPGain = ({ show, amount }) => {
  if (!show) return null;
  
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-slide-up z-50" style={{ background: 'linear-gradient(to right, var(--primary), var(--primary-dark))' }}>
      +{amount} XP! 🎉
    </div>
  );
};

export { LevelProgress, BadgeCard, StreakDisplay, XPGain };
