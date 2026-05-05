/**
 * AGRISENSE LANKA — PREMIUM DESIGN TOKENS
 * Modern | Premium | Trustworthy | Mobile-First
 *
 * Primary Brand:   #0F9D58  (Google Green / Growth)
 * Dark Green:      #0B6B3A  (Depth / Navigation)
 * Light Green:     #E6F4EA  (Surface tints)
 * Accent:          #34C759  (Success / Highlights)
 * Background:      #FFFFFF  (Clean white)
 * Dark Mode:       #070C09  (Deep charcoal-green)
 */

import { Platform } from 'react-native';

// ─── Core Palette ──────────────────────────────────────────────────────────────
export const Palette = {
  // Primary Brand Greens
  greenPrimary:  '#0F9D58',   // Main brand — buttons, CTAs, active states
  greenDark:     '#0B6B3A',   // Deep — headings, gradients top color
  greenDeeper:   '#096040',   // Darkest — gradient stop
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
  grayBg:       '#F4F9F6',   // subtle off-white page background
  grayCard:     '#FFFFFF',   // card surface
  grayBorder:   '#E2EDE8',   // subtle borders
  grayMuted:    '#F0F7F3',   // muted surface / skeleton

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
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(11, 107, 58, 0.06)' },
      default: {
        shadowColor: '#0B6B3A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      }
    }),
    elevation: 2,
  },
  sm: {
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(11, 107, 58, 0.10)' },
      default: {
        shadowColor: '#0B6B3A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
      }
    }),
    elevation: 4,
  },
  md: {
    ...Platform.select({
      web: { boxShadow: '0px 8px 20px rgba(11, 107, 58, 0.13)' },
      default: {
        shadowColor: '#0B6B3A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.13,
        shadowRadius: 20,
      }
    }),
    elevation: 8,
  },
  lg: {
    ...Platform.select({
      web: { boxShadow: '0px 16px 32px rgba(11, 107, 58, 0.16)' },
      default: {
        shadowColor: '#0B6B3A',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.16,
        shadowRadius: 32,
      }
    }),
    elevation: 12,
  },
  xl: {
    ...Platform.select({
      web: { boxShadow: '0px 24px 48px rgba(11, 107, 58, 0.20)' },
      default: {
        shadowColor: '#0B6B3A',
        shadowOffset: { width: 0, height: 24 },
        shadowOpacity: 0.20,
        shadowRadius: 48,
      }
    }),
    elevation: 18,
  },
  colored: (color: string) => ({
    ...Platform.select({
      web: { boxShadow: `0px 8px 20px ${color}40` },
      default: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 20,
      }
    }),
    elevation: 10,
  }),
  glow: (color: string) => ({
    ...Platform.select({
      web: { boxShadow: `0px 0px 24px ${color}55, 0px 8px 24px ${color}35` },
      default: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
      }
    }),
    elevation: 12,
  }),
};

// ─── Border Radius Tokens ──────────────────────────────────────────────────────
export const Radius = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   24,
  xxl:  32,
  pill: 999,
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
  h1:        { fontSize: 36, fontWeight: '800' as const, letterSpacing: -1.0, lineHeight: 42 },
  h2:        { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.6, lineHeight: 34 },
  h3:        { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 28 },
  h4:        { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body:      { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold:  { fontSize: 15, fontWeight: '700' as const, lineHeight: 22 },
  small:     { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  smallBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  caption:   { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.4, lineHeight: 15 },
  label:     { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.0, textTransform: 'uppercase' as const },
  price:     { fontSize: 17, fontWeight: '800' as const, letterSpacing: -0.3 },
};

// ─── Gradient Pairs (for use with LinearGradient or decoration) ───────────────
export const Gradients = {
  greenPrimary: ['#13B463', '#0F9D58', '#0B6B3A'] as const,
  greenDark:    ['#0F9D58', '#0B6B3A', '#096040'] as const,
  greenSubtle:  ['#E6F4EA', '#D1EBD9'] as const,
  darkBg:       ['#0A1410', '#070C09'] as const,
  cardDark:     ['#182318', '#121A15'] as const,
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
    divider:         '#EEF5F0',
    // Semantic
    danger:          Palette.danger,
    warning:         Palette.warning,
    success:         Palette.greenPrimary,
    info:            Palette.info,
  },
  dark: {
    // Text
    text:            '#E8F0EC',
    subtext:         '#7DA090',
    placeholder:     '#4A6358',
    // Backgrounds
    background:      '#070C09',
    card:            '#121A15',
    cardTint:        '#1A2E22',
    surface:         '#182318',
    // Brand
    tint:            Palette.greenAccent,
    primary:         Palette.greenPrimary,
    primaryDark:     Palette.greenDark,
    primaryLight:    Palette.greenLight,
    accent:          Palette.greenAccent,
    // UI
    icon:            '#7DA090',
    tabIconDefault:  '#4A6358',
    tabIconSelected: Palette.greenAccent,
    border:          '#1E3528',
    divider:         '#1A2A1E',
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
