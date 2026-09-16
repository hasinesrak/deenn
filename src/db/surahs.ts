import type { SQLiteDatabase } from 'expo-sqlite';

import type { Surah } from '@/types/deen';

type SurahRow = {
  id: number;
  name: string;
  arabic_name: string;
  translated_name: string | null;
  revelation_type: string | null;
  verse_count: number;
};

function mapSurah(row: SurahRow): Surah {
  return {
    id: row.id,
    name: row.name,
    arabicName: row.arabic_name,
    translatedName: row.translated_name,
    revelationType: row.revelation_type,
    verseCount: row.verse_count,
  };
}

export async function getAllSurahs(db: SQLiteDatabase): Promise<Surah[]> {
  const rows = await db.getAllAsync<SurahRow>(
    'SELECT id, name, arabic_name, translated_name, revelation_type, verse_count FROM surahs ORDER BY id ASC'
  );
  return rows.map(mapSurah);
}

export async function getSurahById(db: SQLiteDatabase, id: number): Promise<Surah | null> {
  const row = await db.getFirstAsync<SurahRow>(
    'SELECT id, name, arabic_name, translated_name, revelation_type, verse_count FROM surahs WHERE id = ?',
    id
  );
  return row ? mapSurah(row) : null;
}

export async function searchSurahs(db: SQLiteDatabase, query: string): Promise<Surah[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getAllSurahs(db);
  }

  const like = `%${trimmed}%`;
  const asNumber = Number(trimmed);
  const rows = await db.getAllAsync<SurahRow>(
    `SELECT id, name, arabic_name, translated_name, revelation_type, verse_count
     FROM surahs
     WHERE name LIKE ?
        OR arabic_name LIKE ?
        OR IFNULL(translated_name, '') LIKE ?
        OR CAST(id AS TEXT) = ?
     ORDER BY id ASC`,
    like,
    like,
    like,
    Number.isFinite(asNumber) ? String(asNumber) : trimmed
  );
  return rows.map(mapSurah);
}
