import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * ROOT LAYOUT
 * The foundation of the StxryAI mobile app.
 * Sets up providers, fonts, and navigation.
 */
export default function RootLayout() {
  // Load fonts - fonts are optional, system fonts will be used as fallback
  // If fonts are missing, the app will still work with system fonts
  // To add fonts, uncomment the lines below and add font files to assets/fonts/
  const fontMap: Record<string, any> = {};
  
  // Uncomment when font files are added:
  // try {
  //   fontMap['Bricolage-Regular'] = require('../assets/fonts/BricolageGrotesque-Regular.ttf');
  //   fontMap['Bricolage-Bold'] = require('../assets/fonts/BricolageGrotesque-Bold.ttf');
  //   fontMap['Sora-Regular'] = require('../assets/fonts/Sora-Regular.ttf');
  //   fontMap['Sora-SemiBold'] = require('../assets/fonts/Sora-SemiBold.ttf');
  //   fontMap['Sora-Bold'] = require('../assets/fonts/Sora-Bold.ttf');
  //   fontMap['Instrument-Regular'] = require('../assets/fonts/InstrumentSerif-Regular.ttf');
  //   fontMap['Instrument-Italic'] = require('../assets/fonts/InstrumentSerif-Italic.ttf');
  // } catch (e) {
  //   // Fonts not available, will use system fonts
  // }

  // Only call useFonts if we have fonts to load
  // Note: useFonts must always be called (hooks rule), so we pass empty object if no fonts
  const [fontsLoaded, fontError] = useFonts(
    Object.keys(fontMap).length > 0 ? fontMap : {}
  );
  
  // If no fonts to load, consider them "loaded" immediately
  const areFontsReady = Object.keys(fontMap).length === 0 ? true : fontsLoaded;

  useEffect(() => {
    // Hide splash screen after fonts load or timeout
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
    
    if (areFontsReady || fontError) {
      clearTimeout(timer);
      SplashScreen.hideAsync();
    }
    
    return () => clearTimeout(timer);
  }, [areFontsReady, fontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000000' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="story/[id]" options={{ presentation: 'fullScreenModal' }} />
              <Stack.Screen name="kids-zone" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


