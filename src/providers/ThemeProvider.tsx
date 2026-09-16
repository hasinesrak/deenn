import { createContext, useContext, type ReactNode } from 'react';

import type { ThemeColors } from '@/theme/colors';
import { lightColors } from '@/theme/colors';
import { useAppTheme } from '@/hooks/useTheme';
import type { ThemePreference } from '@/types/deen';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  scheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  scheme: 'light',
});

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: ReactNode;
}) {
  const theme = useAppTheme(preference);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
