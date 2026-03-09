import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function RevealImpostor() {
  const { t } = useTranslation();
  const [nextReveal, setNextReveal] = useState(false);
  const { game, setCurrentScreen } = useContext(GameContext);

  useEffect(() => {
    setCurrentScreen('/revealImpostor');
  }, []);

  const isPlural = game.lyingPlayers.length > 1;

  const phrasesToReveal = isPlural
    ? [
        t('Impostors, you can cough 3 times to reveal yourselves'),
        t('Impostors, you can raise your right hands to reveal yourselves'),
        t('Impostors, you can stand up to reveal yourselves'),
      ]
    : [
        t('Impostor, you can cough 3 times to reveal yourself'),
        t('Impostor, you can raise your right hand to reveal yourself'),
        t('Impostor, you can stand up to reveal yourself'),
      ];

  const randomPhrase =
    phrasesToReveal[Math.floor(Math.random() * phrasesToReveal.length)];

  return (
    <ScreenLayout
      header={
        <View style={styles.headerContainer}>
          <SidebarMenu />
        </View>
      }
      footer={
        nextReveal ? (
          <Button
            text={t('Continue')}
            onPress={() => router.replace('/words')}
          />
        ) : (
          <Button text={t('Done it')} onPress={() => setNextReveal(true)} />
        )
      }
    >
      {/* justifyContent switches on reveal — LinearTransition animates the title between the two positions */}
      <View style={[styles.content, nextReveal && styles.contentRevealed]}>
        <Animated.Text
          layout={LinearTransition.duration(400)}
          style={styles.title}
        >
          {isPlural
            ? t('The real impostors were:')
            : t('The real impostor was:')}
        </Animated.Text>

        {/* Phrase disappears immediately on tap (no exit animation) */}
        {!nextReveal && <Text style={styles.randomPhrase}>{randomPhrase}</Text>}

        {/* Cards wait for the title to reach its position before fading in */}
        {nextReveal && (
          <Animated.View
            entering={FadeIn.delay(350).duration(300)}
            style={styles.cardsScroll}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsScrollContent}
            >
              {game.lyingPlayers.map(impostor => (
                <View key={impostor.id} style={styles.playerCard}>
                  <Text
                    style={styles.playerName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {impostor.name}
                  </Text>
                  <Character
                    mood={impostor.character}
                    size={moderateScale(120)}
                  />
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(spacing.lg),
    gap: verticalScale(spacing.lg),
    justifyContent: 'center',
  },
  contentRevealed: {
    justifyContent: 'flex-start',
    paddingTop: verticalScale(spacing.md),
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
  cardsScroll: {
    width: '100%',
    flex: 1,
  },
  cardsScrollContent: {
    gap: verticalScale(spacing.md),
    paddingBottom: verticalScale(spacing.sm),
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: colors.white[100],
    borderRadius: radius.lg,
    paddingTop: verticalScale(spacing.lg),
    paddingHorizontal: scale(spacing.sm),
    gap: verticalScale(spacing.md),
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: colors.orange[200],
    textAlign: 'center',
  },
});
