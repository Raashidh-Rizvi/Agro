import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab({ onPressIn, ...props }: any) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev: any) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}
