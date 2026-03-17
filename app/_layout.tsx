import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GameContextProvider } from '@/context/GameContext';
import { AppResetProvider } from '@/context/AppResetContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import '@/translations/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Sigmar: require('../assets/fonts/SigmarRegular.ttf'),
    Raleway: require('../assets/fonts/Raleway.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AppResetProvider>
          <GameContextProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
          </GameContextProvider>
        </AppResetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
