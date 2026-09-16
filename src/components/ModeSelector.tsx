import { StyleSheet, View } from 'react-native';
import { HugeiconsIcon, type HugeiconsProps } from '@hugeicons/react-native';
import { ArrowRight01Icon, LeftToRightListDashIcon, ShuffleIcon } from '@/icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/providers/ThemeProvider';
import { hexAlpha } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { fonts } from '@/theme/typography';
import type { VerseMode } from '@/types/deen';

import { DeenText } from './ui/DeenText';
import { PressableScale } from './ui/PressableScale';

type Props = {
  mode: VerseMode;
  onChange: (mode: VerseMode) => void;
};

export function ModeSelector({ mode, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <ModeCard
        active={mode === 'random'}
        description="A new verse each time"
        icon={ShuffleIcon}
        label="Random"
        onPress={() => onChange('random')}
      />
      <ModeCard
        active={mode === 'sequential'}
        description="From start to finish"
        icon={LeftToRightListDashIcon}
        label="Sequential"
        onPress={() => onChange('sequential')}
        mutedColor={colors.secondary}
        outlineColor={colors.border}
        surfaceColor={colors.surface}
        textColor={colors.primary}
      />
    </View>
  );
}

function ModeCard({
  active,
  description,
  icon,
  label,
  onPress,
  outlineColor,
  surfaceColor,
  textColor,
  mutedColor,
}: {
  active: boolean;
  description: string;
  icon: HugeiconsProps['icon'];
  label: string;
  onPress: () => void;
  outlineColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedColor?: string;
}) {
  const { colors } = useTheme();
  const filled = active;
  const backgroundColor = filled ? colors.primary : (surfaceColor ?? colors.surface);
  const titleColor = filled ? colors.inverse : (textColor ?? colors.primary);
  const descColor = filled ? hexAlpha(colors.inverse, 0.62) : (mutedColor ?? colors.secondary);
  const iconColor = titleColor;

  return (
    <PressableScale
      accessibilityLabel={`${label}. ${description}`}
      accessibilityState={{ selected: active }}
      onPress={() => {
        if (!active) {
          void Haptics.selectionAsync();
        }
        onPress();
      }}
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: filled ? colors.primary : (outlineColor ?? colors.border),
        },
      ]}>
      <View style={styles.cardTop}>
        <HugeiconsIcon color={iconColor} icon={icon} size={18} />
        <HugeiconsIcon color={iconColor} icon={ArrowRight01Icon} size={16} />
      </View>
      <DeenText color={titleColor} style={styles.label}>
        {label}
      </DeenText>
      <DeenText color={descColor} style={styles.description}>
        {description}
      </DeenText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: radii.large,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
});
