/**
 * AGRISENSE LANKA — PREMIUM DESIGN TOKENS
 * Modern | Premium | Trustworthy | Mobile-First
 *
 * Primary Brand:   #0F9D58  (Google Green / Growth)
 * Dark Green:      #0B6B3A  (Depth / Navigation)
 * Light Green:     #E6F4EA  (Surface tints)
 * Accent:          #34C759  (Success / Highlights)
 * Background:      #FFFFFF  (Clean white)
 * Dark Mode:       #0A0F0D  (Deep charcoal-green)
 */

import { Platform } from 'react-native';

// ─── Core Palette ──────────────────────────────────────────────────────────────
export const Palette = {
  // Primary Brand Greens
  greenPrimary:  '#0F9D58',   // Main brand — buttons, CTAs, active states
  greenDark:     '#0B6B3A',   // Deep — headings, gradients top color
  greenLight:    '#E6F4EA',   // Surface tint — cards, input BG, pills
  greenAccent:   '#34C759',   // Success accent, deltas, highlights
  greenEmerald:  '#0D8A4C',   // Gradient mid-stop

  // Legacy aliases (kept for backward-compat)
  greenDeep:    '#0B6B3A',
  greenForest:  '#0D8A4C',
  greenVibrant: '#0F9D58',
  greenMint:    '#34C759',
  greenLime:    '#A8E063',    // subtle lime for dark backgrounds

  // Neutrals
  white:        '#FFFFFF',
  grayBg:       '#F8FAF9',   // subtle off-white page background
  grayCard:     '#FFFFFF',   // card surface
  grayBorder:   '#E2E8E4',   // subtle borders
  grayMuted:    '#F0F4F2',   // muted surface / skeleton

  // Earth tones
  earthWarm:    '#D4A373',
  earthSand:    '#F5F0EB',

  // Text
  textPrimary:   '#0D1F17',   // near-black green
  textSecondary: '#4A6358',   // muted subtext
  textMuted:     '#8FA89E',   // placeholder / captions
  textWhite:     '#FFFFFF',

  // Semantic
  danger:  '#EF4444',
  warning: '#F59E0B',
  info:    '#3B82F6',
  success: '#0F9D58',
};

// ─── Shadow Tokens ─────────────────────────────────────────────────────────────
export const Shadows = {
  xs: {
    shadowColor: '#0B6B3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: '#0B6B3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#0B6B3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#0B6B3A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 10,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  }),
};

// ─── Border Radius Tokens ──────────────────────────────────────────────────────
export const Radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   22,
  xxl:  28,
  pill: 50,
};

// ─── Spacing Tokens ────────────────────────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─── Typography Tokens ─────────────────────────────────────────────────────────
export const Typography = {
  h1:        { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8, lineHeight: 40 },
  h2:        { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.4, lineHeight: 32 },
  h3:        { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 26 },
  h4:        { fontSize: 17, fontWeight: '700' as const, lineHeight: 22 },
  body:      { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold:  { fontSize: 15, fontWeight: '700' as const, lineHeight: 22 },
  small:     { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  smallBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  caption:   { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3, lineHeight: 15 },
  label:     { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  price:     { fontSize: 16, fontWeight: '800' as const, letterSpacing: -0.2 },
};

// ─── Theme Colors (Light / Dark mode) ────────────────────────────────────────
export const Colors = {
  light: {
    // Text
    text:            Palette.textPrimary,
    subtext:         Palette.textSecondary,
    placeholder:     Palette.textMuted,
    // Backgrounds
    background:      Palette.grayBg,
    card:            Palette.grayCard,
    cardTint:        Palette.greenLight,
    surface:         Palette.grayMuted,
    // Brand
    tint:            Palette.greenPrimary,
    primary:         Palette.greenPrimary,
    primaryDark:     Palette.greenDark,
    primaryLight:    Palette.greenLight,
    accent:          Palette.greenAccent,
    // UI
    icon:            Palette.textSecondary,
    tabIconDefault:  '#9DB8AD',
    tabIconSelected: Palette.greenPrimary,
    border:          Palette.grayBorder,
    divider:         '#EEF2F0',
    // Semantic
    danger:          Palette.danger,
    warning:         Palette.warning,
    success:         Palette.greenPrimary,
    info:            Palette.info,
  },
  dark: {
    // Text
    text:            '#E4EDE8',
    subtext:         '#7DA090',
    placeholder:     '#5A7A6A',
    // Backgrounds
    background:      '#0A0F0D',
    card:            '#141F18',
    cardTint:        '#1A2E22',
    surface:         '#1A2E22',
    // Brand
    tint:            Palette.greenAccent,
    primary:         Palette.greenPrimary,
    primaryDark:     Palette.greenDark,
    primaryLight:    Palette.greenLight,
    accent:          Palette.greenAccent,
    // UI
    icon:            '#7DA090',
    tabIconDefault:  '#5A7A6A',
    tabIconSelected: Palette.greenAccent,
    border:          '#1E3528',
    divider:         '#1A2E22',
    // Semantic
    danger:          '#F87171',
    warning:         '#FBBF24',
    success:         Palette.greenMint,
    info:            '#60A5FA',
  },
};

// ─── Platform Font Stacks ────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});
