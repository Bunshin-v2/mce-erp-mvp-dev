/**
 * Theme Manager - 2026 Design System
 * Handles theme state and persistence
 */

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'mce-theme-preference';

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function getSavedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'light' || saved === 'dark' ? saved : null;
}

export function getTheme(): Theme {
  return getSavedTheme() ?? getSystemTheme();
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.dataset.theme = theme;
}

export function toggleTheme(): Theme {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
}

export function initTheme(): void {
  const theme = getTheme();
  document.documentElement.dataset.theme = theme;
}
