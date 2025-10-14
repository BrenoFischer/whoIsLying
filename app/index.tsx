import { colors } from '@/styles/colors';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { Language, useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function SkillUpScreen() {
  const { t, language, setLanguage } = useTranslation();

  const handleChangeLanguage = (lan: Language) => {
      if(lan === language) return;
      setLanguage(lan);
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageButtons}>
        <TouchableOpacity
          style={[
            styles.langButton,
            language === 'en' && styles.activeLangButton,
          ]}
          onPress={() => handleChangeLanguage('en')}
        >
          <Text
            style={[
              styles.langText,
              language === 'en' && styles.activeLangText,
            ]}
          >
            🇺🇸 EN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.langButton,
            language === 'pt' && styles.activeLangButton,
          ]}
          onPress={() => handleChangeLanguage('pt')}
        >
          <Text
            style={[
              styles.langText,
              language === 'pt' && styles.activeLangText,
            ]}
          >
            🇧🇷 PT
          </Text>
        </TouchableOpacity>
      </View>
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
          onPress={() => router.replace('/defineQuantityOfMatches')}
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

  languageButtons: {
    position: "absolute",
    top: verticalScale(50),
    right: 10,
    flexDirection: 'row',
    gap: scale(10),
  },
  langButton: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
    borderWidth: scale(1),
    borderColor: colors.orange[200],
  },
  activeLangButton: {
    backgroundColor: colors.orange[200],
  },
  langText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  activeLangText: {
    color: colors.background[100],
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
