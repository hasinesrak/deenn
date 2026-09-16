import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@/icons';

import { useTheme } from '@/providers/ThemeProvider';
import { fonts } from '@/theme/typography';

import { DeenText } from './DeenText';
import { PressableScale } from './PressableScale';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, subtitle, onBack }: Props) {
  const { colors } = useTheme();
  const goBack = onBack ?? (() => router.back());

  return (
    <View style={styles.header}>
      <PressableScale
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={goBack}
        style={[styles.back, { borderColor: colors.border, backgroundColor: colors.glass }]}>
        <HugeiconsIcon color={colors.primary} icon={ArrowLeft01Icon} size={20} />
      </PressableScale>
      <View style={styles.titles}>
        <DeenText variant="title">{title}</DeenText>
        {subtitle ? (
          <DeenText color={colors.secondary} style={{ fontFamily: fonts.ui, fontSize: 14, letterSpacing: 0.1 }}>
            {subtitle}
          </DeenText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 16,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
  },
});
