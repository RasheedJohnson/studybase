/**
 * Public API for Hagemann Differentielle Psychologie und Persönlichkeitsforschung
 * (9. Auflage, 2023). Chapters only; study content modules come later.
 */

export {
  chapterHeading,
  chapterShortLabel,
  getChapter,
  getChapters,
  isChapterInCatalog,
  resolveChapterId,
} from './chapters';
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
  StudyModeId,
  TextbookId,
  TextbookMetadata,
} from './types';
export { coerceChapterId } from './utils';
