// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

export type IconSymbolName =
  | 'camera.fill'
  | 'checkmark.circle.fill'
  | 'chevron.left'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'doc.text.magnifyingglass'
  | 'house.fill'
  | 'info.circle.fill'
  | 'paperplane.fill'
  | 'pencil.circle.fill'
  | 'plus'
  | 'plus.circle.fill'
  | 'questionmark.circle.fill'
  | 'trash'
  | 'xmark.circle.fill'
  | 'bubble.left.and.bubble.right.fill';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'bubble.left.and.bubble.right.fill': 'forum',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'checkmark.circle.fill': 'check-circle',
  'doc.text.magnifyingglass': 'manage-search',
  'info.circle.fill': 'info',
  'xmark.circle.fill': 'cancel',
  'camera.fill': 'photo-camera',
  'pencil.circle.fill': 'edit',
  'trash': 'delete',
  'questionmark.circle.fill': 'help',
} as const satisfies Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
