# Current architecture

StudyBase (this repo) is an Expo SDK 57 app with Expo Router, React Native 0.86, and React 19. Path alias `@/*` maps to `src/*`. The product goal is an offline-first study app for bundled textbook JSON (Psychology 13th edition first), with a layout spirit shared by PsychBase (web) and the older StudyBase Android app.

## Stack

- **Routing:** Expo Router under `src/app/`. Root `_layout.tsx` is a `Stack` (tabs group + textbook detail). Tabs live in `src/app/(tabs)/` (`index` Home, `explore`). Textbook detail is `src/app/textbook/[id].tsx`.
- **Tabs:** `AppTabs` (`src/components/app-tabs.tsx` / `.web.tsx`) via Expo Router native tabs, mounted from `(tabs)/_layout.tsx`. Web chrome brands as Studybase and keeps 48dp tab targets.
- **Styling:** NativeWind 4.2 (Tailwind CSS 3.4) with `darkMode: 'class'`, Metro via `withNativeWind` on `src/global.css` (`inlineRem: 16` for Reusables). Web keyboard focus uses `:focus-visible` rings in `global.css` plus NativeWind `focus:` borders on study controls.
- **UI kit:** React Native Reusables (manual install on the existing Expo + NativeWind app). CLI config is `components.json`; shared helpers live in `src/lib/` (`utils.ts` `cn`, `theme.ts` `THEME` / `NAV_THEME`). Future CLI components land in `src/components/ui/`. Root layout mounts `PortalHost` from `@rn-primitives/portal` as the last child under navigation `ThemeProvider` so menus and dialogs can portal above the Stack.
- **Theming:** `ThemePreferenceProvider` + `ThemeToggle` in `src/components/foundation.tsx` (preference: system, light, dark). `colorScheme.set` keeps NativeWind `dark:` classes and React Native `Appearance` aligned so navigation chrome follows. Reusables CSS variables live in `src/global.css` (`:root` / `.dark:root`) and are mirrored in `src/lib/theme.ts`; values are aligned with existing study semantic colors. Study-only tokens such as `surface` remain as hex Tailwind colors for current screens. `userInterfaceStyle` is `automatic` in `app.json`. Home mounts `ThemeToggle` in its header.
- **Tokens:** Semantic colors also live in `src/constants/theme.ts` for StyleSheet-based starter UI (`ThemedView`, `ThemedText`, tab colors)
- **Animation:** `react-native-reanimated` 4.5 (bundled with Expo 57) for lightweight native transitions such as study flip cards
- **Quality:** `expo lint` (ESLint 9 + `eslint-config-expo`) and `tsc --noEmit`. Nested `my-expo-app/` is excluded from TypeScript and ESLint; it is unused starter leftover.

## Foundation UI (`src/components/foundation.tsx`)

Reusable app-wide primitives:

| Component | Role |
| --- | --- |
| `Screen` | Safe-area page shell, optional scroll, max content width; `safeTop={false}` under Stack headers |
| `Card` | Flat outlined surface (no elevation), study-style plate |
| `Button` | Primary / secondary / ghost; 48dp minimum hit target |
| `ThemeToggle` | Cycles system → light → dark; accessible label announces preference |

Class merging uses shared `cn` from `src/lib/utils.ts` (clsx + tailwind-merge), not a local duplicate.

## Flip cards (`src/components/flip-card.tsx`)

Shared typed `FlipCard` for study prompts:

- Front and back faces flip on press (and keyboard activation via `Pressable`)
- Reanimated scaleX hinge (shrink, swap face, expand) so height always follows the visible copy
- Only the active face mounts; long answers and bilingual definitions are not clipped
- `useReducedMotion` / `ReduceMotion.System` jumps instantly when the OS asks for less motion
- In-flight taps are ignored so rapid presses cannot leave hinge progress and expanded state out of sync
- Accessibility: `button` role, state-aware label and hint, `expanded`, polite live region; face trees hidden so only the visible side is announced

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
- Optional `chapter` search param seeds `setSelectedChapterId` during render (invalid chapter ids are ignored; selection stays in the session store, not the URL)
- `ChapterPicker` (`src/components/chapter-picker.tsx`) reads `useSelectedChapterId` chapters and writes via `setChapterId`
- In-screen Questions / Definitions tabs (`src/components/study-tabs.tsx`) keep tab UI state local so switching panels does not change the chapter
- Questions list: `getQuestionsByChapter` → `FlipCard` (question front, answer back)
- Definitions list: `getDefinitionsByChapter` → `FlipCard` (EN/DE terms on front; English and German definitions on back)
- FlatLists use stable keys (`q-{id}` / `d-{id}`), chapter-scoped list keys, memoized row components, and empty states when a chapter has no rows (Appendix C has definitions only)
- Loading covers unresolved route params; missing chapters show a non-list empty shell
- Uses `Screen` with `safeTop={false}` under the Stack header; lists scroll inside the screen so narrow widths do not overflow

In-screen tabs (not nested Expo Router tabs) keep `/textbook/[id]` navigation predictable on Android, iOS, and web. Web `AppTabs` Home trigger uses `href="/"` (cast to `Href`) so the product home loads; `/(tabs)/index` and `/index` warn as not-found under `expo-router/ui`.

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

JSON is imported statically (Metro bundles it). No network is required for textbook content (`fetch` is unused in `src/`).

Chapter selection is keyed by textbook id so questions and definitions share one chapter for the session. Invalid textbook ids yield an empty selection. Invalid chapter writes are ignored (current selection kept). Unset selection reads fall back to the first catalog chapter. Content filters yield `[]` for unknown chapter ids.

## Not built yet

Explore remains the Expo starter tab (separate from the offline textbook flow). Reusables components (for example Dropdown Menu) are not added yet; only the install foundation is in place.

## Config touchpoints

- `babel.config.js` - `babel-preset-expo` + NativeWind JSX source / babel preset
- `metro.config.js` - Expo default config wrapped with NativeWind (`inlineRem: 16`)
- `tailwind.config.js` - content under `src/`; Reusables CSS-variable colors plus study `surface` / nested `dark` keys; `tailwindcss-animate`
- `src/global.css` - NativeWind layers, web focus rings, Reusables `:root` / `.dark:root` tokens
- `components.json` - React Native Reusables CLI paths (`@/components/ui`, `@/lib/utils`)
- `src/lib/utils.ts` / `src/lib/theme.ts` - shared `cn` and navigation / semantic theme maps
- `nativewind-env.d.ts` - NativeWind className types
- `eslint.config.js` - Expo flat config; ignores `my-expo-app/`
- `tsconfig.json` - `@/*` → `src/*`; excludes `my-expo-app/`
