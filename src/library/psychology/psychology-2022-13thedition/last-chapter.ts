/**
 * Selected chapter per textbook for the active app session.
 * Questions and definitions share this store so tab switches keep the same chapter.
 * Module-level map (not React tree state) so any screen can read/write without a provider.
 */

import { useSyncExternalStore } from 'react';

import { getChapter, getChapters, resolveChapterId } from './chapters';
import { getTextbook } from './textbook';
import type { Chapter, ChapterId } from './types';

const selections = new Map<string, ChapterId>();
const listeners = new Set<() => void>();
const EMPTY_CHAPTERS: Chapter[] = [];

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

/** useSyncExternalStore subscribe. */
export function subscribeSelectedChapter(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * Current chapter for a textbook. Unknown textbook ids yield "".
 * Missing or stale stored ids fall back to the first catalog entry.
 */
export function getSelectedChapterId(textbookId: string): ChapterId {
  if (!getTextbook(textbookId)) {
    return '';
  }
  return resolveChapterId(selections.get(textbookId));
}

/**
 * Persist a chapter choice for a textbook.
 * No-ops on unknown textbook or unknown chapter so a bad write cannot wipe a valid selection.
 */
export function setSelectedChapterId(textbookId: string, chapterId: string): void {
  if (!getTextbook(textbookId) || !getChapter(chapterId)) {
    return;
  }
  if (selections.get(textbookId) === chapterId) {
    return;
  }
  selections.set(textbookId, chapterId);
  emit();
}

/**
 * Reactive selected chapter for a textbook.
 * Safe for questions and definitions screens to share without remount resets.
 */
export function useSelectedChapterId(textbookId: string): {
  chapterId: ChapterId;
  setChapterId: (chapterId: string) => void;
  chapters: Chapter[];
} {
  const chapterId = useSyncExternalStore(
    subscribeSelectedChapter,
    () => getSelectedChapterId(textbookId),
    () => getSelectedChapterId(textbookId)
  );

  function setChapterId(next: string) {
    setSelectedChapterId(textbookId, next);
  }

  const chapters = getTextbook(textbookId) ? getChapters() : EMPTY_CHAPTERS;

  return { chapterId, setChapterId, chapters };
}
