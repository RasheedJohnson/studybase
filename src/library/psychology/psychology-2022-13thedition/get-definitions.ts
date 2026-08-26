/**
 * Definition cards from lib/data/definitions.json.
 * Used by /dashboard/cards.
 */

import definitions from "@/lib/data/definitions.json";
import type { DefinitionCard } from "./types";

/** Definition cards only; chapter/section headers live in chapters.json. */
export function getDefinitions(): DefinitionCard[] {
  return definitions;
}
