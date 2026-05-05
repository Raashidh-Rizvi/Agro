import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors, useAppTheme } from '@/context/AppThemeContext';
import { ThemeOverrideProvider } from '@/context/ThemeOverrideContext';
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
            backgroundColor: C.tabBar,
            borderTopColor: C.tabBorder,
            borderTopWidth: 1,
            overflow: 'hidden',
            ...Platform.select({
              web: {
                boxShadow: mode === 'light'
                  ? '0px -2px 16px rgba(11,107,58,0.10), 0px -1px 4px rgba(0,0,0,0.05)'
                  : '0px -2px 16px rgba(0,0,0,0.40)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                height: 72,
                paddingBottom: 0,
                paddingTop: 0,
              },
              default: {
                shadowColor: mode === 'dark' ? '#000' : '#0B6B3A',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: mode === 'light' ? 0.08 : 0.45,
                shadowRadius: 16,
                elevation: 16,
              }
            }),
            height: Platform.OS === 'web' ? 72 : 62 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: C.primary,
          tabBarInactiveTintColor: C.tabInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.2,
            marginBottom: Platform.OS === 'web' ? 6 : 2,
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      >
        {/* ── Visible Tabs ── */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="crops"
          options={{
            title: 'Crops',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Market',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="market-insight"
          options={{
            title: 'Prices',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'trending-up' : 'trending-up-outline'} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expert-queries"
          options={{
            title: isExpert ? 'Dashboard' : 'Queries',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={isExpert
                  ? (focused ? 'speedometer' : 'speedometer-outline')
                  : (focused ? 'chatbubbles' : 'chatbubbles-outline')}
                size={26}
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
              <Ionicons name={focused ? 'person' : 'person-outline'} size={26} color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeOverrideProvider>
  );
}

const styles = StyleSheet.create({});
