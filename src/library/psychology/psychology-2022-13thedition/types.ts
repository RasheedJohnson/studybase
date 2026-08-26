/**
 * Content schema. Bundled JSON under ./data matches these types.
 */

/** Stable slug for this bundled textbook (folder name). */
export type TextbookId = 'psychology-2022-13thedition';

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
};

/** Stable id: "0"-"16" for numbered chapters, slug for extras (e.g. appendix-c). */
export type ChapterId = string;

/** One textbook chapter. */
export type Chapter = {
  id: ChapterId;
  /** 0-16 for numbered chapters; null for unnumbered material (appendix). */
  number: number | null;
  /** Short name, e.g. "Memory" or "Appendix C". */
  title: string;
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
