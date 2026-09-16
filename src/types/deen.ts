export type VerseMode = 'random' | 'sequential';
export type Pronunciation = 'english' | 'bengali' | 'both';
export type MeaningLanguage = 'english' | 'bengali' | 'both';
export type ThemePreference = 'light' | 'dark' | 'system';

export type Verse = {
  id: number;
  surahId: number;
  surahName: string;
  surahArabicName: string;
  ayahNumber: number;
  arabic: string;
  transliterationEn: string;
  transliterationBn: string;
  meaningEn: string;
  meaningBn: string | null;
};

export type Surah = {
  id: number;
  name: string;
  arabicName: string;
  translatedName: string | null;
  revelationType: string | null;
  verseCount: number;
};

export type Settings = {
  verseMode: VerseMode;
  pronunciation: Pronunciation;
  meaningLanguage: MeaningLanguage;
  unlockEnabled: boolean;
  theme: ThemePreference;
  preventImmediateRepeat: boolean;
  onboarded: boolean;
};

export type Progress = {
  currentVerseId: number;
  sequentialVerseId: number;
  lastShownVerseId: number;
  lastShownAt: number;
  sequentialCompleted: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  verseMode: 'random',
  pronunciation: 'english',
  meaningLanguage: 'english',
  unlockEnabled: false,
  theme: 'system',
  preventImmediateRepeat: true,
  onboarded: false,
};

export const DEFAULT_PROGRESS: Progress = {
  currentVerseId: 1,
  sequentialVerseId: 1,
  lastShownVerseId: 0,
  lastShownAt: 0,
  sequentialCompleted: false,
};

export const TOTAL_VERSES = 6236;
export const TOTAL_SURAHS = 114;
