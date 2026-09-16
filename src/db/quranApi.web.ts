import type { Surah, Verse } from '@/types/deen';

import data from '../../assets/quran-data.json';

type VerseRow = {
  id: number;
  surahId: number;
  ayahNumber: number;
  arabic: string;
  transliterationEn: string;
  transliterationBn: string;
  meaningEn: string;
  meaningBn?: string | null;
};

const surahs = data.surahs as Surah[];
const verses = data.verses as VerseRow[];
const surahById = new Map(surahs.map((surah) => [surah.id, surah]));
const verseById = new Map(verses.map((verse) => [verse.id, verse]));

function hydrate(row: VerseRow): Verse {
  const surah = surahById.get(row.surahId);
  const meaningBn = typeof row.meaningBn === 'string' && row.meaningBn.trim() ? row.meaningBn : null;
  return {
    id: row.id,
    surahId: row.surahId,
    surahName: surah?.name ?? '',
    surahArabicName: surah?.arabicName ?? '',
    ayahNumber: row.ayahNumber,
    arabic: row.arabic,
    transliterationEn: row.transliterationEn,
    transliterationBn: row.transliterationBn,
    meaningEn: row.meaningEn,
    meaningBn,
  };
}

export async function initQuran(): Promise<void> {
  return;
}

export function getQuranDatabasePath(): string {
  return 'web';
}

export async function getVerseById(id: number): Promise<Verse | null> {
  const row = verseById.get(id);
  return row ? hydrate(row) : null;
}

export async function getVersesForSurah(surahId: number): Promise<Verse[]> {
  return verses.filter((verse) => verse.surahId === surahId).map(hydrate);
}

export async function getAllSurahs(): Promise<Surah[]> {
  return surahs;
}

export async function getSurahById(id: number): Promise<Surah | null> {
  return surahById.get(id) ?? null;
}

export async function searchSurahs(query: string): Promise<Surah[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return surahs;
  }
  return surahs.filter((surah) => {
    return (
      surah.name.toLowerCase().includes(trimmed) ||
      surah.arabicName.includes(query.trim()) ||
      (surah.translatedName ?? '').toLowerCase().includes(trimmed) ||
      String(surah.id) === trimmed
    );
  });
}

export async function searchVerses(query: string): Promise<Verse[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }
  return verses
    .filter((verse) => {
      const surah = surahById.get(verse.surahId);
      return (
        verse.arabic.includes(query.trim()) ||
        verse.meaningEn.toLowerCase().includes(trimmed) ||
        verse.transliterationEn.toLowerCase().includes(trimmed) ||
        (surah?.name.toLowerCase().includes(trimmed) ?? false)
      );
    })
    .slice(0, 40)
    .map(hydrate);
}
