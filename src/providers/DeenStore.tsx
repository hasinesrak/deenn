import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  initAppState,
  loadProgress,
  loadSettings,
  resetSequential as resetSequentialState,
  saveSettings,
  writeProgress as persistProgress,
} from '@/db/appState';
import { getQuranDatabasePath, getVerseById, initQuran } from '@/db/quranApi';
import { readNativeProgress, syncUnlockNative } from '@/features/unlock/deenUnlock';
import { neighborId, requireVerse, selectUnlockVerse } from '@/features/verse/selector';
import { randomVerseId } from '@/features/verse/random';
import type { Progress, Settings, Verse, VerseMode } from '@/types/deen';
import { DEFAULT_PROGRESS, DEFAULT_SETTINGS } from '@/types/deen';

type DeenStoreValue = {
  ready: boolean;
  error: string | null;
  settings: Settings;
  progress: Progress;
  verse: Verse | null;
  reachedEnd: boolean;
  patchSettings: (patch: Partial<Settings>) => Promise<void>;
  setMode: (mode: VerseMode) => Promise<void>;
  goToVerse: (id: number, options?: { updateSequential?: boolean }) => Promise<void>;
  goNeighbor: (direction: -1 | 1) => Promise<void>;
  showRandomVerse: () => Promise<void>;
  showUnlockVerse: () => Promise<Verse | null>;
  resetSequential: () => Promise<void>;
};

const DeenStoreContext = createContext<DeenStoreValue | null>(null);

export function DeenStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [reachedEnd, setReachedEnd] = useState(false);

  const persistNative = useCallback(async (nextSettings: Settings, nextProgress: Progress) => {
    await syncUnlockNative({
      settings: nextSettings,
      progress: nextProgress,
      dbPath: getQuranDatabasePath(),
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await initQuran();
        await initAppState();
        const loadedSettings = await loadSettings();
        let loadedProgress = await loadProgress();
        const nativeProgress = await readNativeProgress();
        if (nativeProgress && nativeProgress.lastShownAt > loadedProgress.lastShownAt) {
          loadedProgress = {
            ...loadedProgress,
            currentVerseId: nativeProgress.lastShownVerseId || loadedProgress.currentVerseId,
            lastShownVerseId: nativeProgress.lastShownVerseId,
            sequentialVerseId: nativeProgress.sequentialVerseId,
            lastShownAt: nativeProgress.lastShownAt,
            sequentialCompleted: nativeProgress.sequentialCompleted,
          };
          await persistProgress(loadedProgress, loadedSettings.verseMode);
        }
        const loadedVerse = await getVerseById(loadedProgress.currentVerseId);
        if (cancelled) {
          return;
        }
        setSettings(loadedSettings);
        setProgress(loadedProgress);
        setVerse(loadedVerse);
        setReachedEnd(loadedProgress.sequentialCompleted);
        await persistNative(loadedSettings, loadedProgress);
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "We couldn't load the Quran library.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [persistNative]);

  const patchSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = await saveSettings(patch);
      setSettings(next);
      await persistNative(next, progress);
    },
    [persistNative, progress]
  );

  const writeProgress = useCallback(
    async (next: Progress, mode = settings.verseMode) => {
      await persistProgress(next, mode);
      setProgress(next);
      await persistNative(settings, next);
    },
    [persistNative, settings]
  );

  const goToVerse = useCallback(
    async (id: number, options?: { updateSequential?: boolean }) => {
      const nextVerse = await requireVerse(id);
      setVerse(nextVerse);
      setReachedEnd(false);
      const nextProgress: Progress = {
        ...progress,
        currentVerseId: nextVerse.id,
        sequentialVerseId: options?.updateSequential ? nextVerse.id : progress.sequentialVerseId,
      };
      await writeProgress(nextProgress);
    },
    [progress, writeProgress]
  );

  const setMode = useCallback(
    async (mode: VerseMode) => {
      await patchSettings({ verseMode: mode });
      if (mode === 'sequential') {
        await goToVerse(progress.sequentialVerseId, { updateSequential: true });
        setReachedEnd(progress.sequentialCompleted);
        return;
      }
      const id = randomVerseId(progress.lastShownVerseId);
      await goToVerse(id);
    },
    [
      goToVerse,
      patchSettings,
      progress.lastShownVerseId,
      progress.sequentialCompleted,
      progress.sequentialVerseId,
    ]
  );

  const goNeighbor = useCallback(
    async (direction: -1 | 1) => {
      if (!verse) {
        return;
      }
      const nextId = neighborId(verse.id, direction);
      if (nextId == null) {
        if (direction === 1 && settings.verseMode === 'sequential') {
          setReachedEnd(true);
        }
        return;
      }
      await goToVerse(nextId, { updateSequential: settings.verseMode === 'sequential' });
    },
    [goToVerse, settings.verseMode, verse]
  );

  const showUnlockVerse = useCallback(async () => {
    const selection = await selectUnlockVerse(settings, progress);
    setVerse(selection.verse);
    setReachedEnd(selection.reachedEnd);
    await writeProgress(selection.progress);
    return selection.verse;
  }, [progress, settings, writeProgress]);

  const showRandomVerse = useCallback(async () => {
    const id = randomVerseId(progress.lastShownVerseId || verse?.id);
    await goToVerse(id);
  }, [goToVerse, progress.lastShownVerseId, verse?.id]);

  const resetSequential = useCallback(async () => {
    const next = await resetSequentialState();
    setProgress(next);
    setReachedEnd(false);
    const nextVerse = await requireVerse(1);
    setVerse(nextVerse);
    await persistNative(settings, next);
  }, [persistNative, settings]);

  const value = useMemo<DeenStoreValue>(
    () => ({
      ready,
      error,
      settings,
      progress,
      verse,
      reachedEnd,
      patchSettings,
      setMode,
      goToVerse,
      goNeighbor,
      showRandomVerse,
      showUnlockVerse,
      resetSequential,
    }),
    [
      error,
      goNeighbor,
      goToVerse,
      patchSettings,
      progress,
      reachedEnd,
      ready,
      resetSequential,
      setMode,
      settings,
      showRandomVerse,
      showUnlockVerse,
      verse,
    ]
  );

  return <DeenStoreContext.Provider value={value}>{children}</DeenStoreContext.Provider>;
}

export function useDeenStore(): DeenStoreValue {
  const value = useContext(DeenStoreContext);
  if (!value) {
    throw new Error('useDeenStore must be used within DeenStoreProvider');
  }
  return value;
}
