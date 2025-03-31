import { colors } from '@/styles/colors';
import React from 'react';
import { View, Image, StyleSheet, Platform, Text } from 'react-native';
import Button from "@/components/button";
import { router } from 'expo-router';


export default function SkillUpScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <Button text="New game" onPress={() => router.navigate("/selectCategory")}/>
      </View>
      <Image source={require('@/assets/images/logo2.png')} style={styles.bottomImage} resizeMode="cover"/>
    </View>
  );
}

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: "relative",
    backgroundColor: colors.pink[100],
  },

  logo: {
    height: 100,
    marginTop: 100,
  },

  buttonContainer: {
    marginTop: 50,
  },

  bottomImage: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});