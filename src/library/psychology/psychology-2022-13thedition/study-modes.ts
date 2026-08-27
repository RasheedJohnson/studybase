/**
 * Declared study-mode capabilities for this textbook package.
 * Availability is metadata-driven (not runtime path checks): a mode appears
 * only when listed on TextbookMetadata.studyModes and backed by exported getters.
 */

import { getTextbook } from './textbook';
import type { StudyModeId } from './types';

/** Stable picker order for every textbook; skip modes the package did not opt into. */
export const STUDY_MODE_ORDER: readonly StudyModeId[] = [
  'questions',
  'definitions',
  'concepts',
];

/** Study modes this package exposes, in picker order. */
export function getAvailableStudyModes(): StudyModeId[] {
  const book = getTextbook('psychology-2022-13thedition');
  if (!book) {
    return [];
  }
  const offered = new Set(book.studyModes);
  return STUDY_MODE_ORDER.filter((mode) => offered.has(mode));
}
