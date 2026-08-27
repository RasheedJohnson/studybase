/**
 * Content schema for Hagemann et al. Differentielle Psychologie (9. Auflage).
 * Chapters-only package for now; study modes stay empty until concepts/Q&A land.
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

/**
 * One concept card. Flip layout mirrors Questions (name front, explanation back).
 * Declared for catalog type compatibility; this package does not ship concepts yet.
 * Catalog content language will drive bilingual concept copy when that JSON lands.
 */
export type ConceptCard = {
  id: number;
  chapterId: ChapterId;
  concept: string;
  explanation: string;
};
