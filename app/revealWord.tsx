import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import * as Haptics from 'expo-haptics';

export default function RevealWord() {
  const [secretWordRevealed, setSecretWordRevealed] = useState(false);
  const { game, resolveScoreOfTheMatch, getCurrentWord, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  useEffect(() => {
    setCurrentScreen('/revealWord');
  }, []);

  const revealAnim = useSharedValue(0);
  useEffect(() => {
    if (secretWordRevealed) {
      revealAnim.value = withTiming(1, { duration: 400 });
    }
  }, [secretWordRevealed]);
  const revealAnimStyle = useAnimatedStyle(() => ({
    opacity: revealAnim.value,
    transform: [{ translateY: (1 - revealAnim.value) * 16 }],
  }));

  const handleContinue = () => {
    resolveScoreOfTheMatch();
    router.replace('/endGame');
  };

  const revealWord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSecretWordRevealed(true);
  };

  const impostorVotes = game.impostorVotes ?? [];
  const count = impostorVotes.length || 1;
  const characterSize =
    count === 1 ? height * 0.22 : count === 2 ? height * 0.16 : height * 0.12;

  return (
    <ScreenLayout
      scrollable
      header={
        <View style={styles.headerContainer}>
          <SidebarMenu />
        </View>
      }
      footer={
        secretWordRevealed ? (
          <Button text={t('Continue')} onPress={handleContinue} />
        ) : (
          <Button text={t('Reveal secret word')} onPress={revealWord} />
        )
      }
    >
      {/* Characters side by side, sitting right above the orange container */}
      <View style={styles.charactersRow}>
        {impostorVotes.map(vote => (
          <Character key={vote.player.id} mood={vote.player.character} size={characterSize} />
        ))}
      </View>

      {/* Single merged vote container */}
      <View style={styles.wordVotedContainer}>
        {impostorVotes.map((vote, idx) => (
          <View key={vote.player.id}>
            {idx > 0 && <View style={styles.voteDivider} />}
            <Text style={styles.voteLabel}>
              {vote.player.name} {t('voted for:')}
            </Text>
            <Text style={styles.voteWord} numberOfLines={2} adjustsFontSizeToFit>
              {t(vote.word, { ns: 'categories' })}
            </Text>
          </View>
        ))}
      </View>

      {/* Secret word — fades in below the vote container, pushes footer out of the way */}
      {secretWordRevealed && (
        <Animated.View style={[styles.secretWordContainer, revealAnimStyle]}>
          <Text style={styles.secretLabel}>{t('The secret word was:')}</Text>
          <Text style={styles.secretWord}>
            {t(getCurrentWord(), { ns: 'categories' })}
          </Text>
        </Animated.View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
    alignItems: 'flex-end',
  },
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingTop: verticalScale(spacing.lg),
    gap: scale(spacing.md),
    paddingHorizontal: scale(spacing.md),
  },
  wordVotedContainer: {
    backgroundColor: colors.orange[200],
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.sm),
    paddingBottom: verticalScale(spacing.lg),
  },
  voteDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginVertical: verticalScale(spacing.sm),
  },
  voteLabel: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.white[100],
  },
  voteWord: {
    marginTop: verticalScale(spacing.xs),
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(32),
    color: colors.black[100],
  },
  secretWordContainer: {
    paddingHorizontal: scale(spacing.md),
    paddingVertical: verticalScale(spacing.xl),
    alignItems: 'center',
  },
  secretLabel: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.white[100],
  },
  secretWord: {
    marginTop: verticalScale(spacing.sm),
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(42),
    color: colors.orange[200],
  },
});
