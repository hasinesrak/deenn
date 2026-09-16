import type { SQLiteDatabase } from 'expo-sqlite';

import { DEFAULT_SETTINGS, type Settings } from '@/types/deen';

function parseValue(key: keyof Settings, raw: string): Settings[keyof Settings] {
  if (key === 'unlockEnabled' || key === 'preventImmediateRepeat' || key === 'onboarded') {
    return raw === '1' || raw === 'true';
  }
  return raw as Settings[keyof Settings];
}

export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const next: Settings = { ...DEFAULT_SETTINGS };

  for (const row of rows) {
    if (row.key in next) {
      const key = row.key as keyof Settings;
      next[key] = parseValue(key, row.value) as never;
    }
  }

  return next;
}

export async function updateSettings(
  db: SQLiteDatabase,
  patch: Partial<Settings>
): Promise<Settings> {
  for (const [key, value] of Object.entries(patch)) {
    const serialized = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
    await db.runAsync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key,
      serialized
    );
  }

  return getSettings(db);
}
