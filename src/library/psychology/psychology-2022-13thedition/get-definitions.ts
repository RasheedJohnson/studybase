/**
 * Definition cards from ./data/definitions.json.
 */

import definitionsJson from './data/definitions.json';

import { getChapter } from './chapters';
import type { DefinitionCard } from './types';

const definitions = definitionsJson as DefinitionCard[];

/** Definition cards only; chapter/section headers live in chapters.json. */
export function getDefinitions(): DefinitionCard[] {
  return definitions;
}

/** Definitions for one chapter. Unknown or empty ids yield []. */
export function getDefinitionsByChapter(chapterId: string | null | undefined): DefinitionCard[] {
  if (!chapterId || !getChapter(chapterId)) {
    return [];
  }
  return definitions.filter((item) => item.chapterId === chapterId);
}
