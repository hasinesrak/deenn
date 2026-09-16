import { StyleSheet, View } from 'react-native';

import { fonts } from '@/theme/typography';
import { useTheme } from '@/providers/ThemeProvider';
import type { MeaningLanguage, Verse } from '@/types/deen';

import { DeenText } from './ui/DeenText';

type Props = {
  verse: Pick<Verse, 'meaningEn' | 'meaningBn'>;
  language: MeaningLanguage;
  fontSize?: number;
};

export function Meaning({ verse, language, fontSize = 20 }: Props) {
  const { colors } = useTheme();
  const showEnglish = language === 'english' || language === 'both';
  const showBengali = (language === 'bengali' || language === 'both') && verse.meaningBn;

  if (!showEnglish && !showBengali) {
    return (
      <DeenText
        align="center"
        color={colors.primary}
        style={{ fontFamily: fonts.meaning, fontSize, lineHeight: fontSize * 1.5 }}>
        {verse.meaningEn}
      </DeenText>
    );
  }

  return (
    <View style={styles.wrap}>
      {showEnglish ? (
        <DeenText
          align="center"
          color={colors.primary}
          style={{ fontFamily: fonts.meaning, fontSize, lineHeight: fontSize * 1.5 }}>
          {verse.meaningEn}
        </DeenText>
      ) : null}
      {showBengali ? (
        <DeenText
          align="center"
          color={colors.secondary}
          style={{ fontFamily: fonts.bengali, fontSize: Math.max(15, fontSize - 2), lineHeight: fontSize * 1.55 }}>
          {verse.meaningBn}
        </DeenText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    alignItems: 'center',
  },
});
