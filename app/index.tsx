import { colors } from '@/styles/colors';
import { View, Image, StyleSheet, Text } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';

export default function SkillUpScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.icon}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title}>Who is Lying</Text>
      <View style={styles.buttonContainer}>
        <Button
          text="New game"
          onPress={() => router.navigate('/defineQuantityOfMatches')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    backgroundColor: colors.background[100],
  },

  logoContainer: {
    height: 180,
    marginTop: 100,
  },

  icon: {
    flex: 1,
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },

  title: {
    fontFamily: 'Sigmar',
    fontWeight: 'bold',
    fontSize: 32,
    color: colors.orange[200],
    textTransform: 'uppercase',
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
