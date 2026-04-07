/**
 * ThemeOverrideContext
 *
 * Allows individual screens / layouts to force a specific colour scheme
 * ('light' or 'dark') regardless of the OS preference.
 *
 * Usage:
 *   <ThemeOverrideProvider scheme="dark">
 *     <MyScreen />
 *   </ThemeOverrideProvider>
 *
 * In any component under the provider, call:
 *   const scheme = useEffectiveScheme();  // returns 'dark' | 'light'
 */
import React, { createContext, useContext } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ColorScheme = 'light' | 'dark';

const ThemeOverrideContext = createContext<ColorScheme | null>(null);

export function ThemeOverrideProvider({
  scheme,
  children,
}: {
  scheme: ColorScheme;
  children: React.ReactNode;
}) {
  return (
    <ThemeOverrideContext.Provider value={scheme}>
      {children}
    </ThemeOverrideContext.Provider>
  );
}

/**
 * Returns the effective colour scheme:
 * – the forced override if one is set, otherwise
 * – the OS preference (defaulting to 'light').
 */
export function useEffectiveScheme(): ColorScheme {
  const override = useContext(ThemeOverrideContext);
  const os       = useColorScheme() ?? 'light';
  return override ?? os;
}
