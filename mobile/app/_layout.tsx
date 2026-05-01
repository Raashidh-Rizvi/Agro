import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppThemeProvider, useAppTheme } from '../context/AppThemeContext';


// ─── Navigation Themes ────────────────────────────────────────────────────────
const AgriLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary:      '#0F9D58',
    background:   '#F4F9F6',
    card:         '#FFFFFF',
    text:         '#0D1F17',
    border:       '#E2EDE8',
    notification: '#0F9D58',
  },
};

const AgriDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary:      '#34C759',
    background:   '#0A0F0D',
    card:         '#141F18',
    text:         '#E8F0EC',
    border:       '#243020',
    notification: '#0F9D58',
  },
};

// ─── Auth Guard ───────────────────────────────────────────────────────────────
function RootLayoutNav() {
  const { user, isInitializing } = useAuth();
  const segments = useSegments();
  const router   = useRouter();

  const inAuthGroup = segments[0] === '(auth)';
  const inTabs      = segments[0] === '(tabs)';

  useEffect(() => {
    if (isInitializing) return;
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isInitializing, segments, router, inAuthGroup]);

  return (
    <>
      <StatusBar style={inTabs ? 'auto' : 'light'} />
      <Stack>
        <Stack.Screen name="(auth)/login"    options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
        <Stack.Screen name="modal"           options={{ presentation: 'modal', title: 'Info' }} />
      </Stack>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootLayoutInner />
      </AuthProvider>
    </AppThemeProvider>
  );
}

function RootLayoutInner() {
  const { mode } = useAppTheme();
  const theme = mode === 'dark' ? AgriDarkTheme : AgriLightTheme;

  return (
    <ThemeProvider value={theme}>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
