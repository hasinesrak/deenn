import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

import { DeenText } from './ui/DeenText';

export function DatabaseError({ message }: { message?: string }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <DeenText variant="title" align="center">
        We couldn&apos;t load the Quran library.
      </DeenText>
      <DeenText align="center" color={colors.secondary} style={styles.body}>
        {message ?? 'Please restart Deen.'}
      </DeenText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
