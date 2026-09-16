import type { SQLiteDatabase } from 'expo-sqlite';

import type { Verse } from '@/types/deen';

type VerseRow = {
  id: number;
  surah_id: number;
  ayah_number: number;
  arabic: string;
  transliteration_en: string;
  transliteration_bn: string;
  meaning_en: string;
  meaning_bn: string | null;
  surah_name: string;
  surah_arabic_name: string;
};

let meaningBnAvailable: boolean | null = null;

async function hasMeaningBnColumn(db: SQLiteDatabase): Promise<boolean> {
  if (meaningBnAvailable != null) {
    return meaningBnAvailable;
  }
  try {
    const cols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(verses)');
    meaningBnAvailable = cols.some((col) => col.name === 'meaning_bn');
  } catch {
    meaningBnAvailable = false;
  }
  return meaningBnAvailable;
}

async function verseSelect(db: SQLiteDatabase): Promise<string> {
  const withBn = await hasMeaningBnColumn(db);
  return `
  SELECT
    v.id,
    v.surah_id,
    v.ayah_number,
    v.arabic,
    v.transliteration_en,
    v.transliteration_bn,
    v.meaning_en,
    ${withBn ? 'COALESCE(v.meaning_bn, "")' : '""'} AS meaning_bn,
    s.name AS surah_name,
    s.arabic_name AS surah_arabic_name
  FROM verses v
  JOIN surahs s ON s.id = v.surah_id
`;
}

function mapVerse(row: VerseRow): Verse {
  const meaningBn = typeof row.meaning_bn === 'string' && row.meaning_bn.trim() ? row.meaning_bn : null;
  return {
    id: row.id,
    surahId: row.surah_id,
    surahName: row.surah_name,
    surahArabicName: row.surah_arabic_name,
    ayahNumber: row.ayah_number,
    arabic: row.arabic,
    transliterationEn: row.transliteration_en,
    transliterationBn: row.transliteration_bn,
    meaningEn: row.meaning_en,
    meaningBn,
  };
}

export async function getVerseById(db: SQLiteDatabase, id: number): Promise<Verse | null> {
  const row = await db.getFirstAsync<VerseRow>(`${await verseSelect(db)} WHERE v.id = ?`, id);
  return row ? mapVerse(row) : null;
}

export async function getVerseByReference(
  db: SQLiteDatabase,
  surahId: number,
  ayahNumber: number
): Promise<Verse | null> {
  const row = await db.getFirstAsync<VerseRow>(
    `${await verseSelect(db)} WHERE v.surah_id = ? AND v.ayah_number = ?`,
    surahId,
    ayahNumber
  );
  return row ? mapVerse(row) : null;
}

export async function getVersesForSurah(db: SQLiteDatabase, surahId: number): Promise<Verse[]> {
  const rows = await db.getAllAsync<VerseRow>(
    `${await verseSelect(db)} WHERE v.surah_id = ? ORDER BY v.ayah_number ASC`,
    surahId
  );
  return rows.map(mapVerse);
}

export async function getVerseCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM verses');
  return row?.count ?? 0;
}

export async function searchVerses(db: SQLiteDatabase, query: string, limit = 40): Promise<Verse[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const like = `%${trimmed}%`;
  const rows = await db.getAllAsync<VerseRow>(
    `${await verseSelect(db)}
     WHERE s.name LIKE ?
        OR v.arabic LIKE ?
        OR v.meaning_en LIKE ?
        OR v.transliteration_en LIKE ?
     ORDER BY v.id ASC
     LIMIT ?`,
    like,
    like,
    like,
    like,
    limit
  );
  return rows.map(mapVerse);
}
