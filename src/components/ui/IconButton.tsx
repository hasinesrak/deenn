import { StyleSheet } from 'react-native';
import { HugeiconsIcon, type HugeiconsProps } from '@hugeicons/react-native';

import { useTheme } from '@/providers/ThemeProvider';
import { radii } from '@/theme/radii';

import { PressableScale } from './PressableScale';

type Props = {
  icon: HugeiconsProps['icon'];
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
};

export function IconButton({ icon, onPress, accessibilityLabel, size = 20 }: Props) {
  const { colors } = useTheme();

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors.glass, borderColor: colors.border }]}>
      <HugeiconsIcon color={colors.primary} icon={icon} size={size} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
