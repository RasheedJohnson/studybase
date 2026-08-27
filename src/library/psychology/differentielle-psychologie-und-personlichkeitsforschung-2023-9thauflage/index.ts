/**
 * Public API for Hagemann Differentielle Psychologie und Persönlichkeitsforschung
 * (9. Auflage, 2023). Chapters + bilingual Concepts.
 */

export {
  chapterDisplayTitle,
  chapterHeading,
  chapterShortLabel,
  getChapter,
  getChapters,
  isChapterInCatalog,
  resolveChapterId,
} from './chapters';
export { getConceptsByChapter, resolveConceptCard } from './get-concepts';
export {
  getSelectedChapterId,
  setSelectedChapterId,
  subscribeSelectedChapter,
  useSelectedChapterId,
} from './last-chapter';
export {
  getAvailableStudyModes,
  STUDY_MODE_ORDER,
} from './study-modes';
export {
  getTextbook,
  getTextbooks,
  isTextbookId,
  HAGEMANN_DIFFERENTIELLE_2023_9TH_AUFLAGE,
} from './textbook';
export type {
  Chapter,
  ChapterId,
  ConceptCard,
  ConceptSourceConcept,
  ConceptSourceRow,
  ConceptSourceSummary,
  ContentLanguage,
  StudyModeId,
  TextbookId,
  TextbookMetadata,
} from './types';
export { coerceChapterId } from './utils';
