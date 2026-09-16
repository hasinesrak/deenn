import { Text, type TextProps, type TextStyle } from 'react-native';

import { fonts, typeScale } from '@/theme/typography';
import { useTheme } from '@/providers/ThemeProvider';

type Variant = 'brand' | 'display' | 'title' | 'body' | 'callout' | 'caption' | 'micro' | 'arabic' | 'meaning';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
};

const variantFonts: Record<Variant, string> = {
  brand: fonts.brand,
  display: fonts.meaning,
  title: fonts.uiSemiBold,
  body: fonts.ui,
  callout: fonts.ui,
  caption: fonts.uiMedium,
  micro: fonts.uiMedium,
  arabic: fonts.arabic,
  meaning: fonts.meaning,
};

export function DeenText({ variant = 'body', color, align, style, ...rest }: Props) {
  const { colors } = useTheme();
  const scale =
    variant === 'arabic'
      ? typeScale.arabic
      : variant === 'meaning' || variant === 'display'
        ? typeScale[variant === 'meaning' ? 'title' : 'display']
        : typeScale[variant];

  return (
    <Text
      style={[
        {
          fontFamily: variantFonts[variant],
          color: color ?? colors.primary,
          textAlign: align,
          ...scale,
        },
        variant === 'micro' || variant === 'caption' ? { textTransform: 'uppercase' } : null,
        style,
      ]}
      {...rest}
    />
  );
}
