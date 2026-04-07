import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import { ThemeOverrideProvider } from '@/context/ThemeOverrideContext';

export default function TabLayout() {
  const { mode } = useAppTheme();
  const C = useAppColors();

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
            shadowColor:      '#000',
            shadowOffset:     { width: 0, height: -2 },
            shadowOpacity:    mode === 'light' ? 0.06 : 0,
            shadowRadius:     8,
            elevation:        8,
          },
          tabBarActiveTintColor:   C.primary,
          tabBarInactiveTintColor: C.tabInactive,
          tabBarLabelStyle: {
            fontSize:   10,
            fontWeight: '700',
            marginBottom: 2,
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
