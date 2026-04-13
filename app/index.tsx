import { colors } from '@/styles/colors';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { Language, useTranslation } from '@/translations';
import { useContext, useEffect, useState } from 'react';
import { GameContext } from '@/context/GameContext';
import { HistoryContext } from '@/context/HistoryContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import ScreenLayout from '@/components/screenLayout';
import { Ionicons } from '@expo/vector-icons';
import PlayerStats from '@/components/playerStats';
import MatchHistory from '@/components/matchHistory';

export default function SkillUpScreen() {
  const { t, language, setLanguage } = useTranslation();
  const { game, isHydrated } = useContext(GameContext);
  const { savedPlayers, matchHistory } = useContext(HistoryContext);

  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (game.currentScreen && game.players.length > 0) {
      router.replace(game.currentScreen as any);
    }
  }, [isHydrated]);

  const handleChangeLanguage = (lan: Language) => {
    if (lan === language) return;
    setLanguage(lan);
  };

  const hasStats = savedPlayers.length > 0;
  const hasHistory = matchHistory.length > 0;

  return (
    <>
      <ScreenLayout
        header={
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => hasStats && setShowStats(true)}
                activeOpacity={hasStats ? 0.7 : 1}
              >
                <Ionicons
                  name="podium-outline"
                  size={moderateScale(22)}
                  color={hasStats ? colors.orange[200] : colors.gray[300]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => hasHistory && setShowHistory(true)}
                activeOpacity={hasHistory ? 0.7 : 1}
              >
                <Ionicons
                  name="journal-outline"
                  size={moderateScale(22)}
                  color={hasHistory ? colors.orange[200] : colors.gray[300]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.headerRight}>
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
          </View>
        }
        footer={
          <Button
            text={t('New game')}
            onPress={() => router.replace('/selectCategory')}
          />
        }
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={styles.icon}
            resizeMode="cover"
          />
          <Text style={styles.title}>{'Who is Lying'}</Text>
        </View>
      </ScreenLayout>

      <PlayerStats visible={showStats} onClose={() => setShowStats(false)} />
      <MatchHistory visible={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  headerRow: {
    paddingTop: verticalScale(spacing.xl),
    paddingHorizontal: scale(spacing.xl),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
  },

  iconButton: {
    padding: scale(spacing.xs),
    borderRadius: moderateScale(radius.pill),
  },

  headerRight: {
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
});
