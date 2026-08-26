/**
 * Q&A items from ./data/questions.json.
 */

import questionsJson from './data/questions.json';

import { getChapter } from './chapters';
import type { Question } from './types';

const questions = questionsJson as Question[];

/** Question cards only; chapter banners live in chapters.json. */
export function getQuestions(): Question[] {
  return questions;
}

/** Questions for one chapter. Unknown or empty ids yield []. */
export function getQuestionsByChapter(chapterId: string | null | undefined): Question[] {
  if (!chapterId || !getChapter(chapterId)) {
    return [];
  }
  return questions.filter((item) => item.chapterId === chapterId);
}
