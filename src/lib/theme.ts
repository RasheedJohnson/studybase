import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';

/**
 * Semantic tokens for React Native Reusables, aligned with StudyBase Colors
 * (src/constants/theme.ts) and existing NativeWind study surfaces.
 * Keep HSL channel values in sync with :root / .dark:root in src/global.css.
 */
export const THEME = {
  light: {
    background: 'hsl(240 11% 96%)',
    foreground: 'hsl(0 0% 0%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(0 0% 0%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(0 0% 0%)',
    primary: 'hsl(32 95% 44%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(0 0% 100%)',
    secondaryForeground: 'hsl(0 0% 0%)',
    muted: 'hsl(240 10% 92%)',
    mutedForeground: 'hsl(220 9% 40%)',
    accent: 'hsl(38 80% 94%)',
    accentForeground: 'hsl(32 90% 32%)',
    sky: 'hsl(199 89% 42%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(0 0% 100%)',
    border: 'hsl(240 7% 89%)',
    input: 'hsl(240 7% 89%)',
    ring: 'hsl(32 95% 44%)',
    radius: '0.75rem',
    chart1: 'hsl(12 76% 61%)',
    chart2: 'hsl(173 58% 39%)',
    chart3: 'hsl(197 37% 24%)',
    chart4: 'hsl(43 74% 66%)',
    chart5: 'hsl(27 87% 67%)',
  },
  dark: {
    background: 'hsl(0 0% 5%)',
    foreground: 'hsl(0 0% 100%)',
    card: 'hsl(225 7% 12%)',
    cardForeground: 'hsl(0 0% 100%)',
    popover: 'hsl(225 7% 12%)',
    popoverForeground: 'hsl(0 0% 100%)',
    // Amber selected chrome (#F59E0B) with dark amber wash accents (#2A1D0B).
    primary: 'hsl(38 92% 50%)',
    primaryForeground: 'hsl(24 10% 8%)',
    secondary: 'hsl(225 7% 12%)',
    secondaryForeground: 'hsl(0 0% 100%)',
    muted: 'hsl(225 7% 12%)',
    mutedForeground: 'hsl(218 11% 65%)',
    accent: 'hsl(35 58% 10%)',
    accentForeground: 'hsl(38 92% 50%)',
    sky: 'hsl(198 93% 60%)',
    destructive: 'hsl(0 70.9% 59.4%)',
    destructiveForeground: 'hsl(0 0% 100%)',
    border: 'hsl(228 5% 19%)',
    input: 'hsl(228 5% 19%)',
    ring: 'hsl(38 92% 50%)',
    radius: '0.75rem',
    chart1: 'hsl(220 70% 50%)',
    chart2: 'hsl(160 60% 45%)',
    chart3: 'hsl(30 80% 55%)',
    chart4: 'hsl(280 65% 60%)',
    chart5: 'hsl(340 75% 55%)',
  },
} as const;

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
