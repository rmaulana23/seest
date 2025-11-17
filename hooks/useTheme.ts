import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'seest_theme_v1';

/**
 * Custom hook to manage application theme (light/dark).
 * - Persists theme preference to localStorage.
 * - Defaults to 'light' theme.
 * - Applies/removes 'dark' class to the document's root element.
 */
export const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get initial theme from localStorage or default to 'light'
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }
    } catch (error) {
        console.error("Could not read theme from localStorage", error);
    }
    // Default to light theme if nothing is stored
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.error("Could not save theme to localStorage", error);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return [theme, toggleTheme];
};