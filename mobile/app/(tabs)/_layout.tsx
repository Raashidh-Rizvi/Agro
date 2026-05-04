import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import { ThemeOverrideProvider } from '@/context/ThemeOverrideContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { mode } = useAppTheme();
  const C = useAppColors();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const isExpert = user?.role === 'Expert' || user?.role === 'Admin';

  return (
    <ThemeOverrideProvider scheme={mode}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor:  C.tabBar,
            borderTopColor:   C.tabBorder,
            borderTopWidth:   1,
            ...Platform.select({
              web: {
                boxShadow: mode === 'light' ? '0px -2px 8px rgba(0,0,0,0.06)' : 'none',
                height: 64,
                paddingBottom: 0,
                paddingTop: 0,
              },
              default: {
                shadowColor:   '#000',
                shadowOffset:  { width: 0, height: -2 },
                shadowOpacity: mode === 'light' ? 0.06 : 0,
                shadowRadius:  8,
                elevation:     8,
              }
            }),
            height:        Platform.OS === 'web' ? 64 : 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop:    8,
          },
          tabBarActiveTintColor:   C.primary,
          tabBarInactiveTintColor: C.tabInactive,
          tabBarLabelStyle: {
            fontSize:   10,
            fontWeight: '700',
            marginBottom: Platform.OS === 'web' ? 5 : 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="crops"
          options={{
            title: 'Crops',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Market',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expert-queries"
          options={{
            title: isExpert ? 'Dashboard' : 'Queries',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={isExpert ? (focused ? 'speedometer' : 'speedometer-outline') : (focused ? 'chatbubbles' : 'chatbubbles-outline')} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeOverrideProvider>
  );
}
