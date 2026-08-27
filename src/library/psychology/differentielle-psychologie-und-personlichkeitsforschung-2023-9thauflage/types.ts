/**
 * Content schema for Hagemann et al. Differentielle Psychologie (9. Auflage).
 * Chapters + bilingual Concepts (concept/summary rows in data/concepts.json).
 */

/** Stable slug for this bundled textbook (folder name). */
export type TextbookId =
  'differentielle-psychologie-und-personlichkeitsforschung-2023-9thauflage';

/**
 * In-screen study modes. Stable order for pickers: Questions, Definitions, Concepts.
 * A mode is offered only when the textbook package wires matching data + getters.
 */
export type StudyModeId = 'questions' | 'definitions' | 'concepts';

/**
 * Content language for bilingual chapter titles and Concepts copy.
 * Display resolution: preferred field, then the other language, never a third `title`.
 */
export type ContentLanguage = 'en' | 'de';

/** Catalog entry shown on home and textbook shells. */
export type TextbookMetadata = {
  id: TextbookId;
  /** Subject filter key, e.g. "psychology". */
  subject: 'psychology';
  title: string;
  editionLabel: string;
  year: number;
  /** Short blurb for pickers; keep offline-friendly and local. */
  description: string;
  /**
   * Study modes this package exposes (subset of StudyModeId).
   * Omit a mode until its JSON + getter are exported from the package barrel.
   */
  studyModes: readonly StudyModeId[];
  /** When true, the textbook shell shows an EN/DE language control. */
  bilingualContent: boolean;
  /** Session default when no content-language preference is stored. */
  defaultContentLanguage: ContentLanguage;
};

/** Stable id: "0"-"12" for numbered chapters (0 = Vorwort). */
export type ChapterId = string;

/**
 * One textbook chapter.
 * Titles live only in titleEn / titleDe (no legacy `title` field).
 * German titles follow the PDF Inhaltsverzeichnis; English are TOC translations.
 */
export type Chapter = {
  id: ChapterId;
  /** 0-12 for numbered chapters; null reserved for unnumbered extras. */
  number: number | null;
  /** English chapter title. */
  titleEn: string;
  /** German chapter title (source-language TOC). */
  titleDe: string;
};

/** Shared metadata on every bilingual concepts.json row. */
type ConceptRowBase = {
  id: number;
  chapterId: ChapterId;
  sectionId: string;
  sectionTitleEn: string;
  sectionTitleDe: string;
};

/** Concept drill row in concepts.json (bilingual name + explanation). */
export type ConceptSourceConcept = ConceptRowBase & {
  kind: 'concept';
  conceptEn: string;
  explanationEn: string;
  conceptDe: string;
  explanationDe: string;
};

/** Section summary row in concepts.json (bilingual textbook Zusammenfassung). */
export type ConceptSourceSummary = ConceptRowBase & {
  kind: 'summary';
  summaryEn: string;
  summaryDe: string;
};

/** Raw concepts.json entry before language resolution. */
export type ConceptSourceRow = ConceptSourceConcept | ConceptSourceSummary;

/**
 * Language-resolved concept/summary card for the Concepts study list.
 * Flip layout: concept name or summary title on the front; explanation/body on the back.
 */
export type ConceptCard = {
  id: number;
  chapterId: ChapterId;
  kind: 'concept' | 'summary';
  /** Front title: concept name, or section title for summaries. */
  concept: string;
  /** Back body: explanation, or full section summary text. */
  explanation: string;
  /** Section heading shown on summary cards (and for a11y). */
  sectionTitle?: string;
};
