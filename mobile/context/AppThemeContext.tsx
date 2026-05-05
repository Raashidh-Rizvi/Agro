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
  bg: string; card: string; cardElevated: string; surface: string; border: string; divider: string;
  text: string; subtext: string; muted: string;
  primary: string; primaryDim: string; accent: string;
  danger: string; dangerDim: string; warning: string; info: string; success: string;
  tabBar: string; tabBorder: string; tabInactive: string;
  heroOverlay: string; heroGradientStart: string; heroGradientEnd: string;
  glassOverlay: string;
  statusBar: StatusBarStyle;
}

// ─── Dark Palette ─────────────────────────────────────────────────────────────
export const DARK_COLORS: ColorPalette = {
  bg:                 '#070C09',
  card:               '#121A15',
  cardElevated:       '#182318',
  surface:            '#1A2620',
  border:             '#1E3528',
  divider:            '#172416',
  text:               '#E8F0EC',
  subtext:            '#7DA090',
  muted:              '#4A6358',
  primary:            '#0F9D58',
  primaryDim:         'rgba(15,157,88,0.15)',
  accent:             '#34C759',
  danger:             '#F87171',
  dangerDim:          '#3D1515',
  warning:            '#FBBF24',
  info:               '#60A5FA',
  success:            '#34C759',
  tabBar:             '#0E1812',
  tabBorder:          '#1E3528',
  tabInactive:        '#3D5A4C',
  heroOverlay:        'rgba(7,22,13,0.55)',
  heroGradientStart:  '#13B463',
  heroGradientEnd:    '#096040',
  glassOverlay:       'rgba(18,26,21,0.75)',
  statusBar:          'light',
};

// ─── Light Palette ────────────────────────────────────────────────────────────
export const LIGHT_COLORS: ColorPalette = {
  bg:                 '#F2F8F4',
  card:               '#FFFFFF',
  cardElevated:       '#FAFFFE',
  surface:            '#EEF7F1',
  border:             '#DDE9E3',
  divider:            '#EBF4EE',
  text:               '#0A1C13',
  subtext:            '#3D5E50',
  muted:              '#8BA89E',
  primary:            '#0F9D58',
  primaryDim:         '#E3F4EB',
  accent:             '#34C759',
  danger:             '#EF4444',
  dangerDim:          '#FEE2E2',
  warning:            '#F59E0B',
  info:               '#3B82F6',
  success:            '#16A34A',
  tabBar:             '#FFFFFF',
  tabBorder:          '#DDE9E3',
  tabInactive:        '#9DB8AD',
  heroOverlay:        'rgba(11,107,58,0.22)',
  heroGradientStart:  '#13B463',
  heroGradientEnd:    '#0B6B3A',
  glassOverlay:       'rgba(255,255,255,0.80)',
  statusBar:          'dark',
};

export type AppColors = ColorPalette;

/** Returns the correct color palette for the current theme */
export function useAppColors(): AppColors {
  const { isDark } = useAppTheme();
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}
