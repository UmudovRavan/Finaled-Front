import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'midnight';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    setTheme: () => {},
    isDark: true,
    toggleTheme: () => {},
});

const THEME_KEYS = ['altensor_theme', 'desktopTheme', 'theme'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = (
            localStorage.getItem('altensor_theme') ||
            localStorage.getItem('desktopTheme') ||
            localStorage.getItem('theme') ||
            'dark'
        ) as Theme;
        return saved === 'light' || saved === 'midnight' ? saved : 'dark';
    });

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        THEME_KEYS.forEach((key) => {
            try {
                localStorage.setItem(key, newTheme);
            } catch {
                // ignore
            }
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
