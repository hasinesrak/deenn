import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArabicVerse } from '@/components/ArabicVerse';
import { Meaning } from '@/components/Meaning';
import { Pronunciation } from '@/components/Pronunciation';
import { DatabaseError } from '@/components/DatabaseError';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { DeenText } from '@/components/ui/DeenText';
import { PressableScale } from '@/components/ui/PressableScale';
import { getSurahById, getVersesForSurah } from '@/db/quranApi';
import { useDeenStore } from '@/providers/DeenStore';
import { useTheme } from '@/providers/ThemeProvider';
import { fonts } from '@/theme/typography';
import type { Surah, Verse } from '@/types/deen';

export default function SurahScreen() {
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { settings, goToVerse } = useDeenStore();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const surahNumber = Number(surahId);
  const invalidId = !Number.isFinite(surahNumber);

  useEffect(() => {
    if (invalidId) {
      return;
    }

    let cancelled = false;
    Promise.all([getSurahById(surahNumber), getVersesForSurah(surahNumber)])
      .then(([nextSurah, nextVerses]) => {
        if (cancelled) {
          return;
        }
        if (!nextSurah) {
          setError('This surah could not be found.');
          return;
        }
        setSurah(nextSurah);
        setVerses(nextVerses);
      })
      .catch(() => {
        if (!cancelled) {
          setError('This surah could not be loaded.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [invalidId, surahNumber]);

  if (invalidId || error) {
    return <DatabaseError message={error ?? 'This surah could not be found.'} />;
  }

  if (!surah) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
      <View style={styles.pad}>
        <ScreenHeader subtitle={`${surah.verseCount} verses`} title={surah.name} />
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={verses}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.verse, { borderBottomColor: colors.border }]}>
            <DeenText color={colors.muted} style={styles.ayah}>
              {item.ayahNumber}
            </DeenText>
            <ArabicVerse text={item.arabic} />
            <Pronunciation mode={settings.pronunciation} verse={item} />
            <Meaning language={settings.meaningLanguage} verse={item} />
            <PressableScale
              onPress={() => {
                void goToVerse(item.id).then(() => router.replace('/'));
              }}
              style={[styles.use, { backgroundColor: colors.accentSoft }]}>
              <DeenText color={colors.accent} style={styles.useText}>
                Show on Home
              </DeenText>
            </PressableScale>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  pad: {
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  verse: {
    paddingVertical: 28,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  ayah: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  use: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  useText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
  },
});
