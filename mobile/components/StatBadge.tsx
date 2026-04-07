/**
 * StatBadge — Metric display card (value + label + delta)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Shadows, Typography } from '@/constants/theme';

interface StatBadgeProps {
  value: string;
  label: string;
  delta?: string;
  deltaGood?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
}

export function StatBadge({
  value,
  label,
  delta,
  deltaGood = true,
  icon,
  accentColor = Palette.greenPrimary,
}: StatBadgeProps) {
  const deltaColor = deltaGood ? Palette.greenPrimary : Palette.danger;

  return (
    <View style={[styles.card, { borderTopColor: accentColor }]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={icon} size={16} color={accentColor} />
        </View>
      )}
      <Text style={styles.value}>{value}</Text>
      {delta && (
        <Text style={[styles.delta, { color: deltaColor }]}>
          {deltaGood ? '↑' : '↓'} {delta}
        </Text>
      )}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderTopWidth: 3,
    borderTopColor: Palette.greenPrimary,
    borderWidth: 1,
    borderColor: '#EEF2F0',
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    ...Typography.h3,
    color: Palette.textPrimary,
    marginBottom: 2,
  },
  delta: {
    ...Typography.caption,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    ...Typography.label,
    color: Palette.textMuted,
  },
});
