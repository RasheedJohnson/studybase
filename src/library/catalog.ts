/**
 * App-wide catalog for Home subject filters, textbook lists, and study content.
 * Aggregates bundled textbook packages; all data stays local/offline.
 * Study UI should call these helpers so each package can opt into mode subsets
 * without component special cases.
 */

import {
  getAvailableStudyModes as getPsychologyStudyModes,
  getDefinitionsByChapter as getPsychologyDefinitionsByChapter,
  getQuestionsByChapter as getPsychologyQuestionsByChapter,
  getTextbook as getPsychologyTextbook,
  getTextbooks,
  STUDY_MODE_ORDER,
  type ConceptCard,
  type DefinitionCard,
  type Question,
  type StudyModeId,
  type TextbookMetadata,
} from '@/library/psychology/psychology-2022-13thedition';

export type { ConceptCard, DefinitionCard, Question, StudyModeId, TextbookMetadata };
export { STUDY_MODE_ORDER };

export type Subject = {
  id: string;
  name: string;
};

/** Display names for known subject ids (fallback: raw id). */
const SUBJECT_NAMES: Record<string, string> = {
  psychology: 'Psychology',
};

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
  return getPsychologyTextbook(id);
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
  // Today one package; dispatch by id so future bundles plug in here.
  if (book.id === 'psychology-2022-13thedition') {
    return getPsychologyStudyModes();
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
  if (textbookId === 'psychology-2022-13thedition') {
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
  if (textbookId === 'psychology-2022-13thedition') {
    return getPsychologyDefinitionsByChapter(chapterId);
  }
  return [];
}

/**
 * Chapter concepts when the textbook offers Concepts; otherwise [].
 * Psychology has no concepts module yet, so this stays empty until a package
 * exports get-concepts and lists "concepts" in studyModes.
 */
export function getConceptsByChapter(
  textbookId: string,
  _chapterId: string | null | undefined
): ConceptCard[] {
  if (!getAvailableStudyModes(textbookId).includes('concepts')) {
    return [];
  }
  // No bundled textbook exposes Concepts yet.
  return [];
}
