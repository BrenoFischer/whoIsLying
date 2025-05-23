import { colors } from '@/styles/colors';
import { View, Image, StyleSheet } from 'react-native';
import Button from "@/components/button";
import { router } from 'expo-router';
import Logo from '@/components/logo';

export default function SkillUpScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo />
      </View>
      <View style={styles.buttonContainer}>
        <Button text="New game" onPress={() => router.navigate("/defineQuantityOfMatches")}/>
      </View>
      <Image source={require('@/assets/images/logo2.png')} style={styles.bottomImage} resizeMode="cover"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: "relative",
    backgroundColor: colors.background[100],
  },

  logoContainer: {
    height: 100,
    marginTop: 140,
  },

  buttonContainer: {
    marginTop: 80,
  },

  bottomImage: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});