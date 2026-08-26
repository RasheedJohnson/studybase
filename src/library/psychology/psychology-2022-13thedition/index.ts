/**
 * Public API for the Psychology 2022 13th edition bundle.
 * All content is imported statically and available offline.
 */

export {
  chapterHeading,
  chapterShortLabel,
  getChapter,
  getChapters,
  isChapterInCatalog,
  resolveChapterId,
} from './chapters';
export { getDefinitions, getDefinitionsByChapter } from './get-definitions';
export { getQuestions, getQuestionsByChapter } from './get-questions';
export {
  getSelectedChapterId,
  setSelectedChapterId,
  subscribeSelectedChapter,
  useSelectedChapterId,
} from './last-chapter';
export {
  getTextbook,
  getTextbooks,
  isTextbookId,
  PSYCHOLOGY_2022_13TH_EDITION,
} from './textbook';
export type {
  Chapter,
  ChapterId,
  DefinitionCard,
  Question,
  TextbookId,
  TextbookMetadata,
} from './types';
export { coerceChapterId } from './utils';
