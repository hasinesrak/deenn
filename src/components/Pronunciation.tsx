import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { fonts } from '@/theme/typography';
import type { Pronunciation as PronunciationMode, Verse } from '@/types/deen';

import { DeenText } from './ui/DeenText';

export function Pronunciation({ verse, mode }: { verse: Verse; mode: PronunciationMode }) {
  const { colors } = useTheme();
  const showEnglish = mode === 'english' || mode === 'both';
  const showBengali = mode === 'bengali' || mode === 'both';

  return (
    <View style={styles.wrap}>
      {showEnglish ? (
        <DeenText
          align="center"
          color={colors.secondary}
          style={{ fontFamily: fonts.meaningItalic, fontSize: 16, lineHeight: 24, fontStyle: 'italic' }}>
          {verse.transliterationEn}
        </DeenText>
      ) : null}
      {showBengali ? (
        <DeenText
          align="center"
          color={colors.secondary}
          style={{ fontFamily: fonts.bengali, fontSize: 15, lineHeight: 24 }}>
          {verse.transliterationBn}
        </DeenText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    alignItems: 'center',
  },
});
