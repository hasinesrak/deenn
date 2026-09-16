import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Amiri_400Regular,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
} from '@expo-google-fonts/fraunces';
import { NotoSansBengali_400Regular } from '@expo-google-fonts/noto-sans-bengali';
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
} from '@expo-google-fonts/source-serif-4';

import { DatabaseError } from '@/components/DatabaseError';
import { subscribeToNotificationOpens } from '@/features/unlock/notificationService';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DeenStoreProvider, useDeenStore } from '@/providers/DeenStore';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { DEFAULT_SETTINGS } from '@/types/deen';

SplashScreen.preventAutoHideAsync();

function useNotificationObserver() {
  useEffect(() => {
    return subscribeToNotificationOpens((data) => {
      const url = data.url;
      if (typeof url === 'string') {
        router.push(url as never);
        return;
      }
      if (typeof data.verseId === 'number') {
        router.push(`/verse/${data.verseId}`);
      }
    });
  }, []);
}

function ThemedStack() {
  const { settings, ready, error } = useDeenStore();
  const { colors, isDark } = useTheme();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (ready && settings.onboarded === false) {
      router.replace('/onboarding');
    }
  }, [ready, settings.onboarded]);

  if (error) {
    return <DatabaseError message={error} />;
  }

  if (!ready) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: reduced ? 'fade' : 'default',
          animationMatchesGesture: true,
        }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="verse/[verseId]" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}

function ThemedApp() {
  const { settings } = useDeenStore();
  useNotificationObserver();

  return (
    <ThemeProvider preference={settings.theme}>
      <ThemedStack />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    NotoSansBengali_400Regular,
    SourceSerif4_400Regular,
    SourceSerif4_400Regular_Italic,
  });

  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <ThemeProvider preference={DEFAULT_SETTINGS.theme}>
        <DeenStoreProvider>
          <ThemedApp />
        </DeenStoreProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
