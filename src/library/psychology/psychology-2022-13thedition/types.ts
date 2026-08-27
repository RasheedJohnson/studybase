/**
 * Content schema. Bundled JSON under ./data matches these types.
 */

/** Stable slug for this bundled textbook (folder name). */
export type TextbookId = 'psychology-2022-13thedition';

/**
 * In-screen study modes. Stable order for pickers: Questions, Definitions, Concepts.
 * A mode is offered only when the textbook package wires matching data + getters.
 */
export type StudyModeId = 'questions' | 'definitions' | 'concepts';

/**
 * Content language for bilingual chapter titles (and later Concepts copy).
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
  /**
   * When true, the textbook shell shows an EN/DE language control.
   * English-primary packages keep this false even if titleDe mirrors titleEn.
   */
  bilingualContent: boolean;
  /** Session default when no content-language preference is stored. */
  defaultContentLanguage: ContentLanguage;
};

/** Stable id: "0"-"16" for numbered chapters, slug for extras (e.g. appendix-c). */
export type ChapterId = string;

/**
 * One textbook chapter.
 * Titles live only in titleEn / titleDe (no legacy `title` field).
 * When a verified German title is unavailable, titleDe mirrors titleEn so
 * language resolution never yields an empty string.
 */
export type Chapter = {
  id: ChapterId;
  /** 0-16 for numbered chapters; null for unnumbered material (appendix). */
  number: number | null;
  /** English chapter title. */
  titleEn: string;
  /** German chapter title, or English mirror when DE is not yet sourced. */
  titleDe: string;
};

/** One EN/DE definition card (not a chapter/section banner). */
export type DefinitionCard = {
  id: number;
  chapterId: ChapterId;
  termEn: string;
  definitionEn: string;
  termDe: string;
  definitionDe: string;
};

/** One Q&A item (not a chapter banner). */
export type Question = {
  id: number;
  chapterId: ChapterId;
  question: string;
  answer: string;
};

/**
 * One concept or section-summary card for the Concepts study list.
 * Flip layout: name/title front, explanation/body back.
 * Add data/concepts.json + get-concepts.ts and list "concepts" in studyModes to opt in.
 */
export type ConceptCard = {
  id: number;
  chapterId: ChapterId;
  /** Defaults to concept when omitted (packages without summary rows). */
  kind?: 'concept' | 'summary';
  concept: string;
  explanation: string;
  /** Section heading for summary cards. */
  sectionTitle?: string;
};
