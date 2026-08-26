/**
 * Last selected chapter, kept in localStorage so Home and hash-less
 * dashboard URLs can restore it. Same-tab writers notify subscribers
 * because the `storage` event only fires in other tabs.
 */

const STORAGE_KEY = "psychbase:chapter";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) {
    emit();
  }
}

/** useSyncExternalStore subscribe. Attaches the window listener once. */
export function subscribeLastChapter(onChange: () => void): () => void {
  const isFirst = listeners.size === 0;
  listeners.add(onChange);
  if (isFirst) {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function readLastChapterId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastChapterId(chapterId: string): void {
  if (!chapterId) {
    return;
  }
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === chapterId) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, chapterId);
    emit();
  } catch {
    /* Private mode / quota — selection still lives in the URL hash. */
  }
}
