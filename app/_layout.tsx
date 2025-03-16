
import { Stack } from "expo-router";
import { useFonts } from 'expo-font'; 
import * as SplashScreen from 'expo-splash-screen'; 
import {useEffect} from 'react';
import { colors } from "@/styles/colors";

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
 return (
   <Stack 
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.white[100] },
    }} 
   />
 )
}
