import { type SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite';

import { DEFAULT_PROGRESS, DEFAULT_SETTINGS } from '@/types/deen';

import { DEEN_DB_NAME, DEEN_DB_VERSION, DEEN_SCHEMA } from './schema';

let deenDbPromise: Promise<SQLiteDatabase> | null = null;

export async function getDeenDatabase(): Promise<SQLiteDatabase> {
  if (!deenDbPromise) {
    deenDbPromise = openDatabaseAsync(DEEN_DB_NAME).then(async (db) => {
      await migrateDeenDatabase(db);
      return db;
    });
  }

  return deenDbPromise;
}

export async function migrateDeenDatabase(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = result?.user_version ?? 0;
  if (current >= DEEN_DB_VERSION) {
    return;
  }

  await db.execAsync(DEEN_SCHEMA);
  await seedDefaults(db);
  await db.execAsync(`PRAGMA user_version = ${DEEN_DB_VERSION}`);
}

async function seedDefaults(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM settings'
  );
  if (!existing?.count) {
    const entries = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => [
      key,
      serializeSetting(value),
    ]);
    for (const [key, value] of entries) {
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', key, value);
    }
  }

  const progress = await db.getFirstAsync<{ id: number }>('SELECT id FROM progress WHERE id = 1');
  if (!progress) {
    await db.runAsync(
      `INSERT INTO progress (
        id, mode, current_verse_id, sequential_verse_id,
        last_shown_verse_id, last_shown_at, sequential_completed
      ) VALUES (1, ?, ?, ?, ?, ?, ?)`,
      DEFAULT_SETTINGS.verseMode,
      DEFAULT_PROGRESS.currentVerseId,
      DEFAULT_PROGRESS.sequentialVerseId,
      DEFAULT_PROGRESS.lastShownVerseId,
      DEFAULT_PROGRESS.lastShownAt,
      DEFAULT_PROGRESS.sequentialCompleted ? 1 : 0
    );
  }
}

function serializeSetting(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return String(value);
}
