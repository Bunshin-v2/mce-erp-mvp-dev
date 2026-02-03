/**
 * useTheme Hook - Client-side theme management
 */

import { useState, useEffect } from 'react';
import { Theme, getTheme, setTheme, toggleTheme as toggleThemeUtil } from '@/lib/theme/theme-manager';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = toggleThemeUtil();
    setThemeState(newTheme);
  };

  return { theme, setTheme: updateTheme, toggleTheme };
}
