import { ThemeProvider, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { PortalHost } from '@rn-primitives/portal';
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import {
  ThemePreferenceProvider,
  ThemeToggle,
  useThemePreference,
} from '@/components/foundation';
import { NAV_THEME } from '@/lib/theme';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

/** Shared Stack headerRight so every headed route gets one ThemeToggle without per-screen mounts. */
function ThemeToggleHeaderRight() {
  return <ThemeToggle />;
}

function RootChrome() {
  // Resolve dark from preference first so navigation ThemeProvider updates in the same
  // React commit as the toggle — not on a later Appearance event from colorScheme.set.
  const { preference } = useThemePreference();
  const systemScheme = useColorScheme();
  const isDark =
    preference === 'dark' || (preference === 'system' && systemScheme === 'dark');

  return (
    <ThemeProvider value={isDark ? NAV_THEME.dark : NAV_THEME.light}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerRight: ThemeToggleHeaderRight,
        }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            // Native: transparent header hosts ThemeToggle over tab screens.
            // Web: tab chrome (CustomTabList) hosts the toggle instead to avoid overlapping the web tab bar.
            headerShown: Platform.OS !== 'web',
            title: '',
            headerTransparent: true,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="textbook/[id]"
          options={{
            title: 'Textbook',
            headerBackTitle: 'Home',
          }}
        />
      </Stack>
      {/* Last child so DropdownMenu / Dialog / Popover portals paint above the Stack. */}
      <PortalHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Required so chapter-picker's gesture-handler ScrollView (and other GH views) recognize touches.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemePreferenceProvider>
        <RootChrome />
      </ThemePreferenceProvider>
    </GestureHandlerRootView>
  );
}
