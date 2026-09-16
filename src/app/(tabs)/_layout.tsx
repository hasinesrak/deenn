import { StyleSheet } from 'react-native';
import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home01Icon,
  Home02Icon,
  Quran01Icon,
  Quran02Icon,
  Settings01Icon,
  Settings02Icon,
} from '@/icons';

import { TabButton } from '@/components/TabBar';
import { useTheme } from '@/providers/ThemeProvider';
import { hexAlpha } from '@/theme/colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Tabs style={[styles.tabs, { backgroundColor: colors.background }]}>
      <TabSlot style={styles.slot} />
      <TabList
        style={[
          styles.list,
          {
            backgroundColor: colors.background,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}>
        <LinearGradient
          colors={[hexAlpha(colors.background, 0), colors.background] as const}
          pointerEvents="none"
          style={styles.fade}
        />
        <TabTrigger asChild href="/" name="home">
          <TabButton focusedIcon={Home02Icon} icon={Home01Icon}>
            Home
          </TabButton>
        </TabTrigger>
        <TabTrigger asChild href="/quran" name="quran">
          <TabButton focusedIcon={Quran02Icon} icon={Quran01Icon}>
            Quran
          </TabButton>
        </TabTrigger>
        <TabTrigger asChild href="/settings" name="settings">
          <TabButton focusedIcon={Settings02Icon} icon={Settings01Icon}>
            Settings
          </TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  list: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
    zIndex: 20,
  },
  fade: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    height: 28,
  },
});
