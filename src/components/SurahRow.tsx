import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { fonts } from '@/theme/typography';
import type { Surah } from '@/types/deen';

import { DeenText } from './ui/DeenText';
import { PressableScale } from './ui/PressableScale';

export function SurahRow({ surah, onPress }: { surah: Surah; onPress: () => void }) {
  const { colors } = useTheme();
  const number = String(surah.id).padStart(2, '0');

  return (
    <PressableScale
      accessibilityLabel={`${surah.name}, ${surah.verseCount} verses`}
      hitSlop={4}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: colors.border }]}>
      <DeenText color={colors.muted} style={styles.number}>
        {number}
      </DeenText>
      <View style={styles.names}>
        <DeenText style={styles.name}>{surah.name}</DeenText>
        <DeenText color={colors.secondary} style={styles.meta}>
          {surah.translatedName ?? surah.revelationType ?? ''}
        </DeenText>
      </View>
      <DeenText color={colors.muted} style={styles.count}>
        {surah.verseCount}
      </DeenText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  number: {
    width: 36,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  names: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  count: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
  },
});
