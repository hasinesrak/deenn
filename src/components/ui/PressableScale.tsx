import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT_CSS } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({
  children,
  style,
  onPressIn,
  onPressOut,
  disabled,
  pressRetentionOffset = 16,
  ...rest
}: Props) {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const active = pressed && !disabled;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      android_ripple={{ color: 'transparent' }}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          setPressed(true);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      pressRetentionOffset={pressRetentionOffset}
      style={[
        style,
        reduced
          ? { opacity: active ? 0.82 : 1 }
          : {
              transform: [{ scale: active ? 0.97 : 1 }],
              transitionProperty: ['transform', 'backgroundColor', 'borderColor', 'opacity'],
              transitionDuration: active ? '100ms' : '160ms',
              transitionTimingFunction: EASE_OUT_CSS,
            },
      ]}>
      {children}
    </AnimatedPressable>
  );
}
