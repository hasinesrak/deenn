import { type Ref, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import { HugeiconsIcon, type HugeiconsProps } from '@hugeicons/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/providers/ThemeProvider';
import { EASE_OUT_CSS } from '@/theme/motion';
import { fonts } from '@/theme/typography';

import { DeenText } from './ui/DeenText';

export const TAB_BAR_CONTENT_HEIGHT = 72;

export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_CONTENT_HEIGHT + Math.max(insets.bottom, 10);
}

type TabIcon = HugeiconsProps['icon'];

type TabButtonProps = TabTriggerSlotProps & {
  icon: TabIcon;
  focusedIcon: TabIcon;
  ref?: Ref<View>;
};

export function TabButton({
  children,
  icon,
  focusedIcon,
  isFocused,
  ref,
  style: _style,
  onPress,
  ...props
}: TabButtonProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      android_ripple={{ color: 'transparent' }}
      pressRetentionOffset={12}
      style={styles.tab}
      {...props}
      onPress={(event) => {
        if (!isFocused) {
          void Haptics.selectionAsync();
        }
        onPress?.(event);
      }}
      onPressIn={(event) => {
        setPressed(true);
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        props.onPressOut?.(event);
      }}>
      <Animated.View
        style={[
          styles.tabInner,
          reduced
            ? null
            : {
                transform: [{ scale: pressed ? 0.97 : 1 }],
                transitionProperty: 'transform',
                transitionDuration: pressed ? '100ms' : '140ms',
                transitionTimingFunction: EASE_OUT_CSS,
              },
        ]}>
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: colors.primary,
              opacity: isFocused ? 1 : 0,
              transform: [{ scaleX: isFocused ? 1 : 0.95 }],
              transitionProperty: ['opacity', 'transform'],
              transitionDuration: reduced ? '0ms' : '140ms',
              transitionTimingFunction: EASE_OUT_CSS,
            },
          ]}
        />
        <HugeiconsIcon
          altIcon={focusedIcon}
          color={isFocused ? colors.primary : colors.muted}
          icon={icon}
          showAlt={Boolean(isFocused)}
          size={32}
          strokeWidth={isFocused ? 2 : 1.5}
        />
        <DeenText
          color={isFocused ? colors.primary : colors.muted}
          style={[styles.label, { fontFamily: isFocused ? fonts.uiSemiBold : fonts.uiMedium }]}>
          {children}
        </DeenText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
  },
  tabInner: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  indicator: {
    width: 22,
    height: 3,
    borderRadius: 2,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
