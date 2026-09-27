import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { gamificationAPI } from '../utils/api';
import { useState, useEffect } from 'react';
import AIAssistant from './AIAssistant';


const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const res = await gamificationAPI.getStats();
        setXp(res.data.xp || 0);
        setLevel(res.data.level || 1);
      } catch (err) {
        console.error('Failed to load gamification:', err);
      }
    };
    fetchGamification();
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest('.user-menu')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/routine', label: 'Habits', icon: '✅' },
    { to: '/focus', label: 'Focus', icon: '🎯' },
    { to: '/calendar', label: 'Calendar', icon: '📅' },
    { to: '/goals', label: 'Goals', icon: '🏆' },
    { to: '/analytics', label: 'Analytics', icon: '📊' },
    { to: '/insights', label: 'Insights', icon: '🧠' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

return (
    <div className="min-h-screen font-poppins overflow-x-hidden">
      <header className="sticky top-0 z-50 pt-3 sm:pt-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="nav-glass flex items-center px-5" style={{ height: '68px' }}>
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" onClick={() => navigate('/dashboard')}>
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
                  <circle cx="20" cy="24" r="7" fill="white"/>
                  <path d="M20 11v3M20 31v3M11 20h3M30 20h3M14 14l2 2M26 14l-2 2" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="hidden min-[380px]:inline text-base sm:text-lg font-bold text-themed-primary tracking-tight">Routine<span className="text-accent">Rise</span></span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center flex-1 justify-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'nav-active' : ''}`
                  }
                >
                  <span className="nav-link-text">{item.icon}<span className="hidden xl:inline nav-label">{item.label}</span></span>
                </NavLink>
              ))}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-overlay-active cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
                title={theme === 'dark' ? 'Light theme' : theme === 'light' ? 'Eye protector' : 'Dark theme'}
              >
                {theme === 'dark' && (
                  <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                )}
                {theme === 'light' && (
                  <svg className="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                )}
                {theme === 'eye-protector' && (
                  <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>

              <div className="xp-badge hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '12px' }}>⭐</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{xp}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/</span>
                <span className="text-xs font-semibold text-accent">{level}</span>
              </div>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="user-menu w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-overlay-active"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Toggle navigation"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobileNav ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {showMobileNav && (
          <div className="md:hidden max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="nav-glass mt-2 p-3 rounded-2xl animate-slide-up">
              <div className="grid grid-cols-4 gap-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMobileNav(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[11px] font-medium transition-all ${
                        isActive ? 'text-accent bg-overlay-active' : 'text-themed-muted'
                      }`
                    }
                  >
                    <span className="text-lg leading-none">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-themed flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>⭐ {xp} XP</span>
                <span>•</span>
                <span className="text-accent font-semibold">Lv.{level}</span>
              </div>
            </div>
          </div>
        )}

        {/* User menu dropdown */}
        {showMenu && (
          <div className="fixed right-4 sm:right-6 top-14 w-56 rounded-xl shadow-lg overflow-hidden z-[100]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-semibold text-sm">{user?.name}</p>
              <p className="text-white/60 text-[11px]">{user?.email}</p>
            </div>
            <div className="p-2 space-y-0.5" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-elevated)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Since</span>
                <span style={{ color: 'var(--text-primary)' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-elevated)' }}>
                <span style={{ color: 'var(--text-muted)' }}>XP</span>
                <span style={{ color: 'var(--text-primary)' }}>{xp}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-elevated)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Level</span>
                <span style={{ color: 'var(--primary-light)' }}>{level}</span>
              </div>
            </div>
            <button onClick={() => { navigate('/profile'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-xs transition-all flex items-center gap-2" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
              <span>👤</span>
              <span>Full Profile</span>
            </button>
            <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-xs transition-all flex items-center gap-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
      <AIAssistant />
    </div>
  );
};

export default Layout;