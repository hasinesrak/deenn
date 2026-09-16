import { Platform, ViewStyle } from 'react-native';

export function cardShadow(isDark: boolean): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation: isDark ? 3 : 8 };
  }

  return {
    shadowColor: isDark ? '#000000' : '#17231D',
    shadowOpacity: isDark ? 0.32 : 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  };
}
