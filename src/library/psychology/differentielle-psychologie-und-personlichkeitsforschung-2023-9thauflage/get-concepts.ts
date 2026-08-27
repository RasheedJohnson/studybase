/**
 * Concept/summary cards from ./data/concepts.json.
 * Resolves bilingual EN/DE fields for the active content language.
 */

import conceptsJson from './data/concepts.json';

import { getChapter } from './chapters';
import type {
  ConceptCard,
  ConceptSourceRow,
  ContentLanguage,
} from './types';

const DEFAULT_LANGUAGE: ContentLanguage = 'de';

const sourceRows = conceptsJson as ConceptSourceRow[];

function pickLocalized(
  language: ContentLanguage,
  en: string,
  de: string
): string {
  if (language === 'de') {
    return de || en;
  }
  return en || de;
}

/** Resolve one source row into a single-language ConceptCard. */
export function resolveConceptCard(
  row: ConceptSourceRow,
  language: ContentLanguage = DEFAULT_LANGUAGE
): ConceptCard {
  const sectionTitle = pickLocalized(
    language,
    row.sectionTitleEn,
    row.sectionTitleDe
  );

  if (row.kind === 'summary') {
    return {
      id: row.id,
      chapterId: row.chapterId,
      kind: 'summary',
      concept: sectionTitle,
      explanation: pickLocalized(language, row.summaryEn, row.summaryDe),
      sectionTitle,
    };
  }

  return {
    id: row.id,
    chapterId: row.chapterId,
    kind: 'concept',
    concept: pickLocalized(language, row.conceptEn, row.conceptDe),
    explanation: pickLocalized(language, row.explanationEn, row.explanationDe),
    sectionTitle,
  };
}

/** All concept/summary rows for a chapter, resolved to one content language. */
export function getConceptsByChapter(
  chapterId: string | null | undefined,
  language: ContentLanguage = DEFAULT_LANGUAGE
): ConceptCard[] {
  if (!chapterId || !getChapter(chapterId)) {
    return [];
  }
  return sourceRows
    .filter((row) => row.chapterId === chapterId)
    .map((row) => resolveConceptCard(row, language));
}
