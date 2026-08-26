/**
 * Content schema. On-disk JSON in lib/data/ matches these types.
 */

/** Stable id: "0"–"16" for numbered chapters, slug for extras (e.g. appendix-c). */
export type ChapterId = string;

/** One textbook chapter. */
export type Chapter = {
  id: ChapterId;
  /** 0–16 for numbered chapters; null for unnumbered material (appendix). */
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
