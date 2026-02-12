import { colors } from '@/styles/colors';
import { View, Image, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { Language, useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function SkillUpScreen() {
  const { t, language, setLanguage } = useTranslation();

  const handleChangeLanguage = (lan: Language) => {
      if(lan === language) return;
      setLanguage(lan);
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>{'Who is Lying'}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          text={t('New game')}
          onPress={() => router.replace('/defineQuantityOfMatches')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.background[100],
  },

  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },

  icon: {
    width: scale(100),
    height: scale(100),
  },

  title: {
    fontFamily: 'Sigmar',
    fontWeight: 'bold',
    fontSize: fontSize.xl,
    color: colors.orange[200],
    textTransform: 'uppercase',
  },

  languageButtons: {
    position: "absolute",
    top: verticalScale(spacing.xxxl),
    right: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
  },

  langButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  activeLangButton: {
    backgroundColor: colors.orange[200],
  },
  langText: {
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  activeLangText: {
    color: colors.background[100],
  },

  buttonContainer: {
    paddingBottom: verticalScale(spacing.xxxxl),
  },
});
