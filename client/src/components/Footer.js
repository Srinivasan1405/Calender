import React, { useState } from 'react';

const Footer = () => {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.name.trim() || !feedback.email.trim() || !feedback.message.trim()) return;
    setSubmitted(true);
    setFeedback({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <footer className="mt-12 border-t" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 m-1">
                  <circle cx="20" cy="24" r="7" fill="white" />
                  <path d="M20 11v3M20 31v3M11 20h3M30 20h3M14 14l2 2M26 14l-2 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Routine<span style={{ color: 'var(--primary-light)' }}>Rise</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Rise with your daily routine. Build better habits, track your progress, and achieve your goals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Links</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li><a href="/dashboard" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Dashboard</a></li>
              <li><a href="/routine" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Habits</a></li>
              <li><a href="/focus" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Focus Mode</a></li>
              <li><a href="/analytics" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>Analytics</a></li>
            </ul>
          </div>

          {/* Feedback Form */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Send Feedback</h3>
            {submitted ? (
              <div className="p-4 rounded-2xl text-sm text-center" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                ✅ Thank you for your feedback!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                  required
                />
                <textarea
                  placeholder="Your message..."
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl text-white text-sm font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
                >
                  Send Feedback
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 text-center text-xs" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} RoutineRise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
