import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ShuffleIcon } from '@/icons';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/providers/ThemeProvider';
import { FADE_MS, project, rubberband, SPRING_SNAP } from '@/theme/motion';
import { TOTAL_VERSES, type MeaningLanguage, type Pronunciation as PronunciationMode, type Verse } from '@/types/deen';

import { ArabicVerse } from './ArabicVerse';
import { Meaning } from './Meaning';
import { Pronunciation } from './Pronunciation';
import { VerseNavigation } from './VerseNavigation';
import { DeenText } from './ui/DeenText';
import { PressableScale } from './ui/PressableScale';
import { Surface } from './ui/Surface';

type Props = {
  verse: Verse;
  pronunciation: PronunciationMode;
  meaningLanguage: MeaningLanguage;
  onPrev: () => void;
  onNext: () => void;
  onShuffle?: () => void;
};

function fittedSizes(arabicLength: number, meaningLength: number, screenWidth: number) {
  const narrow = screenWidth < 380;
  let arabic = narrow ? 30 : 34;
  if (arabicLength > 220) {
    arabic = narrow ? 20 : 22;
  } else if (arabicLength > 140) {
    arabic = narrow ? 23 : 25;
  } else if (arabicLength > 70) {
    arabic = narrow ? 27 : 30;
  }
  let meaning = narrow ? 18 : 20;
  if (meaningLength > 220) {
    meaning = 15;
  } else if (meaningLength > 140) {
    meaning = 16;
  } else if (meaningLength > 80) {
    meaning = 17;
  }
  return { arabic, arabicLineHeight: Math.round(arabic * 1.75), meaning };
}

export function VerseCard({ verse, pronunciation, meaningLanguage, onPrev, onNext, onShuffle }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);
  const width = useSharedValue(320);
  const canBack = useSharedValue(verse.id > 1);
  const canFwd = useSharedValue(verse.id < TOTAL_VERSES);

  useEffect(() => {
    canBack.set(verse.id > 1);
    canFwd.set(verse.id < TOTAL_VERSES);
  }, [canBack, canFwd, verse.id]);

  const commitNext = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  }, [onNext]);

  const commitPrev = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrev();
  }, [onPrev]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .onStart(() => {
          contextX.set(translateX.get());
        })
        .onUpdate((event) => {
          if (reduced) {
            return;
          }

          const next = contextX.get() + event.translationX;
          const size = Math.max(width.get(), 1);

          if (next < 0 && !canFwd.get()) {
            translateX.set(rubberband(next, size));
            return;
          }
          if (next > 0 && !canBack.get()) {
            translateX.set(rubberband(next, size));
            return;
          }

          translateX.set(next);
        })
        .onEnd((event) => {
          if (reduced) {
            translateX.set(withTiming(0, { duration: FADE_MS }));
            return;
          }

          const current = translateX.get();
          const projected = current + project(event.velocityX);
          const shouldNext = projected < -72 && canFwd.get();
          const shouldPrev = projected > 72 && canBack.get();

          if (shouldNext) {
            scheduleOnRN(commitNext);
          } else if (shouldPrev) {
            scheduleOnRN(commitPrev);
          }

          translateX.set(
            withSpring(0, {
              ...SPRING_SNAP,
              velocity: event.velocityX,
            })
          );
        }),
    [canBack, canFwd, commitNext, commitPrev, contextX, reduced, translateX, width]
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(translateX.get()), [0, 88], [1, 0.58], Extrapolation.CLAMP),
  }));

  const meaningLength = verse.meaningEn.length + (verse.meaningBn?.length ?? 0);
  const sizes = fittedSizes(verse.arabic.length, meaningLength, screenWidth);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={(event) => width.set(event.nativeEvent.layout.width)}
        style={cardStyle}>
        <Surface style={styles.card}>
          <View style={styles.top}>
            <DeenText color={colors.muted} variant="micro">
              Today&apos;s verse
            </DeenText>
            <View style={styles.topRight}>
              <View style={[styles.pill, { backgroundColor: colors.surfaceAlt }]}>
                <DeenText color={colors.secondary} style={styles.pillText}>
                  {verse.surahId} : {verse.ayahNumber}
                </DeenText>
              </View>
              {onShuffle ? (
                <PressableScale
                  accessibilityLabel="Show a random verse"
                  hitSlop={8}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    onShuffle();
                  }}
                  style={[styles.shuffle, { backgroundColor: colors.surfaceAlt }]}>
                  <HugeiconsIcon color={colors.primary} icon={ShuffleIcon} size={18} />
                </PressableScale>
              ) : null}
            </View>
          </View>

          <Animated.View style={[styles.body, contentStyle]}>
            <ArabicVerse align="center" fontSize={sizes.arabic} lineHeight={sizes.arabicLineHeight} text={verse.arabic} />
            <Pronunciation mode={pronunciation} verse={verse} />
            <Meaning fontSize={sizes.meaning} language={meaningLanguage} verse={verse} />
            <DeenText color={colors.muted} style={styles.reference}>
              {verse.surahName}  ·  {verse.surahId}:{verse.ayahNumber}
            </DeenText>
          </Animated.View>

          <VerseNavigation
            canGoBack={verse.id > 1}
            canGoForward={verse.id < TOTAL_VERSES}
            indexHint={verse.id}
            onNext={onNext}
            onPrev={onPrev}
          />
        </Surface>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 460,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  shuffle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: 16,
    alignItems: 'center',
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'center',
  },
  reference: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
