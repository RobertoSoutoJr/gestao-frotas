import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type Colors } from '../lib/theme';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: Colors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = '@fueltrack_theme';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [loaded, setLoaded] = useState(false);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          setModeState(saved);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const isDark = useMemo(() => {
    if (mode === 'system') return systemScheme !== 'light';
    return mode === 'dark';
  }, [mode, systemScheme]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, colors, setMode, toggleTheme }),
    [mode, isDark, colors, setMode, toggleTheme],
  );

  // Don't render until we load the saved preference to avoid flash
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Get the current color palette (most common hook) */
export function useColors(): Colors {
  return useContext(ThemeContext).colors;
}

/** Get full theme context (mode, isDark, toggleTheme, setMode) */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Helper: memoize a styles factory that depends on colors.
 * Usage:
 *   const createStyles = (c: Colors) => StyleSheet.create({ ... });
 *   // inside component:
 *   const styles = useStyles(createStyles);
 */
export function useStyles<T>(factory: (c: Colors) => T): T {
  const colors = useColors();
  // factory is a module-level function → stable reference
  return useMemo(() => factory(colors), [colors, factory]);
}
