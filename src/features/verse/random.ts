import { TOTAL_VERSES } from '@/types/deen';

export function randomVerseId(excludeId?: number, total = TOTAL_VERSES): number {
  if (total <= 1) {
    return 1;
  }

  let next = Math.floor(Math.random() * total) + 1;
  if (excludeId && next === excludeId) {
    next = next === total ? 1 : next + 1;
  }
  return next;
}
