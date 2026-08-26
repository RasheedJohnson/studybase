import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ThemePreferenceProvider, ThemeToggle } from '@/components/foundation';
import { Spacing } from '@/constants/theme';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

function RootChrome() {
  // Use RN Appearance (not NativeWind's hook) so Fast Refresh and React Compiler stay stable.
  // ThemePreferenceProvider still drives both via colorScheme.set.
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <AppTabs />
      {/* Temporary foundation anchor until home/nav chrome lands the toggle. */}
      <View
        pointerEvents="box-none"
        className="absolute z-50"
        style={{ top: insets.top + Spacing.two, right: Spacing.three }}>
        <ThemeToggle />
      </View>
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ThemePreferenceProvider>
      <RootChrome />
    </ThemePreferenceProvider>
  );
}
