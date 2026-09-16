import { DEFAULT_PROGRESS, DEFAULT_SETTINGS, type Progress, type Settings, type VerseMode } from '@/types/deen';

const SETTINGS_KEY = 'deen.settings';
const PROGRESS_KEY = 'deen.progress';
const HISTORY_KEY = 'deen.history';

function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') {
    return fallback;
  }
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export async function initAppState(): Promise<void> {
  return;
}

export async function loadSettings(): Promise<Settings> {
  return readJson(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await loadSettings()), ...patch };
  writeJson(SETTINGS_KEY, next);
  return next;
}

export async function loadProgress(): Promise<Progress> {
  return readJson(PROGRESS_KEY, DEFAULT_PROGRESS);
}

export async function writeProgress(progress: Progress, _mode?: VerseMode): Promise<void> {
  writeJson(PROGRESS_KEY, progress);
}

export async function resetSequential(): Promise<Progress> {
  const current = await loadProgress();
  const next: Progress = {
    ...current,
    currentVerseId: 1,
    sequentialVerseId: 1,
    sequentialCompleted: false,
  };
  writeJson(PROGRESS_KEY, next);
  return next;
}

export async function recordVerseShown(verseId: number, shownAt = Date.now()): Promise<void> {
  const history = readJson<{ verseId: number; shownAt: number }[]>(HISTORY_KEY, []);
  history.unshift({ verseId, shownAt });
  writeJson(HISTORY_KEY, history.slice(0, 50));
}
