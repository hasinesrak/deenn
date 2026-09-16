import { StyleSheet, type TextStyle } from 'react-native';

import { fonts, typeScale } from '@/theme/typography';
import { useTheme } from '@/providers/ThemeProvider';

import { DeenText } from './ui/DeenText';

export function ArabicVerse({
  text,
  large = false,
  align = 'right',
  fontSize,
  lineHeight,
}: {
  text: string;
  large?: boolean;
  align?: TextStyle['textAlign'];
  fontSize?: number;
  lineHeight?: number;
}) {
  const { colors } = useTheme();
  const base = large ? typeScale.arabicLarge : typeScale.arabic;

  return (
    <DeenText
      align={align}
      color={colors.primary}
      style={[styles.arabic, base, { fontFamily: fonts.arabicBold }, fontSize ? { fontSize, lineHeight: lineHeight ?? fontSize * 1.7 } : null]}
      variant="arabic">
      {text}
    </DeenText>
  );
}

const styles = StyleSheet.create({
  arabic: {
    writingDirection: 'rtl',
  },
});
