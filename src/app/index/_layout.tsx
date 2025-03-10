
import { Stack } from "expo-router";
import { useFonts } from 'expo-font'; 
import * as SplashScreen from 'expo-splash-screen'; 
import {useEffect} from 'react';
import { colors } from "@/styles/colors";

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
 const [loaded, error] = useFonts({
   'SigmarRegular': require('@/assets/fonts/SigmarRegular.ttf'),
 });

 useEffect(() => {
   if (loaded || error) {
     SplashScreen.hideAsync();
   }
 }, [loaded, error]);

 if (!loaded && !error) {
   return null;
 }

 return (
   <Stack 
    screenOptions={{
      headerShown: false,
      contentStyle: {
        backgroundColor: colors.white[100]
      }
    }} 
   />
 )
}
