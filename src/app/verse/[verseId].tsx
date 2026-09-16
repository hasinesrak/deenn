import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BookOpen01Icon } from '@/icons';

import { VerseCard } from '@/components/VerseCard';
import { DatabaseError } from '@/components/DatabaseError';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { DeenText } from '@/components/ui/DeenText';
import { PressableScale } from '@/components/ui/PressableScale';
import { getVerseById } from '@/db/quranApi';
import { neighborId } from '@/features/verse/selector';
import { useDeenStore } from '@/providers/DeenStore';
import { useTheme } from '@/providers/ThemeProvider';
import { radii } from '@/theme/radii';
import { fonts } from '@/theme/typography';
import type { Verse } from '@/types/deen';

export default function VerseScreen() {
  const { verseId } = useLocalSearchParams<{ verseId: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { settings, goToVerse } = useDeenStore();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (id: number) => {
    const next = await getVerseById(id);
    if (!next) {
      setError('This verse could not be found.');
      return;
    }
    setVerse(next);
    await goToVerse(next.id);
  };

  const parsedId = Number(verseId);
  const invalidId = !Number.isFinite(parsedId);

  useEffect(() => {
    if (invalidId) {
      return;
    }
    let cancelled = false;
    getVerseById(parsedId)
      .then(async (next) => {
        if (cancelled) {
          return;
        }
        if (!next) {
          setError('This verse could not be found.');
          return;
        }
        setVerse(next);
        await goToVerse(next.id);
      })
      .catch(() => {
        if (!cancelled) {
          setError('This verse could not be loaded.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [goToVerse, invalidId, parsedId]);

  if (invalidId || error) {
    return <DatabaseError message={error ?? 'This verse could not be found.'} />;
  }

  if (!verse) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        },
      ]}>
      <ScreenHeader subtitle="A verse for your day" title="Deen" />
      <VerseCard
        onNext={() => {
          const next = neighborId(verse.id, 1);
          if (next) {
            load(next);
          }
        }}
        onPrev={() => {
          const prev = neighborId(verse.id, -1);
          if (prev) {
            load(prev);
          }
        }}
        meaningLanguage={settings.meaningLanguage}
        pronunciation={settings.pronunciation}
        verse={verse}
      />
      <PressableScale
        onPress={() => router.replace('/')}
        style={[styles.cta, { backgroundColor: colors.primary }]}>
        <HugeiconsIcon color={colors.inverse} icon={BookOpen01Icon} size={18} />
        <DeenText align="center" color={colors.inverse} style={styles.ctaText}>
          Read in Deen
        </DeenText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  cta: {
    marginTop: 'auto',
    borderRadius: radii.pill,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
