# Current architecture

StudyBase (this repo) is an Expo SDK 57 app with Expo Router, React Native 0.86, and React 19. Path alias `@/*` maps to `src/*`. The product goal is an offline-first study app for bundled textbook JSON, with a layout spirit shared by PsychBase (web) and the older StudyBase Android app.

## Stack

- **Routing:** Expo Router under `src/app/`. Root `_layout.tsx` is a `Stack` (tabs group + textbook detail). Tabs live in `src/app/(tabs)/` (`index` Home, `explore`). Textbook detail is `src/app/textbook/[id].tsx`.
- **Tabs:** `AppTabs` (`src/components/app-tabs.tsx` / `.web.tsx`) via Expo Router native tabs, mounted from `(tabs)/_layout.tsx`. Web chrome brands as Studybase, hosts `ThemeToggle`, and keeps 48dp tab targets. Native tab routes use a transparent root Stack header so the shared `headerRight` toggle stays available without a heavy bar.
- **Styling:** NativeWind 4.2 (Tailwind CSS 3.4) with `darkMode: 'class'`, Metro via `withNativeWind` on `src/global.css` (`inlineRem: 16` for Reusables). Web keyboard focus uses `:focus-visible` rings in `global.css` plus NativeWind `focus:` borders on study controls.
- **UI kit:** React Native Reusables (manual install on the existing Expo + NativeWind app). CLI config is `components.json`; shared helpers live in `src/lib/` (`utils.ts` `cn`, `theme.ts` `THEME` / `NAV_THEME`). Installed UI primitives live in `src/components/ui/` (Dropdown Menu plus `text`, `icon`, `native-only-animated-view`). Root layout mounts `PortalHost` from `@rn-primitives/portal` as the last child under navigation `ThemeProvider` so menus and dialogs can portal above the Stack. Dropdown Menu depends on `@rn-primitives/dropdown-menu`, `lucide-react-native`, and `react-native-svg`.
- **Theming:** `ThemePreferenceProvider` + icon `ThemeToggle` in `src/components/foundation.tsx` (preference: system, light, dark; Lucide Monitor / Sun / Moon). `colorScheme.set` keeps NativeWind `dark:` classes and React Native `Appearance` aligned so navigation chrome follows. Reusables CSS variables live in `src/global.css` (`:root` / `.dark:root`) and are mirrored in `src/lib/theme.ts`; values are aligned with existing study semantic colors. Study-only tokens such as `surface` remain as hex Tailwind colors for current screens. Surface hierarchy: soft page `background`, white / raised charcoal `surface` plates, soft borders (no elevation stacks). `userInterfaceStyle` is `automatic` in `app.json`. `ThemeToggle` mounts once in shared navigation chrome: root Stack `screenOptions.headerRight` (textbook and native tab routes via a transparent `(tabs)` header); on web, tabs keep `headerShown: false` and host the same control in `CustomTabList` (`app-tabs.web.tsx`) so it does not collide with the web tab bar.
- **Tokens:** Semantic colors also live in `src/constants/theme.ts` for StyleSheet-based starter UI (`ThemedView`, `ThemedText`, tab colors)
- **Animation:** `react-native-reanimated` 4.5 (bundled with Expo 57). Shared `PressableScale` (`src/lib/press-scale.tsx`) gives opacity + subtle scale press feedback (scale skipped under reduced motion). `Screen` uses a one-shot FadeIn; study flip cards keep a scaleX hinge. All use `ReduceMotion.System` / `useReducedMotion`.
- **Quality:** `expo lint` (ESLint 9 + `eslint-config-expo`) and `tsc --noEmit`.

## Foundation UI (`src/components/foundation.tsx`)

Reusable app-wide primitives:

| Component | Role |
| --- | --- |
| `Screen` | Safe-area page shell, optional scroll, max content width; soft FadeIn on mount; `safeTop={false}` under Stack headers |
| `Card` | Flat hairline plate via shared `surfacePlateClassName` (no elevation) |
| `Button` | Primary / secondary / ghost; 48dp minimum hit target; `PressableScale` feedback |
| `ThemeToggle` | Icon control; cycles system → light → dark; shared via Stack / web tab chrome |

Class merging uses shared `cn` from `src/lib/utils.ts` (clsx + tailwind-merge), not a local duplicate. Press feedback lives in `src/lib/press-scale.tsx` (`PressableScale`) so Home chips, study mode trigger, chapter trigger, and flip shells share one reduce-motion-aware path.

## Flip cards (`src/components/flip-card.tsx`)

Shared typed `FlipCard` for study prompts:

- Front and back faces flip on press (and keyboard activation via `PressableScale`)
- Outer shell uses `surfacePlateClassName` + press scale; inner Reanimated scaleX hinge owns the flip (shrink, swap face, expand) so height always follows the visible copy
- Only the active face mounts; long answers and bilingual definitions are not clipped
- `useReducedMotion` / `ReduceMotion.System` jumps instantly when the OS asks for less motion
- In-flight taps are ignored so rapid presses cannot leave hinge progress and expanded state out of sync
- Accessibility: `button` role, state-aware label and hint, `expanded`, polite live region; face trees hidden so only the visible side is announced

## Home (`src/app/(tabs)/index.tsx`)

Product start screen (replaces the Expo welcome UI):

- Brand header (Studybase) plus intro; top-end padding clears the shared header `ThemeToggle`
- Subject filters from `src/library/catalog.ts` (`getSubjects`), rendered as accessible radio chips (Psychology today)
- Textbook cards for the selected subject via `getTextbooksForSubject` (Psychology 13th Edition and Hagemann Differentielle Psychologie 9. Auflage)
- Card press navigates to `/textbook/[id]` on the root Stack
- Empty state when the filter yields no textbooks (filters stay usable)
- Uses foundation `Screen` / `Card` / `FoundationText`; scroll + `BottomTabInset` for small phones and larger widths; light and dark via NativeWind tokens

## Textbook route (`src/app/textbook/[id].tsx`)

Offline study shell for one catalog textbook:

- Resolves metadata with catalog `getTextbook`; unknown ids show an unavailable state and Back to Home
- Optional `chapter` search param seeds catalog `setSelectedChapterId` during render (invalid chapter ids are ignored; selection stays in the session store, not the URL)
- `ChapterPicker` (`src/components/chapter-picker.tsx`) keeps props `chapters` / `selectedId` / `onSelect` plus optional `language`; the textbook screen wires catalog `useSelectedChapterId` → `setChapterId` and `useSelectedContentLanguage` → picker labels
- Chapter UI is a Reusables Dropdown Menu radio group (not the old horizontal chip row). Trigger shows the selected heading (truncated); menu items expose full language-aware `chapterHeading` labels with 48dp-friendly rows. Empty catalogs still show the non-interactive empty shell
- On native, chapter menu items scroll inside a gesture-handler `ScrollView` under `PortalHost`; web uses CSS max-height overflow on the menu content
- `ContentLanguagePicker` (`src/components/content-language-picker.tsx`) is a Reusables Dropdown Menu (English / German). Visible only when catalog `textbookSupportsContentLanguage` is true (`bilingualContent` on metadata). Placed on the textbook shell (not only Concepts) so bilingual chapter titles and Concepts copy can switch together. Language preference is a separate session store keyed by textbook id and does not rewrite chapter selection
- Study mode UI (`src/components/study-tabs.tsx`) is a Reusables Dropdown Menu radio group. Options are only the modes that textbook exposes via catalog `getAvailableStudyModes` (stable order: Questions, Definitions, Concepts). Trigger shows the active mode; initial selection is the first available mode; mode state stays local so switching panels or chapters does not change the other. When a textbook lists no modes, StudyTabs shows a graceful empty state
- Questions list: catalog `getQuestionsByChapter` → `FlipCard` (question front, answer back)
- Definitions list: catalog `getDefinitionsByChapter` → `FlipCard` (EN/DE terms on front; English and German definitions on back)
- Concepts list: catalog `getConceptsByChapter` → `FlipCard` (localized concept or summary title on front; explanation or summary body on back). Shown when a package lists `concepts` in `studyModes` and exports getters; Hagemann resolves EN/DE fields from the active content language
- FlatLists use stable keys (`q-{id}` / `d-{id}` / `c-{id}`), chapter-scoped list keys, memoized row components, and empty states when a chapter has no rows (Appendix C has definitions only). Only the active mode's rows are materialized
- Loading covers unresolved route params; missing chapters show a non-list empty shell
- Uses `Screen` with `safeTop={false}` under the Stack header; lists scroll inside the screen so narrow widths do not overflow

In-screen study mode (not nested Expo Router tabs) keeps `/textbook/[id]` navigation predictable on Android, iOS, and web. Web `AppTabs` Home trigger uses `href="/"` (cast to `Href`) so the product home loads; `/(tabs)/index` and `/index` warn as not-found under `expo-router/ui`.

## Catalog (`src/library/catalog.ts`)

Thin offline aggregator over bundled textbook packages. Home and study UI prefer these helpers so packages can opt into mode subsets without UI special cases:

| Helper | Role |
| --- | --- |
| `getSubjects` | Unique subjects from textbook metadata (stable first-seen order) |
| `getTextbooks` / `getTextbooksForSubject` | All bundled books, or filter by subject id (`[]` when none match) |
| `getTextbook` | Metadata for a catalog id (`null` when unknown) |
| `getChapters` / `getChapter` | Chapter list or single chapter for a textbook id |
| `chapterDisplayTitle` / `chapterHeading` / `chapterShortLabel` | Language-aware picker labels (`titleEn` / `titleDe`; preferred language then the other; no legacy `title`) |
| `contentLanguageLabel` | Human label for `ContentLanguage` (`en` / `de`) |
| `textbookSupportsContentLanguage` / `getDefaultContentLanguage` | Whether the shell shows EN/DE control; package default language |
| `getAvailableStudyModes` | Modes the package exposes, in `STUDY_MODE_ORDER` (Questions, Definitions, Concepts); unknown id → `[]` |
| `getDefaultStudyMode` | First available mode, or `null` when none |
| `getQuestionsByChapter` / `getDefinitionsByChapter` / `getConceptsByChapter` | Chapter rows when that mode is offered; otherwise `[]` |
| `useSelectedChapterId` / `setSelectedChapterId` | Session chapter selection keyed by textbook id (shared across packages) |
| `useSelectedContentLanguage` / `setSelectedContentLanguage` | Session content language keyed by textbook id (independent of chapter selection) |

A study mode appears in the dropdown only when the textbook metadata lists it in `studyModes` and the package exports the matching data module + getters. Psychology today lists Questions and Definitions only (no Concepts module yet). Hagemann lists Concepts only (`studyModes: ['concepts']`) with bilingual chapter titles and Concepts copy (`bilingualContent: true`, default language `de`).

Chapter type is bilingual: `{ id, number, titleEn, titleDe }`. Display resolution never uses a third conflicting `title` field.

## Data layer (bundled, offline)

Two psychology packages under `src/library/psychology/`. Import via `@/library/psychology/<package-id>`. Home and the textbook shell resolve books through `catalog.ts`, not package barrels directly.

### Psychology 13th edition (`psychology-2022-13thedition`)

| Piece | Role |
| --- | --- |
| `data/chapters.json` | 18 chapters (`id`, `number` or null, `titleEn`, `titleDe`) |
| `data/definitions.json` | 683 EN/DE definition cards |
| `data/questions.json` | 316 Q&A items |
| `types.ts` | `TextbookMetadata` (includes `studyModes`, `bilingualContent`, `defaultContentLanguage`), `Chapter`, `ContentLanguage`, `DefinitionCard`, `Question`, `ConceptCard`, `StudyModeId` |
| `textbook.ts` | Catalog metadata; `bilingualContent: false`, `defaultContentLanguage: 'en'`; `getTextbook` / `getTextbooks` / `isTextbookId` (unknown ids → null/false) |
| `study-modes.ts` | `STUDY_MODE_ORDER`, `getAvailableStudyModes` from metadata |
| `chapters.ts` | `getChapters`, `getChapter`, `resolveChapterId`, `chapterDisplayTitle`, language-aware labels |
| `get-definitions.ts` / `get-questions.ts` | Full lists plus `*ByChapter` (unknown chapter → `[]`) |
| `last-chapter.ts` | Package-local session map (UI uses catalog session instead) |
| `utils.ts` | `coerceChapterId` / `isChapterInCatalog` |
| `index.ts` | Public barrel |

English-primary: verified German chapter titles are not sourced yet, so each `titleDe` mirrors `titleEn` until accurate translations land. Language UI stays hidden (`bilingualContent: false`).

### Hagemann Differentielle Psychologie (`differentielle-psychologie-und-personlichkeitsforschung-2023-9thauflage`)

Chapters plus bilingual Concepts (9. Auflage, 2023; ISBN 978-3-17-039779-8). Source PDF ships in the package folder. Concepts currently cover Kapitel 1-10; chapters beyond 10 return `[]` until their rows are added. Questions and definitions are not wired yet.

| Piece | Role |
| --- | --- |
| `data/chapters.json` | 13 entries: Vorwort (0) plus Kapitel 1-12 from the PDF Inhaltsverzeichnis (`titleDe` from TOC, `titleEn` translations) |
| `data/concepts.json` | Bilingual concept and section-summary rows (`kind: concept \| summary`); Kapitel 1-10 populated |
| `get-concepts.ts` | `getConceptsByChapter` / `resolveConceptCard` (EN/DE field pick for active content language) |
| `types.ts` | `TextbookMetadata`, `Chapter`, `ContentLanguage`, `ConceptSourceRow` / `ConceptCard`, `StudyModeId` |
| `textbook.ts` | Metadata with `studyModes: ['concepts']`, `bilingualContent: true`, `defaultContentLanguage: 'de'`; `getTextbook` / `getTextbooks` / `isTextbookId` |
| `study-modes.ts` | `STUDY_MODE_ORDER`, `getAvailableStudyModes` from metadata |
| `chapters.ts` | `getChapters`, `getChapter`, `resolveChapterId`, `chapterDisplayTitle`, language-aware labels |
| `last-chapter.ts` | Package-local session map (UI uses catalog session instead) |
| `utils.ts` | `coerceChapterId` / `isChapterInCatalog` |
| `index.ts` | Public barrel |

Extend Concepts by appending real chapter rows to `data/concepts.json` (continue global `id` sequence). Do not invent placeholder cards.

JSON is imported statically (Metro bundles it). No network is required for textbook content (`fetch` is unused in `src/`).

Chapter selection is keyed by textbook id in the catalog session store so questions, definitions, and (when present) concepts share one chapter for the session. Content language is a separate session map keyed by the same textbook id so EN/DE switches never clear chapter selection. Invalid textbook ids yield an empty chapter selection and content language `'en'`. Invalid chapter writes are ignored (current selection kept). Unset chapter selection reads fall back to the first catalog chapter. Unset language falls back to package `defaultContentLanguage`. Content filters yield `[]` for unknown chapter ids.

## Not built yet

Explore remains the Expo starter tab (separate from the offline textbook flow). More Reusables components can be added via the CLI as screens need them. Hagemann questions / definitions and Concepts for chapters beyond 1-10 remain deferred.

## Config touchpoints

- `babel.config.js` - `babel-preset-expo` + NativeWind JSX source / babel preset
- `metro.config.js` - Expo default config wrapped with NativeWind (`inlineRem: 16`)
- `tailwind.config.js` - content under `src/`; Reusables CSS-variable colors plus study `surface` / nested `dark` keys; `tailwindcss-animate`
- `src/global.css` - NativeWind layers, web focus rings, Reusables `:root` / `.dark:root` tokens (soft page vs plate hierarchy)
- `components.json` - React Native Reusables CLI paths (`@/components/ui`, `@/lib/utils`)
- `src/components/ui/` - CLI-installed primitives (`dropdown-menu`, `text`, `icon`, `native-only-animated-view`)
- `src/lib/utils.ts` / `src/lib/theme.ts` / `src/lib/press-scale.tsx` - shared `cn`, navigation / semantic theme maps, and press feedback
- `nativewind-env.d.ts` - NativeWind className types
- `eslint.config.js` - Expo flat config; ignores `dist/*`
- `tsconfig.json` - `@/*` → `src/*`; excludes `node_modules`
