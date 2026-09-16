import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { radii } from '@/theme/radii';
import { cardShadow } from '@/theme/shadows';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function Surface({ children, style, padded = true }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.shadow,
        {
          ...cardShadow(isDark),
        },
        style,
      ]}>
      <View
        style={[
          styles.surface,
          padded ? styles.padded : null,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderTopColor: colors.highlight,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radii.xl,
  },
  surface: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: 24,
  },
});
