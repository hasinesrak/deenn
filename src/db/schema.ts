export const DEEN_DB_NAME = 'deen.db';
export const QURAN_DB_NAME = 'quran.db';
export const DEEN_DB_VERSION = 1;

export const DEEN_SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  mode TEXT NOT NULL,
  current_verse_id INTEGER NOT NULL,
  sequential_verse_id INTEGER NOT NULL,
  last_shown_verse_id INTEGER NOT NULL,
  last_shown_at INTEGER NOT NULL,
  sequential_completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS verse_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_id INTEGER NOT NULL,
  shown_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verse_history_shown_at ON verse_history(shown_at DESC);
`;
