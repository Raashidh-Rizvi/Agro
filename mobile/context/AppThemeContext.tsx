/**
 * AppThemeContext — Global dark/light toggle for AgriSense Lanka
 *
 * Auth screens ignore this (they stay light via ThemeOverrideProvider).
 * All tab screens read from useAppColors() which returns the active palette.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export type AppThemeMode = 'dark' | 'light';

interface AppThemeContextValue {
  mode: AppThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextValue>({
  mode: 'dark',
  isDark: true,
  toggleTheme: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppThemeMode>('dark');

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <AppThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}

// ─── Shared palette shape ─────────────────────────────────────────────────────
type StatusBarStyle = 'light' | 'dark';

interface ColorPalette {
  bg: string; card: string; surface: string; border: string; divider: string;
  text: string; subtext: string; muted: string;
  primary: string; primaryDim: string; accent: string;
  danger: string; warning: string; info: string;
  tabBar: string; tabBorder: string; tabInactive: string;
  heroOverlay: string;
  statusBar: StatusBarStyle;
}

// ─── Dark Palette ─────────────────────────────────────────────────────────────
export const DARK_COLORS: ColorPalette = {
  bg:         '#0A0F0D',
  card:       '#141F18',
  surface:    '#1A2620',
  border:     '#243020',
  divider:    '#1E2E22',
  text:       '#E8F0EC',
  subtext:    '#7DA090',
  muted:      '#4A6358',
  primary:    '#0F9D58',
  primaryDim: 'rgba(15,157,88,0.15)',
  accent:     '#34C759',
  danger:     '#EF4444',
  warning:    '#F59E0B',
  info:       '#3B82F6',
  tabBar:     '#141F18',
  tabBorder:  '#243020',
  tabInactive:'#4A6358',
  heroOverlay:'rgba(11,107,58,0.45)',
  statusBar:  'light',
};

// ─── Light Palette ────────────────────────────────────────────────────────────
export const LIGHT_COLORS: ColorPalette = {
  bg:         '#F4F9F6',
  card:       '#FFFFFF',
  surface:    '#F0F7F3',
  border:     '#E2EDE8',
  divider:    '#EEF5F0',
  text:       '#0D1F17',
  subtext:    '#4A6358',
  muted:      '#8FA89E',
  primary:    '#0F9D58',
  primaryDim: '#E6F4EA',
  accent:     '#34C759',
  danger:     '#EF4444',
  warning:    '#F59E0B',
  info:       '#3B82F6',
  tabBar:     '#FFFFFF',
  tabBorder:  '#E2EDE8',
  tabInactive:'#9DB8AD',
  heroOverlay:'rgba(11,107,58,0.30)',
  statusBar:  'dark',
};

export type AppColors = ColorPalette;

/** Returns the correct color palette for the current theme */
export function useAppColors(): AppColors {
  const { isDark } = useAppTheme();
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}
