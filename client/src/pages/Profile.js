import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gamificationAPI } from '../utils/api';

const FeedbackForm = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.message.trim()) return;
    setSubmitted(true);
    setFeedback({ ...feedback, message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="rounded-3xl p-6 animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Send Feedback</h2>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Help us improve RoutineRise</p>
      {submitted ? (
        <div className="p-4 rounded-2xl text-sm text-center" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
          ✅ Thank you for your feedback!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={feedback.name}
            onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            placeholder="Your name"
            required
          />
          <input
            type="email"
            value={feedback.email}
            onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            placeholder="Your email"
            required
          />
          <textarea
            value={feedback.message}
            onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            placeholder="Your message..."
            required
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
          >
            Send Feedback
          </button>
        </form>
      )}
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [gamification, setGamification] = useState({ xp: 0, level: 1, badges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await gamificationAPI.getStats();
        setGamification(res.data);
      } catch (err) {
        console.error('Error fetching gamification:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nameParts = user?.name?.split(' ') || ['User'];
  const firstName = nameParts[0];
  const surname = nameParts.slice(1).join(' ') || '—';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  const infoCards = [
    { label: 'First Name', value: firstName },
    { label: 'Surname', value: surname },
    { label: 'Email', value: user?.email || '—' },
    { label: 'Member Since', value: memberSince },
    { label: 'XP Points', value: gamification.xp },
    { label: 'Level', value: gamification.level },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="rounded-3xl p-8 text-center animate-slide-up" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
        <p className="text-white/70 text-sm mt-1">{user?.email}</p>
        <div className="flex justify-center gap-4 mt-4">
          <div className="px-4 py-2 rounded-xl bg-white/20 text-white text-center">
            <p className="text-xl font-bold">{gamification.xp}</p>
            <p className="text-xs text-white/80">XP</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/20 text-white text-center">
            <p className="text-xl font-bold">{gamification.level}</p>
            <p className="text-xs text-white/80">Level</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-6 animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', animationDelay: '0.1s' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {infoCards.map((card, i) => (
            <div key={i} className="p-4 rounded-2xl" style={{ background: 'var(--bg-elevated)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {gamification.badges?.length > 0 && (
        <div className="rounded-3xl p-6 animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Badges</h2>
          <div className="flex flex-wrap gap-3">
            {gamification.badges.map((badge, i) => (
              <div key={i} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--overlay-active)', color: 'var(--primary-light)' }}>
                {badge.icon} {badge.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <FeedbackForm />
    </div>
  );
};

export default Profile;
