# Current architecture

StudyBase (this repo) is an Expo SDK 57 app with Expo Router, React Native 0.86, and React 19. Path alias `@/*` maps to `src/*`. The product goal is an offline-first study app for bundled textbook JSON (Psychology 13th edition first), with a layout spirit shared by PsychBase (web) and the older StudyBase Android app.

## Stack

- **Routing:** Expo Router under `src/app/`. Root `_layout.tsx` is a `Stack` (tabs group + textbook detail). Tabs live in `src/app/(tabs)/` (`index` Home, `explore`). Textbook detail is `src/app/textbook/[id].tsx`.
- **Tabs:** `AppTabs` (`src/components/app-tabs.tsx` / `.web.tsx`) via Expo Router native tabs, mounted from `(tabs)/_layout.tsx`
- **Styling:** NativeWind 4.2 (Tailwind CSS 3.4) with `darkMode: 'class'`, Metro via `withNativeWind` on `src/global.css`
- **Theming:** `ThemePreferenceProvider` + `ThemeToggle` in `src/components/foundation.tsx` (preference: system, light, dark). `colorScheme.set` keeps NativeWind `dark:` classes and React Native `Appearance` aligned so navigation chrome follows. `userInterfaceStyle` is `automatic` in `app.json`. Home mounts `ThemeToggle` in its header.
- **Tokens:** Semantic colors also live in `src/constants/theme.ts` for StyleSheet-based starter UI (`ThemedView`, `ThemedText`, tab colors)

## Foundation UI (`src/components/foundation.tsx`)

Reusable app-wide primitives:

| Component | Role |
| --- | --- |
| `Screen` | Safe-area page shell, optional scroll, max content width; `safeTop={false}` under Stack headers |
| `Card` | Flat outlined surface (no elevation), study-style plate |
| `Button` | Primary / secondary / ghost; 48dp minimum hit target |
| `ThemeToggle` | Cycles system → light → dark; accessible label announces preference |

## Home (`src/app/(tabs)/index.tsx`)

Product start screen (replaces the Expo welcome UI):

- Brand header (Studybase) plus intro and `ThemeToggle`
- Subject filters from `src/library/catalog.ts` (`getSubjects`), rendered as accessible radio chips (Psychology today)
- Textbook cards for the selected subject via `getTextbooksForSubject` (Psychology 13th Edition from the psychology package)
- Card press navigates to `/textbook/[id]` on the root Stack
- Empty state when the filter yields no textbooks (filters stay usable)
- Uses foundation `Screen` / `Card` / `FoundationText`; scroll + `BottomTabInset` for small phones and larger widths; light and dark via NativeWind tokens

## Textbook route (`src/app/textbook/[id].tsx`)

Offline study shell for one catalog textbook:

- Resolves metadata with `getTextbook`; unknown ids show an unavailable state and Back to Home
- Optional `chapter` search param seeds `setSelectedChapterId` (invalid chapter ids are ignored; selection stays in the session store, not the URL)
- `ChapterPicker` (`src/components/chapter-picker.tsx`) reads `useSelectedChapterId` chapters and writes via `setChapterId`
- In-screen Questions / Definitions tabs (`src/components/study-tabs.tsx`) keep tab UI state local so switching panels does not change the chapter
- Content lists use `getQuestionsByChapter` / `getDefinitionsByChapter` as plain placeholders (flip cards deferred)
- Empty states cover missing chapters and empty chapter content; loading covers unresolved route params
- Uses `Screen` with `safeTop={false}` under the Stack header; lists scroll inside the screen so narrow widths do not overflow

In-screen tabs (not nested Expo Router tabs) keep `/textbook/[id]` navigation predictable on Android, iOS, and web.

## Catalog (`src/library/catalog.ts`)

Thin offline aggregator over bundled textbook packages:

| Helper | Role |
| --- | --- |
| `getSubjects` | Unique subjects from textbook metadata (stable first-seen order) |
| `getTextbooksForSubject` | Filter `getTextbooks()` by subject id (`[]` when none match) |

## Data layer (bundled, offline)

Package root: `src/library/psychology/psychology-2022-13thedition/` (import via `@/library/psychology/psychology-2022-13thedition`).

| Piece | Role |
| --- | --- |
| `data/chapters.json` | 18 chapters (`id`, `number` or null, `title`) |
| `data/definitions.json` | 683 EN/DE definition cards |
| `data/questions.json` | 316 Q&A items |
| `types.ts` | `TextbookMetadata`, `Chapter`, `DefinitionCard`, `Question` |
| `textbook.ts` | Catalog metadata; `getTextbook` / `getTextbooks` / `isTextbookId` (unknown ids → null/false) |
| `chapters.ts` | `getChapters`, `getChapter`, `resolveChapterId`, labels |
| `get-definitions.ts` / `get-questions.ts` | Full lists plus `*ByChapter` (unknown chapter → `[]`) |
| `last-chapter.ts` | Session map of textbook id → selected chapter; `useSelectedChapterId` via `useSyncExternalStore` |
| `utils.ts` | `coerceChapterId` / `isChapterInCatalog` |
| `index.ts` | Public barrel |

JSON is imported statically (Metro bundles it). No network is required.

Chapter selection is keyed by textbook id so questions and definitions share one chapter for the session. Invalid textbook ids yield an empty selection. Invalid chapter writes are ignored (current selection kept). Unset selection reads fall back to the first catalog chapter. Content filters yield `[]` for unknown chapter ids.

## Not built yet

Flip-card study interactions for questions and definitions. Explore remains the Expo starter tab.

## Config touchpoints

- `babel.config.js` - `babel-preset-expo` + NativeWind JSX source / babel preset
- `metro.config.js` - Expo default config wrapped with NativeWind
- `tailwind.config.js` - content under `src/`, semantic colors aligned with `Colors`
- `nativewind-env.d.ts` - NativeWind className types
