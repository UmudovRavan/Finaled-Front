import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'midnight';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('altensor_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'midnight') {
      return saved;
    }
    return 'dark';
  });

  const applyTheme = (newTheme: ThemeMode) => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('light', 'dark', 'theme-midnight');
    body.classList.remove('theme-light', 'theme-dark', 'theme-midnight');

    if (newTheme === 'light') {
      root.classList.add('light');
      body.classList.add('theme-light');
      body.style.backgroundColor = '#F8FAFC';
      body.style.color = '#0F172A';
    } else if (newTheme === 'midnight') {
      root.classList.add('dark', 'theme-midnight');
      body.classList.add('theme-midnight');
      body.style.backgroundColor = '#0B0F19';
      body.style.color = '#F8FAFC';
    } else {
      root.classList.add('dark');
      body.classList.add('theme-dark');
      body.style.backgroundColor = '#121214';
      body.style.color = '#F4F4F5';
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('altensor_theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
