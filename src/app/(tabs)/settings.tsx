import { type ReactNode } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTabBarInset } from '@/components/TabBar';
import { DeenText } from '@/components/ui/DeenText';
import { PressableScale } from '@/components/ui/PressableScale';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { isNativeUnlockAvailable } from '@/features/unlock/deenUnlock';
import {
  areNotificationsAvailable,
  requestNotificationPermission,
} from '@/features/unlock/notificationService';
import { useDeenStore } from '@/providers/DeenStore';
import { useTheme } from '@/providers/ThemeProvider';
import { radii } from '@/theme/radii';
import { fonts } from '@/theme/typography';
import type { MeaningLanguage, Pronunciation, ThemePreference, VerseMode } from '@/types/deen';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { colors } = useTheme();
  const { settings, progress, verse, patchSettings, resetSequential, setMode } = useDeenStore();

  const toggleUnlock = async (enabled: boolean) => {
    void Haptics.selectionAsync();
    if (enabled) {
      if (!areNotificationsAvailable() || !isNativeUnlockAvailable()) {
        Alert.alert(
          'Unlock verses need a development build',
          'Expo Go cannot show a verse after you unlock. Use an Android development build of Deen.'
        );
        return;
      }
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Unlock verses are turned off',
          'Enable notifications in Android Settings so Deen can show a verse after you unlock.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        await patchSettings({ unlockEnabled: false });
        return;
      }
    }
    await patchSettings({ unlockEnabled: enabled });
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: tabBarInset + 24 },
      ]}
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <DeenText variant="brand">Settings</DeenText>

      <Section title="Reading">
        <Label>Verse mode</Label>
        <SegmentedControl<VerseMode>
          onChange={setMode}
          options={[
            { value: 'random', label: 'Random' },
            { value: 'sequential', label: 'Sequential' },
          ]}
          value={settings.verseMode}
        />

        <Label>Pronunciation</Label>
        <SegmentedControl<Pronunciation>
          onChange={(pronunciation) => patchSettings({ pronunciation })}
          options={[
            { value: 'english', label: 'English' },
            { value: 'bengali', label: 'বাংলা' },
            { value: 'both', label: 'Both' },
          ]}
          value={settings.pronunciation}
        />

        <Label>Meaning</Label>
        <SegmentedControl<MeaningLanguage>
          onChange={(meaningLanguage) => patchSettings({ meaningLanguage })}
          options={[
            { value: 'english', label: 'English' },
            { value: 'bengali', label: 'বাংলা' },
            { value: 'both', label: 'Both' },
          ]}
          value={settings.meaningLanguage}
        />

        <Row>
          <View style={styles.rowText}>
            <DeenText style={styles.rowTitle}>Unlock experience</DeenText>
            <DeenText color={colors.secondary} style={styles.rowMeta}>
              {isNativeUnlockAvailable()
                ? 'A verse after you unlock your phone'
                : 'Requires an Android development build'}
            </DeenText>
          </View>
          <Switch
            ios_backgroundColor={colors.surfaceAlt}
            onValueChange={toggleUnlock}
            thumbColor={colors.surface}
            trackColor={{ false: colors.border, true: colors.accent }}
            value={settings.unlockEnabled}
          />
        </Row>
      </Section>

      <Section title="Appearance">
        <Label>Theme</Label>
        <SegmentedControl<ThemePreference>
          onChange={(theme) => patchSettings({ theme })}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          value={settings.theme}
        />
      </Section>

      <Section title="Progress">
        <Row>
          <View style={styles.rowText}>
            <DeenText style={styles.rowTitle}>Current position</DeenText>
            <DeenText color={colors.secondary} style={styles.rowMeta}>
              {verse
                ? `${verse.surahName} ${verse.surahId}:${verse.ayahNumber}`
                : `Verse ${progress.sequentialVerseId}`}
            </DeenText>
          </View>
        </Row>
        <PressableScale
          onPress={() =>
            Alert.alert('Reset sequential progress?', 'This returns sequential reading to 1:1.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  void resetSequential();
                },
              },
            ])
          }
          style={[styles.reset, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
          <DeenText align="center" style={styles.resetText}>
            Reset sequential progress
          </DeenText>
        </PressableScale>
      </Section>

      <DeenText color={colors.muted} style={styles.privacy}>
        Deen works offline and keeps your reading preferences and progress on your device.
        {Platform.OS === 'android' ? '' : ''}
      </DeenText>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <DeenText color={colors.muted} variant="micro">
        {title}
      </DeenText>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderTopColor: colors.highlight,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

function Label({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <DeenText color={colors.secondary} style={styles.label}>
      {children}
    </DeenText>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.large,
    padding: 16,
    gap: 14,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  rowMeta: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  reset: {
    borderWidth: 1,
    borderRadius: radii.medium,
    paddingVertical: 12,
  },
  resetText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
  },
  privacy: {
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 20,
  },
});
