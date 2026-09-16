import { TOTAL_VERSES } from '@/types/deen';

export function nextSequentialId(currentId: number, total = TOTAL_VERSES): number | null {
  if (currentId >= total) {
    return null;
  }
  return currentId + 1;
}

export function previousVerseId(currentId: number): number | null {
  if (currentId <= 1) {
    return null;
  }
  return currentId - 1;
}

export function clampVerseId(id: number, total = TOTAL_VERSES): number {
  return Math.min(Math.max(id, 1), total);
}
