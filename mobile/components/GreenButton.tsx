/**
 * GreenButton — Primary/Secondary/Ghost variants
 * Reusable premium button component for AgriSense Lanka
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Radius, Shadows, Typography, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface GreenButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function GreenButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  style,
  fullWidth = true,
}: GreenButtonProps) {
  const isDisabled = disabled || loading;

  const btnStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
  ];

  const iconColor = variant === 'primary'
    ? '#FFFFFF'
    : variant === 'secondary'
    ? Palette.greenPrimary
    : variant === 'ghost'
    ? Palette.greenPrimary
    : '#FFFFFF';

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <TouchableOpacity
      style={btnStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {iconLeft && (
            <Ionicons name={iconLeft} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={textStyle}>{label}</Text>
          {iconRight && (
            <Ionicons name={iconRight} size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fullWidth: { width: '100%' },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  // Variants
  primary: {
    backgroundColor: Palette.greenPrimary,
    ...Shadows.colored(Palette.greenPrimary),
  },
  secondary: {
    backgroundColor: Palette.greenLight,
    borderWidth: 1.5,
    borderColor: Palette.greenPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Palette.greenPrimary,
  },
  danger: {
    backgroundColor: Palette.danger,
    ...Shadows.colored(Palette.danger),
  },

  // Sizes
  sm: { paddingVertical: 10, paddingHorizontal: Spacing.md },
  md: { paddingVertical: 15, paddingHorizontal: Spacing.lg },
  lg: { paddingVertical: 18, paddingHorizontal: Spacing.xl },

  // Text
  text: { ...Typography.bodyBold, textAlign: 'center' },
  primaryText: { color: '#FFFFFF' },
  secondaryText: { color: Palette.greenPrimary },
  ghostText: { color: Palette.greenPrimary },
  dangerText: { color: '#FFFFFF' },

  smText: { fontSize: 13 },
  mdText: { fontSize: 15 },
  lgText: { fontSize: 16 },

  // Icons
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },

  // States
  disabled: { opacity: 0.55 },
});
