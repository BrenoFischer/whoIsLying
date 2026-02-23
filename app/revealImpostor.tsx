import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function RevealImpostor() {
  const { t } = useTranslation();
  const phrasesToReveal = [
    t('Impostor, you can cough 3 times to reveal yourself'),
    t('Impostor, you can raise your right hand to reveal yourself'),
    t('Impostor, you can stand up to reveal yourself'),
  ];
  const [nextReveal, setNextReveal] = useState(false);
  const { game, setCurrentScreen } = useContext(GameContext);

  useEffect(() => {
    setCurrentScreen('/revealImpostor');
  }, []);

  const randomPhrase = phrasesToReveal[Math.floor(Math.random() * phrasesToReveal.length)];
  const impostorPlayer = game.lyingPlayer;

  return (
    <ScreenLayout
      header={
        <View style={styles.headerContainer}>
          <SidebarMenu />
        </View>
      }
      footer={
        nextReveal ? (
          <Button text={t('Continue')} onPress={() => router.replace('/words')} />
        ) : (
          <Button text={t('Done it')} onPress={() => setNextReveal(true)} />
        )
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('The real impostor was:')}</Text>

        {nextReveal ? (
          <View style={styles.playerCard}>
            <Text style={styles.playerName}>{impostorPlayer.name}</Text>
            <Character mood={impostorPlayer.character} />
          </View>
        ) : (
          <Text style={styles.randomPhrase}>{randomPhrase}</Text>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: verticalScale(spacing.md),
    paddingBottom: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.sm),
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.lg),
    gap: verticalScale(spacing.xl),
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
  },
  randomPhrase: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(35),
    color: colors.white[100],
  },
  playerCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.white[100],
    borderRadius: radius.lg,
    paddingTop: verticalScale(spacing.lg),
    gap: verticalScale(spacing.md),
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
});
