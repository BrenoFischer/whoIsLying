import { Stack } from "expo-router";
import { useFonts } from 'expo-font'; 
import * as SplashScreen from 'expo-splash-screen'; 
import {useEffect} from 'react';
import { GameContextProvider } from "@/context/GameContext";

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const [loaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Sigmar': require('../assets/fonts/SigmarRegular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }


 return (
  <GameContextProvider>
    <Stack 
     screenOptions={{
       headerShown: false,
     }} 
    />
  </GameContextProvider>
 )
}
