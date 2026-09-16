import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarInset } from '@/components/TabBar';
import { VerseCard } from '@/components/VerseCard';
import { DeenText } from '@/components/ui/DeenText';
import { PressableScale } from '@/components/ui/PressableScale';
import { useDeenStore } from '@/providers/DeenStore';
import { useTheme } from '@/providers/ThemeProvider';
import { hexAlpha } from '@/theme/colors';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { colors, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { verse, settings, goNeighbor, reachedEnd, resetSequential, showRandomVerse } = useDeenStore();
  const isDesktop = screenWidth >= 768;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Image contentFit="cover" source={require('../../../assets/images/home-landscape.jpg')} style={styles.art} />
      {isDark ? <View pointerEvents="none" style={[styles.artDim, { backgroundColor: hexAlpha('#111612', 0.42) }]} /> : null}
      <LinearGradient
        colors={[colors.background, hexAlpha(colors.background, 0)] as const}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.artFadeX}
      />
      <LinearGradient
        colors={[hexAlpha(colors.background, 0), colors.background] as const}
        pointerEvents="none"
        style={styles.artFadeY}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: tabBarInset + 20,
            maxWidth: isDesktop ? 680 : undefined,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <DeenText variant="brand">Deen</DeenText>
        </View>

        {verse ? (
          <VerseCard
            meaningLanguage={settings.meaningLanguage}
            onNext={() => goNeighbor(1)}
            onPrev={() => goNeighbor(-1)}
            onShuffle={() => showRandomVerse()}
            pronunciation={settings.pronunciation}
            verse={verse}
          />
        ) : null}

        {reachedEnd && settings.verseMode === 'sequential' ? (
          <PressableScale
            onPress={() => resetSequential()}
            style={[styles.endCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <DeenText align="center" style={styles.endTitle}>
              You&apos;ve reached the end of the Quran.
            </DeenText>
            <DeenText align="center" color={colors.accent} style={styles.endAction}>
              Start again
            </DeenText>
          </PressableScale>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  art: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '78%',
    height: 340,
  },
  artDim: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '78%',
    height: 340,
  },
  artFadeX: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '58%',
    height: 340,
  },
  artFadeY: {
    position: 'absolute',
    top: 210,
    left: 0,
    right: 0,
    height: 140,
  },
  content: {
    paddingHorizontal: 20,
    gap: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  endCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  endTitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  endAction: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
});
