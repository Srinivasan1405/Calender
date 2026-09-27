import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const cycleOrder = ['dark', 'light', 'eye-protector'];
  const nextTheme = {
    'dark': 'light',
    'light': 'eye-protector',
    'eye-protector': 'dark',
  };

  const toggleTheme = () => {
    setTheme(prev => nextTheme[prev] || 'dark');
  };

  const setThemeDirect = (t) => {
    if (cycleOrder.includes(t)) setTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeDirect, cycleOrder }}>
      {children}
    </ThemeContext.Provider>
  );
};
