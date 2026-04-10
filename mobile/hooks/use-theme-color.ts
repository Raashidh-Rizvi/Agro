/**
 * useThemeColor
 *
 * Returns the correct colour for the *effective* scheme —
 * either the forced override (set by ThemeOverrideProvider) or the OS preference.
 */
import { Colors } from '@/constants/theme';
import { useEffectiveScheme } from '@/context/ThemeOverrideContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme        = useEffectiveScheme();
  const colorFromProps = props[theme];

  return colorFromProps ?? Colors[theme][colorName];
}
