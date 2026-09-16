import { Platform } from 'react-native';

import type { Progress, Settings } from '@/types/deen';

type NativeUnlockModule = {
  configure: (payload: {
    enabled: boolean;
    mode: Settings['verseMode'];
    pronunciation: Settings['pronunciation'];
    meaningLanguage: Settings['meaningLanguage'];
    lastShownVerseId: number;
    sequentialVerseId: number;
    sequentialCompleted: boolean;
    dbPath: string;
  }) => Promise<void>;
  getNativeProgress: () => Promise<{
    lastShownVerseId: number;
    sequentialVerseId: number;
    sequentialCompleted: boolean;
    lastShownAt: number;
  } | null>;
};

function loadNativeModule(): NativeUnlockModule | null {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    // Local native module; optional until an Android development build exists.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require('deen-unlock') as {
      configure?: NativeUnlockModule['configure'];
      getNativeProgress?: NativeUnlockModule['getNativeProgress'];
      default?: NativeUnlockModule;
    };
    if (typeof loaded.configure === 'function' && typeof loaded.getNativeProgress === 'function') {
      return loaded as NativeUnlockModule;
    }
    return loaded.default ?? null;
  } catch {
    return null;
  }
}

const native = loadNativeModule();

export function isNativeUnlockAvailable(): boolean {
  return native != null;
}

export async function syncUnlockNative(options: {
  settings: Settings;
  progress: Progress;
  dbPath: string;
}): Promise<void> {
  if (!native) {
    return;
  }

  await native.configure({
    enabled: options.settings.unlockEnabled,
    mode: options.settings.verseMode,
    pronunciation: options.settings.pronunciation,
    meaningLanguage: options.settings.meaningLanguage,
    lastShownVerseId: options.progress.lastShownVerseId,
    sequentialVerseId: options.progress.sequentialVerseId,
    sequentialCompleted: options.progress.sequentialCompleted,
    dbPath: options.dbPath,
  });
}

export async function readNativeProgress(): Promise<{
  lastShownVerseId: number;
  sequentialVerseId: number;
  sequentialCompleted: boolean;
  lastShownAt: number;
} | null> {
  if (!native) {
    return null;
  }
  return native.getNativeProgress();
}
