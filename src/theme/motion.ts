import { Easing, cubicBezier } from 'react-native-reanimated';

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export const EASE_OUT_CSS = cubicBezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT_CSS = cubicBezier(0.77, 0, 0.175, 1);

export const PRESS_IN_MS = 100;
export const PRESS_OUT_MS = 160;
export const PILL_MS = 200;
export const FADE_MS = 160;
export const STEP_IN_MS = 260;
export const STEP_OUT_MS = 200;

export const SPRING_SNAP = { duration: 400, dampingRatio: 0.8 } as const;
export const SPRING_SETTLE = { duration: 400, dampingRatio: 1 } as const;

export function project(velocity: number, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
