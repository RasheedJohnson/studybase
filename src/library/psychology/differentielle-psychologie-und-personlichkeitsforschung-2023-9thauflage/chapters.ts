/**
 * Chapter catalog from ./data/chapters.json.
 * Shared by home pickers and the textbook study shell.
 */

import chaptersJson from './data/chapters.json';

import type { Chapter, ChapterId, ContentLanguage } from './types';
import { coerceChapterId, isChapterInCatalog } from './utils';

const chapters = chaptersJson as Chapter[];

/** Package default when callers omit a language (German-primary book). */
const DEFAULT_LANGUAGE: ContentLanguage = 'de';

/** All chapters in TOC order (Vorwort first, then 1-12). */
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

/**
 * Display title for the requested language.
 * Preferred field first, then the other language (never a legacy `title`).
 */
export function chapterDisplayTitle(
  chapter: Chapter,
  language: ContentLanguage = DEFAULT_LANGUAGE
): string {
  if (language === 'de') {
    return chapter.titleDe || chapter.titleEn;
  }
  return chapter.titleEn || chapter.titleDe;
}

/** 00-12 for numbered chapters; short id letter for unnumbered extras. */
export function chapterShortLabel(chapter: Chapter): string {
  if (chapter.number === null) {
    return chapter.id.slice(0, 1).toUpperCase() || '?';
  }
  return String(chapter.number).padStart(2, '0');
}

/** Catalog heading, e.g. "01 - Grundlagen" or "00 - Vorwort zur 9. Auflage". */
export function chapterHeading(
  chapter: Chapter,
  language: ContentLanguage = DEFAULT_LANGUAGE
): string {
  return `${chapterShortLabel(chapter)} - ${chapterDisplayTitle(chapter, language)}`;
}

export { isChapterInCatalog };
