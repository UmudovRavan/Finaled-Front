import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_KEYS = ['altensor_theme', 'desktopTheme', 'theme'];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return (
      localStorage.getItem('altensor_theme') ||
      localStorage.getItem('desktopTheme') ||
      localStorage.getItem('theme') ||
      'dark'
    );
  });

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    THEME_KEYS.forEach((key) => {
      try {
        localStorage.setItem(key, newTheme);
      } catch (e) {}
    });
  }, []);

  const isDark = theme === 'dark' || theme === 'midnight';

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight');
    root.classList.add(theme);
    if (theme === 'midnight') {
      root.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

