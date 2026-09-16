import type { SQLiteDatabase } from 'expo-sqlite';

import type { Progress, Settings, VerseMode } from '@/types/deen';

import { getDeenDatabase } from './database';
import * as progressDb from './progress';
import * as settingsDb from './settings';
import { recordVerseShown as recordHistory } from '@/features/verse/history';

let deenDb: SQLiteDatabase | null = null;

export async function initAppState(): Promise<void> {
  deenDb = await getDeenDatabase();
}

function requireDb(): SQLiteDatabase {
  if (!deenDb) {
    throw new Error('App database is not ready.');
  }
  return deenDb;
}

export async function loadSettings(): Promise<Settings> {
  return settingsDb.getSettings(requireDb());
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  return settingsDb.updateSettings(requireDb(), patch);
}

export async function loadProgress(): Promise<Progress> {
  return progressDb.getProgress(requireDb());
}

export async function writeProgress(progress: Progress, mode?: VerseMode): Promise<void> {
  await progressDb.saveProgress(requireDb(), progress, mode);
}

export async function resetSequential(): Promise<Progress> {
  return progressDb.resetSequentialProgress(requireDb());
}

export async function recordVerseShown(verseId: number, shownAt = Date.now()): Promise<void> {
  await recordHistory(requireDb(), verseId, shownAt);
}
