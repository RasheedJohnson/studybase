# Studybase

Offline-first study app for bundled textbook content. Study questions and bilingual (EN/DE) definitions on Android, iOS, and web — no account and no network required for the textbook material.

Built with [Expo](https://expo.dev) (SDK 57), Expo Router, React Native, and NativeWind.

## What it’s for

Studybase helps you review a textbook chapter by chapter:

- **Questions** — flip cards with a prompt on the front and the answer on the back
- **Definitions** — flip cards with English/German terms on the front and both definitions on the back

Content ships inside the app (bundled JSON). The first package is **Psychology, 13th edition** (2022): 18 chapters, 316 questions, and 683 definition cards.

## How to use the app

1. Open **Home** and pick a subject (Psychology today).
2. Tap a textbook card to open it.
3. Choose a **chapter** from the dropdown.
4. Choose a **study mode**: Questions or Definitions.
5. Tap a card to flip between front and back.
6. Use the theme control (sun / moon / monitor) to switch light, dark, or system appearance.

Chapter selection is remembered for the session per textbook. Switching study mode does not change the chapter.

## Run locally

**Requirements:** Node.js and npm. For devices/simulators, use [Expo Go](https://expo.dev/go), an Android emulator, or an iOS simulator.

```bash
npm install
npx expo start
```

Then press:

- `a` — Android
- `i` — iOS
- `w` — web

Or use the scripts:

```bash
npm run android
npm run ios
npm run web
```

Lint:

```bash
npm run lint
```

## Project layout (short)

| Area | Location |
| --- | --- |
| Screens | `src/app/` (Expo Router) |
| UI | `src/components/` |
| Catalog + textbooks | `src/library/` |
| Theme tokens | `src/global.css`, `src/lib/theme.ts` |

For a fuller map of routing, theming, and the data layer, see [CURRENT_ARCHITECTURE.md](./CURRENT_ARCHITECTURE.md).

## Stack

- Expo SDK 57 · Expo Router · React 19 · React Native 0.86
- NativeWind 4 (Tailwind) · React Native Reusables · Lucide icons
- Reanimated for press feedback and flip-card motion

## License

Private project (`"private": true` in `package.json`).
