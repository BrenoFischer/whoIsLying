import { colors } from '@/styles/colors';
import { View, Image, StyleSheet, Text } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function SkillUpScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={styles.icon}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title}>{'Who is Lying'}</Text>
      <View style={styles.buttonContainer}>
        <Button
          text={t('New game')}
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
    height: verticalScale(150),
    marginTop: verticalScale(80),
  },

  icon: {
    flex: 1,
    width: scale(80),
    height: scale(80),
    resizeMode: 'contain',
  },

  title: {
    fontFamily: 'Sigmar',
    fontWeight: 'bold',
    fontSize: moderateScale(28),
    color: colors.orange[200],
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },

  buttonContainer: {
    position: 'absolute',
    bottom: verticalScale(80),
    left: scale(20),
    right: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
