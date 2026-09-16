import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { SparklesIcon } from '@/icons';
import Animated, { FadeIn, FadeInRight, FadeOut, FadeOutLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { DeenText } from '@/components/ui/DeenText';
import { PressableScale } from '@/components/ui/PressableScale';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { requestNotificationPermission } from '@/features/unlock/notificationService';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDeenStore } from '@/providers/DeenStore';
import { useTheme } from '@/providers/ThemeProvider';
import { EASE_OUT, STEP_IN_MS, STEP_OUT_MS } from '@/theme/motion';
import { radii } from '@/theme/radii';
import { fonts } from '@/theme/typography';
import type { Pronunciation, VerseMode } from '@/types/deen';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { settings, patchSettings, setMode } = useDeenStore();
  const [step, setStep] = useState<1 | 2>(1);

  const finish = async (enableUnlock: boolean) => {
    if (enableUnlock) {
      const granted = await requestNotificationPermission();
      await patchSettings({ unlockEnabled: granted, onboarded: true });
    } else {
      await patchSettings({ unlockEnabled: false, onboarded: true });
    }
    router.replace('/');
  };

  const entering = reduced ? FadeIn.duration(STEP_OUT_MS) : FadeInRight.duration(STEP_IN_MS).easing(EASE_OUT);
  const exiting = reduced ? FadeOut.duration(160) : FadeOutLeft.duration(STEP_OUT_MS).easing(EASE_OUT);

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
        },
      ]}>
      <View style={styles.hero}>
        <HugeiconsIcon color={colors.accent} icon={SparklesIcon} size={28} />
        <DeenText style={styles.logo} variant="brand">
          Deen
        </DeenText>
        <DeenText color={colors.secondary} style={styles.tagline}>
          Quran in your everyday.
        </DeenText>
      </View>

      <View style={styles.stage}>
        {step === 1 ? (
          <Animated.View entering={FadeIn.duration(0)} exiting={exiting} key="step-1" style={styles.body}>
            <DeenText variant="title">A verse whenever you unlock.</DeenText>
            <DeenText color={colors.secondary} style={styles.copy}>
              Completely offline. Choose how Deen should read with you.
            </DeenText>

            <DeenText color={colors.muted} variant="micro">
              Reading style
            </DeenText>
            <SegmentedControl<VerseMode>
              onChange={setMode}
              options={[
                { value: 'random', label: 'Random' },
                { value: 'sequential', label: 'Sequential' },
              ]}
              value={settings.verseMode}
            />

            <DeenText color={colors.muted} variant="micro">
              Pronunciation
            </DeenText>
            <SegmentedControl<Pronunciation>
              onChange={(pronunciation) => patchSettings({ pronunciation })}
              options={[
                { value: 'english', label: 'English' },
                { value: 'bengali', label: 'বাংলা' },
                { value: 'both', label: 'Both' },
              ]}
              value={settings.pronunciation}
            />

            <PressableScale
              onPress={() => {
                void Haptics.selectionAsync();
                setStep(2);
              }}
              style={[styles.primary, { backgroundColor: colors.primary }]}>
              <DeenText align="center" color={colors.inverse} style={styles.primaryText}>
                Continue
              </DeenText>
            </PressableScale>
          </Animated.View>
        ) : (
          <Animated.View entering={entering} exiting={exiting} key="step-2" style={styles.body}>
            <DeenText variant="title">Allow Deen to show unlock verses</DeenText>
            <DeenText color={colors.secondary} style={styles.copy}>
              Deen can show you a verse whenever you unlock your phone. You can turn this off later in
              Settings.
            </DeenText>
            <PressableScale
              onPress={() => finish(true)}
              style={[styles.primary, { backgroundColor: colors.primary }]}>
              <DeenText align="center" color={colors.inverse} style={styles.primaryText}>
                Allow notifications
              </DeenText>
            </PressableScale>
            <PressableScale onPress={() => finish(false)} style={styles.secondary}>
              <DeenText align="center" color={colors.secondary} style={styles.secondaryText}>
                Not now
              </DeenText>
            </PressableScale>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: fonts.ui,
    fontSize: 16,
  },
  stage: {
    overflow: 'hidden',
  },
  body: {
    gap: 16,
    paddingBottom: 12,
  },
  copy: {
    fontFamily: fonts.ui,
    fontSize: 16,
    lineHeight: 24,
  },
  primary: {
    marginTop: 12,
    borderRadius: radii.pill,
    paddingVertical: 16,
  },
  primaryText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  secondary: {
    paddingVertical: 12,
  },
  secondaryText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
  },
});
