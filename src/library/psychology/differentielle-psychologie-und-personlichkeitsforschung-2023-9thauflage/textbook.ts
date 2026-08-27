import type { StudyModeId, TextbookId, TextbookMetadata } from './types';

/**
 * No study modes yet. Concepts / questions / definitions stay off until
 * their data modules are exported from the barrel.
 */
const HAGEMANN_STUDY_MODES: readonly StudyModeId[] = [];

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
    'Hagemann, Spinath, and Mueller. Chapters for offline study (concepts coming later).',
  studyModes: HAGEMANN_STUDY_MODES,
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
