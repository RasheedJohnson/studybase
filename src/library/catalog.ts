/**
 * App-wide catalog for Home subject filters, textbook lists, and study content.
 * Aggregates bundled textbook packages; all data stays local/offline.
 * Study UI should call these helpers so each package can opt into mode subsets
 * without component special cases.
 */

import { useSyncExternalStore } from 'react';

import {
  getAvailableStudyModes as getHagemannStudyModes,
  getChapter as getHagemannChapter,
  getChapters as getHagemannChapters,
  getTextbook as getHagemannTextbook,
  getTextbooks as getHagemannTextbooks,
} from '@/library/psychology/differentielle-psychologie-und-personlichkeitsforschung-2023-9thauflage';
import {
  getAvailableStudyModes as getPsychologyStudyModes,
  getChapter as getPsychologyChapter,
  getChapters as getPsychologyChapters,
  getDefinitionsByChapter as getPsychologyDefinitionsByChapter,
  getQuestionsByChapter as getPsychologyQuestionsByChapter,
  getTextbook as getPsychologyTextbook,
  getTextbooks as getPsychologyTextbooks,
  STUDY_MODE_ORDER,
  type ConceptCard,
  type DefinitionCard,
  type Question,
  type StudyModeId,
} from '@/library/psychology/psychology-2022-13thedition';

export type { ConceptCard, DefinitionCard, Question, StudyModeId };
export { STUDY_MODE_ORDER };

/** Catalog chapter shape shared by every bundled package. */
export type Chapter = {
  id: string;
  number: number | null;
  title: string;
};

/** Catalog textbook entry (package ids stay string-stable across bundles). */
export type TextbookMetadata = {
  id: string;
  subject: string;
  title: string;
  editionLabel: string;
  year: number;
  description: string;
  studyModes: readonly StudyModeId[];
};

export type Subject = {
  id: string;
  name: string;
};

const PSYCHOLOGY_ID = 'psychology-2022-13thedition';
const HAGEMANN_ID =
  'differentielle-psychologie-und-personlichkeitsforschung-2023-9thauflage';

/** Display names for known subject ids (fallback: raw id). */
const SUBJECT_NAMES: Record<string, string> = {
  psychology: 'Psychology',
};

const EMPTY_CHAPTERS: Chapter[] = [];

/** All bundled textbooks, stable package order. */
export function getTextbooks(): TextbookMetadata[] {
  return [...getPsychologyTextbooks(), ...getHagemannTextbooks()];
}

/** Unique subjects derived from bundled textbooks, stable order of first appearance. */
export function getSubjects(): Subject[] {
  const seen = new Set<string>();
  const subjects: Subject[] = [];

  for (const book of getTextbooks()) {
    if (seen.has(book.subject)) {
      continue;
    }
    seen.add(book.subject);
    subjects.push({
      id: book.subject,
      name: SUBJECT_NAMES[book.subject] ?? book.subject,
    });
  }

  return subjects;
}

/** Textbooks for one subject id; empty when none match. */
export function getTextbooksForSubject(subjectId: string): TextbookMetadata[] {
  return getTextbooks().filter((book) => book.subject === subjectId);
}

/** Metadata for a known catalog id; null when missing. */
export function getTextbook(id: string): TextbookMetadata | null {
  return getPsychologyTextbook(id) ?? getHagemannTextbook(id);
}

/** Chapters for a catalog textbook; empty when the id is unknown. */
export function getChapters(textbookId: string): Chapter[] {
  if (textbookId === PSYCHOLOGY_ID) {
    return getPsychologyChapters();
  }
  if (textbookId === HAGEMANN_ID) {
    return getHagemannChapters();
  }
  return EMPTY_CHAPTERS;
}

/** Single chapter for a textbook; undefined when textbook or chapter is unknown. */
export function getChapter(
  textbookId: string,
  chapterId: string
): Chapter | undefined {
  if (textbookId === PSYCHOLOGY_ID) {
    return getPsychologyChapter(chapterId);
  }
  if (textbookId === HAGEMANN_ID) {
    return getHagemannChapter(chapterId);
  }
  return undefined;
}

/**
 * Short picker label: padded number, or first letter of unnumbered slug
 * (appendix-c -> C). Shared so ChapterPicker stays package-agnostic.
 */
export function chapterShortLabel(chapter: Chapter): string {
  if (chapter.number === null) {
    const slug = chapter.id.startsWith('appendix-')
      ? chapter.id.slice('appendix-'.length)
      : chapter.id;
    return slug.slice(0, 1).toUpperCase() || '?';
  }
  return String(chapter.number).padStart(2, '0');
}

/** Catalog heading, e.g. "08 - Memory" or "C - Appendix C". */
export function chapterHeading(chapter: Chapter): string {
  return `${chapterShortLabel(chapter)} - ${chapter.title}`;
}

/**
 * Study modes the textbook package exposes, in stable picker order.
 * Unknown ids yield []. Modes without package data/API are omitted.
 */
export function getAvailableStudyModes(textbookId: string): StudyModeId[] {
  const book = getTextbook(textbookId);
  if (!book) {
    return [];
  }
  if (textbookId === PSYCHOLOGY_ID) {
    return getPsychologyStudyModes();
  }
  if (textbookId === HAGEMANN_ID) {
    return getHagemannStudyModes();
  }
  const offered = new Set(book.studyModes);
  return STUDY_MODE_ORDER.filter((mode) => offered.has(mode));
}

/** First available mode for the textbook, or null when none are wired. */
export function getDefaultStudyMode(textbookId: string): StudyModeId | null {
  return getAvailableStudyModes(textbookId)[0] ?? null;
}

/** Chapter questions when the textbook offers Questions; otherwise []. */
export function getQuestionsByChapter(
  textbookId: string,
  chapterId: string | null | undefined
): Question[] {
  if (!getAvailableStudyModes(textbookId).includes('questions')) {
    return [];
  }
  if (textbookId === PSYCHOLOGY_ID) {
    return getPsychologyQuestionsByChapter(chapterId);
  }
  return [];
}

/** Chapter definitions when the textbook offers Definitions; otherwise []. */
export function getDefinitionsByChapter(
  textbookId: string,
  chapterId: string | null | undefined
): DefinitionCard[] {
  if (!getAvailableStudyModes(textbookId).includes('definitions')) {
    return [];
  }
  if (textbookId === PSYCHOLOGY_ID) {
    return getPsychologyDefinitionsByChapter(chapterId);
  }
  return [];
}

/**
 * Chapter concepts when the textbook offers Concepts; otherwise [].
 * No bundled textbook exposes Concepts yet.
 */
export function getConceptsByChapter(
  textbookId: string,
  _chapterId: string | null | undefined
): ConceptCard[] {
  if (!getAvailableStudyModes(textbookId).includes('concepts')) {
    return [];
  }
  return [];
}

// --- Session chapter selection (shared across packages) ---------------------

const selections = new Map<string, string>();
const listeners = new Set<() => void>();

function emitSelectedChapter() {
  for (const listener of listeners) {
    listener();
  }
}

function resolveChapterId(textbookId: string, chapterId: string | null | undefined): string {
  const catalog = getChapters(textbookId);
  if (chapterId && catalog.some((chapter) => chapter.id === chapterId)) {
    return chapterId;
  }
  return catalog[0]?.id ?? '';
}

/** useSyncExternalStore subscribe for catalog chapter selection. */
export function subscribeSelectedChapter(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * Current chapter for a catalog textbook. Unknown textbook ids yield "".
 * Missing or stale stored ids fall back to the first catalog entry.
 */
export function getSelectedChapterId(textbookId: string): string {
  if (!getTextbook(textbookId)) {
    return '';
  }
  return resolveChapterId(textbookId, selections.get(textbookId));
}

/**
 * Persist a chapter choice for a catalog textbook.
 * No-ops on unknown textbook or unknown chapter so a bad write cannot wipe a valid selection.
 */
export function setSelectedChapterId(textbookId: string, chapterId: string): void {
  if (!getTextbook(textbookId) || !getChapter(textbookId, chapterId)) {
    return;
  }
  if (selections.get(textbookId) === chapterId) {
    return;
  }
  selections.set(textbookId, chapterId);
  emitSelectedChapter();
}

/**
 * Reactive selected chapter for any catalog textbook.
 * Safe across study modes and packages without remount resets.
 */
export function useSelectedChapterId(textbookId: string): {
  chapterId: string;
  setChapterId: (chapterId: string) => void;
  chapters: Chapter[];
} {
  const chapterId = useSyncExternalStore(
    subscribeSelectedChapter,
    () => getSelectedChapterId(textbookId),
    () => getSelectedChapterId(textbookId)
  );

  function setChapterId(next: string) {
    setSelectedChapterId(textbookId, next);
  }

  const chapters = getTextbook(textbookId) ? getChapters(textbookId) : EMPTY_CHAPTERS;

  return { chapterId, setChapterId, chapters };
}
