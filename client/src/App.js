import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoutineTracker from './pages/RoutineTracker';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import FocusMode from './pages/FocusMode';
import Insights from './pages/Insights';
import CalendarPlanner from './pages/CalendarPlanner';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="routine" element={<RoutineTracker />} />
            <Route path="goals" element={<Goals />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="focus" element={<FocusMode />} />
            <Route path="insights" element={<Insights />} />
            <Route path="calendar" element={<CalendarPlanner />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;