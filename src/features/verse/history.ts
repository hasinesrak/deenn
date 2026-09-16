import type { SQLiteDatabase } from 'expo-sqlite';

export async function recordVerseShown(db: SQLiteDatabase, verseId: number, shownAt = Date.now()) {
  await db.runAsync('INSERT INTO verse_history (verse_id, shown_at) VALUES (?, ?)', verseId, shownAt);
}

export async function getRecentHistory(db: SQLiteDatabase, limit = 20): Promise<number[]> {
  const rows = await db.getAllAsync<{ verse_id: number }>(
    'SELECT verse_id FROM verse_history ORDER BY shown_at DESC LIMIT ?',
    limit
  );
  return rows.map((row) => row.verse_id);
}
