import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';
import type { IconSymbolName } from './icon-symbol';

const IOS_SYMBOLS: Record<IconSymbolName, SymbolViewProps['name']> = {
  'house.fill': 'house.fill',
  'paperplane.fill': 'paperplane.fill',
  'chevron.left.forwardslash.chevron.right': 'chevron.left.forwardslash.chevron.right',
  'chevron.right': 'chevron.right',
  'chevron.left': 'chevron.left',
  'bubble.left.and.bubble.right.fill': 'bubble.left.and.bubble.right.fill',
  'plus': 'plus',
  'plus.circle.fill': 'plus.circle.fill',
  'checkmark.circle.fill': 'checkmark.circle.fill',
  'doc.text.magnifyingglass': 'doc.text.magnifyingglass',
  'info.circle.fill': 'info.circle.fill',
  'xmark.circle.fill': 'xmark.circle.fill',
  'camera.fill': 'camera.fill',
  'pencil.circle.fill': 'pencil.circle.fill',
  'trash': 'trash',
  'questionmark.circle.fill': 'questionmark.circle.fill',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={IOS_SYMBOLS[name]}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
