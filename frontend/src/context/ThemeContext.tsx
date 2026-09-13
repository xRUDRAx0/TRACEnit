import React, { useEffect } from 'react';
import { ThemeContext } from './ThemeContextDefinition';
import type { Theme } from './ThemeContextDefinition';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('worktwin-theme', 'light');
  }, []);

  const setTheme = (_newTheme: Theme) => {
    // Theme switching is disabled — TRACE uses a single warm ivory design system.
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme, resolvedTheme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}
