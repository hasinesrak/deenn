import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@/icons';
import * as Haptics from 'expo-haptics';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/providers/ThemeProvider';
import { EASE_OUT_CSS } from '@/theme/motion';
import { radii } from '@/theme/radii';

import { PressableScale } from './ui/PressableScale';

type Props = {
  canGoBack: boolean;
  canGoForward: boolean;
  indexHint?: number;
  onPrev: () => void;
  onNext: () => void;
};

export function VerseNavigation({ canGoBack, canGoForward, indexHint = 0, onPrev, onNext }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const dots = [0, 1, 2, 3, 4];
  const active = ((indexHint % dots.length) + dots.length) % dots.length;

  return (
    <View style={styles.row}>
      <PressableScale
        accessibilityLabel="Previous verse"
        disabled={!canGoBack}
        hitSlop={6}
        onPress={() => {
          void Haptics.selectionAsync();
          onPrev();
        }}
        style={[
          styles.arrow,
          {
            backgroundColor: colors.surfaceAlt,
            opacity: canGoBack ? 1 : 0.4,
          },
        ]}>
        <HugeiconsIcon color={colors.primary} icon={ArrowLeft01Icon} size={18} />
      </PressableScale>
      <View style={styles.dots}>
        {dots.map((dot) => {
          const isActive = dot === active;
          return (
            <Animated.View
              key={dot}
              style={[
                styles.dot,
                {
                  backgroundColor: isActive ? colors.primary : colors.border,
                  transform: [{ scale: isActive ? 1.15 : 1 }],
                  transitionProperty: 'transform',
                  transitionDuration: reduced ? '0ms' : '140ms',
                  transitionTimingFunction: EASE_OUT_CSS,
                },
              ]}
            />
          );
        })}
      </View>
      <PressableScale
        accessibilityLabel="Next verse"
        disabled={!canGoForward}
        hitSlop={6}
        onPress={() => {
          void Haptics.selectionAsync();
          onNext();
        }}
        style={[
          styles.arrow,
          {
            backgroundColor: colors.surfaceAlt,
            opacity: canGoForward ? 1 : 0.4,
          },
        ]}>
        <HugeiconsIcon color={colors.primary} icon={ArrowRight01Icon} size={18} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
