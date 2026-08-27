import type { ImageSourcePropType } from 'react-native';

import type { StudyModeId, TextbookId, TextbookMetadata } from './types';

/**
 * Modes wired for this package today. Concepts stays off until
 * data/concepts.json and get-concepts.ts are exported from the barrel.
 */
const PSYCHOLOGY_STUDY_MODES: readonly StudyModeId[] = ['questions', 'definitions'];

const PSYCHOLOGY_COVER = require('./assets/cover.png') as ImageSourcePropType;

/** Bundled Psychology 13th edition. Content lives under ./data (offline). */
export const PSYCHOLOGY_2022_13TH_EDITION: TextbookMetadata = {
  id: 'psychology-2022-13thedition',
  subject: 'psychology',
  title: 'Psychology',
  editionLabel: '13th Edition',
  year: 2022,
  description: 'Myers and DeWall. Chapters, definitions, and review questions.',
  coverImage: PSYCHOLOGY_COVER,
  studyModes: PSYCHOLOGY_STUDY_MODES,
  // English-primary; titleDe mirrors titleEn until verified German titles exist.
  bilingualContent: false,
  defaultContentLanguage: 'en',
};

const TEXTBOOKS: readonly TextbookMetadata[] = [PSYCHOLOGY_2022_13TH_EDITION];

/** All textbooks known to this package (currently one). */
export function getTextbooks(): readonly TextbookMetadata[] {
  return TEXTBOOKS;
}

/** Metadata for a known id; null when the slug is missing or unknown. */
export function getTextbook(id: string): TextbookMetadata | null {
  const match = TEXTBOOKS.find((book) => book.id === id);
  return match ?? null;
}

/** Narrow unknown strings to TextbookId when present in the catalog. */
export function isTextbookId(id: string): id is TextbookId {
  return TEXTBOOKS.some((book) => book.id === id);
}
