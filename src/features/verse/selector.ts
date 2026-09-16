import { getVerseById } from '@/db/quranApi';
import { recordVerseShown } from '@/db/appState';
import type { Progress, Settings, Verse } from '@/types/deen';
import { TOTAL_VERSES } from '@/types/deen';

import { randomVerseId } from './random';
import { nextSequentialId } from './sequential';

export type UnlockSelection = {
  verse: Verse;
  progress: Progress;
  reachedEnd: boolean;
};

export async function selectUnlockVerse(
  settings: Settings,
  progress: Progress
): Promise<UnlockSelection> {
  if (settings.verseMode === 'sequential') {
    if (progress.sequentialCompleted) {
      const verse = await requireVerse(progress.sequentialVerseId);
      return { verse, progress, reachedEnd: true };
    }

    const verse = await requireVerse(progress.sequentialVerseId);
    const nextId = nextSequentialId(progress.sequentialVerseId);
    const nextProgress: Progress = {
      currentVerseId: verse.id,
      sequentialVerseId: nextId ?? verse.id,
      lastShownVerseId: verse.id,
      lastShownAt: Date.now(),
      sequentialCompleted: nextId === null,
    };
    await recordVerseShown(verse.id, nextProgress.lastShownAt);
    return { verse, progress: nextProgress, reachedEnd: nextId === null };
  }

  const id = randomVerseId(settings.preventImmediateRepeat ? progress.lastShownVerseId : undefined);
  const verse = await requireVerse(id);
  const nextProgress: Progress = {
    ...progress,
    currentVerseId: verse.id,
    lastShownVerseId: verse.id,
    lastShownAt: Date.now(),
  };
  await recordVerseShown(verse.id, nextProgress.lastShownAt);
  return { verse, progress: nextProgress, reachedEnd: false };
}

export async function requireVerse(id: number): Promise<Verse> {
  const verse = await getVerseById(id);
  if (!verse) {
    throw new Error(`Verse ${id} could not be loaded.`);
  }
  return verse;
}

export function neighborId(id: number, direction: -1 | 1): number | null {
  const next = id + direction;
  if (next < 1 || next > TOTAL_VERSES) {
    return null;
  }
  return next;
}
