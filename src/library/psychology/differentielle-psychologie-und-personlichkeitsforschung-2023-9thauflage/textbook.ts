import type { ImageSourcePropType } from 'react-native';

import type { StudyModeId, TextbookId, TextbookMetadata } from './types';

/** Concepts is wired; questions/definitions stay off until their modules land. */
const HAGEMANN_STUDY_MODES: readonly StudyModeId[] = ['concepts'];

const HAGEMANN_COVER =
  require('./assets/differentielle-psychologie-und-personlichkeitsforschung-2023-9thauflage.png') as ImageSourcePropType;

/**
 * Bundled Hagemann Differentielle Psychologie, 9. Auflage (2023).
 * Chapter catalog lives under ./data (offline). ISBN 978-3-17-039779-8 (PDF).
 */
export const HAGEMANN_DIFFERENTIELLE_2023_9TH_AUFLAGE: TextbookMetadata = {
  id: 'differentielle-psychologie-und-personlichkeitsforschung-2023-9thauflage',
  subject: 'psychology',
  title: 'Differentielle Psychologie und Persönlichkeitsforschung',
  editionLabel: '9. Auflage',
  year: 2023,
  description:
    'Hagemann, Spinath, and Mueller. Offline chapters with bilingual Concepts.',
  coverImage: HAGEMANN_COVER,
  studyModes: HAGEMANN_STUDY_MODES,
  // Bilingual chapter titles + Concepts copy; language control on the shell.
  bilingualContent: true,
  defaultContentLanguage: 'de',
};

const TEXTBOOKS: readonly TextbookMetadata[] = [
  HAGEMANN_DIFFERENTIELLE_2023_9TH_AUFLAGE,
];

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
