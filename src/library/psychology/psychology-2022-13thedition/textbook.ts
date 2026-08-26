import type { TextbookId, TextbookMetadata } from './types';

/** Bundled Psychology 13th edition. Content lives under ./data (offline). */
export const PSYCHOLOGY_2022_13TH_EDITION: TextbookMetadata = {
  id: 'psychology-2022-13thedition',
  subject: 'psychology',
  title: 'Psychology',
  editionLabel: '13th Edition',
  year: 2022,
  description: 'Myers and DeWall. Chapters, definitions, and review questions.',
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
