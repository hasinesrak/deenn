import { openDatabaseAsync, importDatabaseFromAssetAsync, type SQLiteDatabase } from 'expo-sqlite';

import type { Surah, Verse } from '@/types/deen';

import { QURAN_DB_NAME } from './schema';
import * as surahsDb from './surahs';
import * as versesDb from './verses';

let quranDb: SQLiteDatabase | null = null;

export async function initQuran(): Promise<void> {
  if (quranDb) {
    return;
  }

  await importDatabaseFromAssetAsync(QURAN_DB_NAME, {
    assetId: require('../../assets/quran.db'),
  });
  quranDb = await openDatabaseAsync(QURAN_DB_NAME);
}

export function getQuranDatabasePath(): string {
  return quranDb?.databasePath ?? '';
}

function requireDb(): SQLiteDatabase {
  if (!quranDb) {
    throw new Error('Quran database is not ready.');
  }
  return quranDb;
}

export async function getVerseById(id: number): Promise<Verse | null> {
  return versesDb.getVerseById(requireDb(), id);
}

export async function getVersesForSurah(surahId: number): Promise<Verse[]> {
  return versesDb.getVersesForSurah(requireDb(), surahId);
}

export async function getAllSurahs(): Promise<Surah[]> {
  return surahsDb.getAllSurahs(requireDb());
}

export async function searchSurahs(query: string): Promise<Surah[]> {
  return surahsDb.searchSurahs(requireDb(), query);
}

export async function searchVerses(query: string): Promise<Verse[]> {
  return versesDb.searchVerses(requireDb(), query);
}

export async function getSurahById(id: number): Promise<Surah | null> {
  return surahsDb.getSurahById(requireDb(), id);
}
