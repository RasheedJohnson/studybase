# Current architecture

StudyBase (this repo) is an Expo SDK 57 app with Expo Router, React Native 0.86, and React 19. Path alias `@/*` maps to `src/*`. The product goal is an offline-first study app for bundled textbook JSON (Psychology 13th edition first), with a layout spirit shared by PsychBase (web) and the older StudyBase Android app.

## Stack

- **Routing:** Expo Router file routes under `src/app/` (`index`, `explore`), rooted by `src/app/_layout.tsx`
- **Tabs:** `AppTabs` (`src/components/app-tabs.tsx` / `.web.tsx`) via Expo Router native tabs
- **Styling:** NativeWind 4.2 (Tailwind CSS 3.4) with `darkMode: 'class'`, Metro via `withNativeWind` on `src/global.css`
- **Theming:** `ThemePreferenceProvider` + `ThemeToggle` in `src/components/foundation.tsx` (preference: system, light, dark). `colorScheme.set` keeps NativeWind `dark:` classes and React Native `Appearance` aligned so navigation chrome follows. `userInterfaceStyle` is `automatic` in `app.json`.
- **Tokens:** Semantic colors also live in `src/constants/theme.ts` for StyleSheet-based starter UI (`ThemedView`, `ThemedText`, tab colors)

## Foundation UI (`src/components/foundation.tsx`)

Reusable app-wide primitives (not the final product screens yet):

| Component | Role |
| --- | --- |
| `Screen` | Safe-area page shell, optional scroll, max content width |
| `Card` | Flat outlined surface (no elevation), study-style plate |
| `Button` | Primary / secondary / ghost; 48dp minimum hit target |
| `ThemeToggle` | Cycles system → light → dark; accessible label announces preference |

`ThemeToggle` is mounted in the root layout as a temporary overlay until home/nav chrome owns it.

## Data (bundled, offline)

Textbook helpers and JSON under `src/library/psychology/psychology-2022-13thedition/`:

- `chapters.json` / `definitions.json` / `questions.json`
- Typed helpers: `chapters.ts`, `get-definitions.ts`, `get-questions.ts`, `types.ts`, `utils.ts`

No network is required to read this catalog.

## Not built yet

Final home (textbook picker / filters), textbook shell (chapter state + questions/definitions tabs), and flip cards are intentionally deferred. Starter Expo welcome screens on `index` and `explore` remain until those prompts.

## Config touchpoints

- `babel.config.js` – `babel-preset-expo` + NativeWind JSX source / babel preset
- `metro.config.js` – Expo default config wrapped with NativeWind
- `tailwind.config.js` – content under `src/`, semantic colors aligned with `Colors`
- `nativewind-env.d.ts` – NativeWind className types
