import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/theme/colors';
import type { ThemePreference } from '@/types/deen';

export function resolveScheme(
  preference: ThemePreference,
  system: string | null | undefined
): 'light' | 'dark' {
  if (preference === 'system') {
    return system === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export function useAppTheme(preference: ThemePreference): {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  isDark: boolean;
} {
  const system = useColorScheme();
  const scheme = resolveScheme(preference, system);

  return useMemo(
    () => ({
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      isDark: scheme === 'dark',
    }),
    [scheme]
  );
}
