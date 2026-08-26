/**
 * Q&A items from lib/data/questions.json.
 * Used by /dashboard/questions.
 */

import questions from "@/lib/data/questions.json";
import type { Question } from "./types";

/** Question cards only; chapter banners live in chapters.json. */
export function getQuestions(): Question[] {
  return questions;
}
