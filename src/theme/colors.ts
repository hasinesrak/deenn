export const lightColors = {
  background: '#F4F1E9',
  surface: '#FBFAF6',
  surfaceAlt: '#ECE9DF',
  primary: '#17231D',
  secondary: '#68736B',
  muted: '#929890',
  accent: '#52685A',
  accentSoft: '#DDE3D9',
  border: '#E1DED4',
  inverse: '#FBFAF6',
  overlay: 'rgba(23, 35, 29, 0.06)',
  glass: 'rgba(251, 250, 246, 0.78)',
  highlight: 'rgba(255, 255, 255, 0.62)',
};

export const darkColors = {
  background: '#111612',
  surface: '#191F1A',
  surfaceAlt: '#222922',
  primary: '#F4F1E8',
  secondary: '#AAB2AA',
  muted: '#7E887F',
  accent: '#91A993',
  accentSoft: '#303A31',
  border: '#303731',
  inverse: '#111612',
  overlay: 'rgba(244, 241, 232, 0.06)',
  glass: 'rgba(25, 31, 26, 0.82)',
  highlight: 'rgba(255, 255, 255, 0.08)',
};

export type ThemeColors = typeof lightColors;

export function hexAlpha(hex: string, alpha: number): string {
  const clamped = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  return `${hex}${clamped.toString(16).padStart(2, '0')}`;
}
