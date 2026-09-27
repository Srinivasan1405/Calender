import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/routine');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', boxShadow: '0 10px 40px var(--primary-glow)' }}>
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" style={{ stopColor: 'var(--primary-light)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--primary-dark)' }} />
                </linearGradient>
              </defs>
              <circle cx="20" cy="24" r="7" fill="white"/>
              <path d="M20 11v3M20 31v3M11 20h3M30 20h3M14 14l2 2M26 14l-2 2" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-themed-primary mb-2">Routine<span className="text-accent">Rise</span></h1>
          <p className="text-themed-muted">Rise with your daily routine</p>
        </div>
        
        <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-themed-primary mb-6 text-center">Welcome Back</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-themed-secondary mb-2">Email</label>
              <input
                type="email"
                required
                className="input-modern"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-themed-secondary mb-2">Password</label>
              <input
                type="password"
                required
                className="input-modern"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center text-lg"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-themed-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
          
          <div className="mt-6 p-4 rounded-2xl bg-themed-elevated border border-themed">
            <p className="text-sm text-themed-muted text-center">Demo Account</p>
            <p className="text-sm text-themed-secondary text-center font-medium mt-1">demo@example.com / demo123</p>
            <p className="text-xs text-themed-muted text-center mt-1">John's data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
