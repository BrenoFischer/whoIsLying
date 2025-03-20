
import { Stack } from "expo-router";
import { useFonts } from 'expo-font'; 
import * as SplashScreen from 'expo-splash-screen'; 
import {useEffect} from 'react';
import { colors } from "@/styles/colors";
import { PaperProvider } from 'react-native-paper';

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
  <PaperProvider>
    <Stack 
     screenOptions={{
       headerShown: false,
     }} 
    />
  </PaperProvider>
 )
}
