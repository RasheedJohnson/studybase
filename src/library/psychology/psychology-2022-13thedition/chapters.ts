/**
 * Chapter catalog from ./data/chapters.json.
 * Shared by home pickers and the future textbook shell (questions + definitions).
 */

import chaptersJson from './data/chapters.json';

import type { Chapter, ChapterId } from './types';
import { coerceChapterId, isChapterInCatalog } from './utils';

const chapters = chaptersJson as Chapter[];

/** All chapters, numbered first, extras last. */
export function getChapters(): Chapter[] {
  return chapters;
}

/** Single chapter by id, or undefined when the id is unknown. */
export function getChapter(chapterId: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === chapterId);
}

/**
 * Resolve a chapter id against this textbook catalog.
 * Invalid or empty values become the first chapter (or "").
 */
export function resolveChapterId(chapterId: string | null | undefined): ChapterId {
  return coerceChapterId(chapterId, chapters);
}

/** 00-16 for numbered chapters; C for unnumbered extras (appendix). */
export function chapterShortLabel(chapter: Chapter): string {
  if (chapter.number === null) {
    return 'C';
  }
  return String(chapter.number).padStart(2, '0');
}

/** Catalog heading, e.g. "08 - Memory" or "C - Appendix C". */
export function chapterHeading(chapter: Chapter): string {
  return `${chapterShortLabel(chapter)} - ${chapter.title}`;
}

export { isChapterInCatalog };
