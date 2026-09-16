import type { SQLiteDatabase } from 'expo-sqlite';

import { DEFAULT_PROGRESS, DEFAULT_SETTINGS, type Progress, type VerseMode } from '@/types/deen';

type ProgressRow = {
  current_verse_id: number;
  sequential_verse_id: number;
  last_shown_verse_id: number;
  last_shown_at: number;
  sequential_completed: number;
};

export async function getProgress(db: SQLiteDatabase): Promise<Progress> {
  const row = await db.getFirstAsync<ProgressRow>(
    `SELECT current_verse_id, sequential_verse_id, last_shown_verse_id, last_shown_at, sequential_completed
     FROM progress WHERE id = 1`
  );

  if (!row) {
    return { ...DEFAULT_PROGRESS };
  }

  return {
    currentVerseId: row.current_verse_id,
    sequentialVerseId: row.sequential_verse_id,
    lastShownVerseId: row.last_shown_verse_id,
    lastShownAt: row.last_shown_at,
    sequentialCompleted: row.sequential_completed === 1,
  };
}

export async function saveProgress(
  db: SQLiteDatabase,
  progress: Progress,
  mode: VerseMode = DEFAULT_SETTINGS.verseMode
): Promise<void> {
  await db.runAsync(
    `UPDATE progress SET
      mode = ?,
      current_verse_id = ?,
      sequential_verse_id = ?,
      last_shown_verse_id = ?,
      last_shown_at = ?,
      sequential_completed = ?
     WHERE id = 1`,
    mode,
    progress.currentVerseId,
    progress.sequentialVerseId,
    progress.lastShownVerseId,
    progress.lastShownAt,
    progress.sequentialCompleted ? 1 : 0
  );
}

export async function resetSequentialProgress(db: SQLiteDatabase): Promise<Progress> {
  const progress: Progress = {
    ...DEFAULT_PROGRESS,
    currentVerseId: 1,
    sequentialVerseId: 1,
    sequentialCompleted: false,
  };
  await saveProgress(db, progress);
  return progress;
}
