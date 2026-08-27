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
};

/** Stable id: "0"-"12" for numbered chapters (0 = Vorwort). */
export type ChapterId = string;

/** One textbook chapter. */
export type Chapter = {
  id: ChapterId;
  /** 0-12 for numbered chapters; null reserved for unnumbered extras. */
  number: number | null;
  /** Short name, e.g. "Grundlagen" or "Vorwort zur 9. Auflage". */
  title: string;
};

/**
 * One concept card. Flip layout mirrors Questions (name front, explanation back).
 * Declared for catalog type compatibility; this package does not ship concepts yet.
 */
export type ConceptCard = {
  id: number;
  chapterId: ChapterId;
  concept: string;
  explanation: string;
};
