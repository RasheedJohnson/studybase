import { ThemeProvider, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { PortalHost } from '@rn-primitives/portal';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemePreferenceProvider, ThemeToggle } from '@/components/foundation';
import { NAV_THEME } from '@/lib/theme';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

/** Shared Stack headerRight so every headed route gets one ThemeToggle without per-screen mounts. */
function ThemeToggleHeaderRight() {
  return <ThemeToggle />;
}

function RootChrome() {
  // Use RN Appearance (not NativeWind's hook) so Fast Refresh and React Compiler stay stable.
  // ThemePreferenceProvider still drives both via colorScheme.set.
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
  return (
    <ThemePreferenceProvider>
      <RootChrome />
    </ThemePreferenceProvider>
  );
}
