/**
 * App-wide catalog for Home subject filters and textbook lists.
 * Aggregates bundled textbook packages; all data stays local/offline.
 */

import {
  getTextbooks,
  type TextbookMetadata,
} from '@/library/psychology/psychology-2022-13thedition';

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
