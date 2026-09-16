import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/providers/ThemeProvider';
import { EASE_IN_OUT, PILL_MS } from '@/theme/motion';
import { radii } from '@/theme/radii';
import { fonts } from '@/theme/typography';

import { DeenText } from './DeenText';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

const TRACK_PAD = 4;
const TRACK_GAP = 4;

export function SegmentedControl<T extends string>({ value, options, onChange }: Props<T>) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const hasLaidOut = useRef(false);
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const count = options.length;

  useEffect(() => {
    if (trackWidth <= 0 || count === 0) {
      return;
    }

    const inner = trackWidth - TRACK_PAD * 2 - TRACK_GAP * (count - 1);
    const itemWidth = inner / count;
    const nextX = TRACK_PAD + index * (itemWidth + TRACK_GAP);
    const duration = reduced || !hasLaidOut.current ? 0 : PILL_MS;

    w.set(withTiming(itemWidth, { duration, easing: EASE_IN_OUT }));
    x.set(withTiming(nextX, { duration, easing: EASE_IN_OUT }));
    hasLaidOut.current = true;
  }, [count, index, reduced, trackWidth, w, x]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }],
    width: w.get(),
  }));

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.row, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          pillStyle,
        ]}
      />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            android_ripple={{ color: 'transparent' }}
            hitSlop={4}
            onPress={() => {
              if (option.value === value) {
                return;
              }
              void Haptics.selectionAsync();
              onChange(option.value);
            }}
            pressRetentionOffset={8}
            style={styles.option}>
            <DeenText
              color={selected ? colors.primary : colors.secondary}
              style={{
                fontFamily: selected ? fonts.uiSemiBold : fonts.uiMedium,
                fontSize: 14,
                lineHeight: 20,
              }}>
              {option.label}
            </DeenText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    padding: TRACK_PAD,
    gap: TRACK_GAP,
    borderWidth: 1,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: TRACK_PAD,
    bottom: TRACK_PAD,
    left: 0,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  option: {
    flex: 1,
    borderRadius: radii.pill,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
});
