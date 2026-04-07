/**
 * PremiumCard — Elevated white card with optional accent border
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Palette, Radius, Shadows } from '@/constants/theme';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'tinted' | 'outlined';
  accentColor?: string;
  accentPosition?: 'left' | 'top' | 'bottom';
  padding?: number;
}

export function PremiumCard({
  children,
  style,
  variant = 'default',
  accentColor,
  accentPosition = 'left',
  padding = 16,
}: PremiumCardProps) {
  const hasAccent = !!accentColor;

  return (
    <View
      style={[
        styles.card,
        variant === 'tinted' && styles.tinted,
        variant === 'outlined' && styles.outlined,
        hasAccent && accentPosition === 'left' && {
          borderLeftWidth: 4,
          borderLeftColor: accentColor,
        },
        hasAccent && accentPosition === 'top' && {
          borderTopWidth: 4,
          borderTopColor: accentColor,
        },
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2F0',
    ...Shadows.sm,
  },
  tinted: {
    backgroundColor: Palette.greenLight,
    borderColor: '#D0EAD8',
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Palette.greenPrimary,
    ...Shadows.xs,
  },
});
