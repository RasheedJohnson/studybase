import type { Chapter, ChapterId } from './types';

/** True when chapterId is present in the catalog. */
export function isChapterInCatalog(chapterId: string, catalog: Chapter[]): boolean {
  return catalog.some((chapter) => chapter.id === chapterId);
}

/**
 * Keep a stored or routed chapter id when valid; otherwise fall back to the
 * first catalog entry (or "" if the catalog is empty).
 */
export function coerceChapterId(
  chapterId: string | null | undefined,
  catalog: Chapter[]
): ChapterId {
  if (chapterId && isChapterInCatalog(chapterId, catalog)) {
    return chapterId;
  }
  return catalog[0]?.id ?? '';
}
