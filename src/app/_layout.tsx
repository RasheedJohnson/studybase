import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemePreferenceProvider } from '@/components/foundation';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

function RootChrome() {
  // Use RN Appearance (not NativeWind's hook) so Fast Refresh and React Compiler stay stable.
  // ThemePreferenceProvider still drives both via colorScheme.set.
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="textbook/[id]"
          options={{
            title: 'Textbook',
            headerBackTitle: 'Home',
          }}
        />
      </Stack>
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
