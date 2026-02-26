import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

export default function RevealWord() {
  const [secretWordRevealed, setSecretWordRevealed] = useState(false);
  const { game, checkVoteForSecretWord, getCurrentWord, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

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
    checkVoteForSecretWord();
    router.replace('/endGame');
  };

  return (
    <ScreenLayout
      header={
        <View style={styles.headerContainer}>
          <SidebarMenu />
        </View>
      }
      footer={
        secretWordRevealed ? (
          <Button text={t('Continue')} onPress={handleContinue} />
        ) : (
          <Button text={t('Reveal secret word')} onPress={() => setSecretWordRevealed(true)} />
        )
      }
    >
      <View style={{ flex: 1 }}>
        <View style={styles.characterContainer}>
          <Character mood={game.lyingPlayer.character} />
        </View>

        <View style={styles.wordVotedContainer}>
          <Text style={styles.label}>
            {game.lyingPlayer.name} {t('voted for:')}
          </Text>
          <Text style={styles.word}>
            {t(game.selectedWord || '', { ns: 'categories' })}
          </Text>
        </View>

        {secretWordRevealed && (
          <Animated.View style={[styles.secretWordContainer, revealAnimStyle]}>
            <Text style={styles.label}>{t('The secret word was:')}</Text>
            <Text style={[styles.word, { color: colors.orange[200] }]}>
              {t(getCurrentWord(), { ns: 'categories' })}
            </Text>
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
  characterContainer: {
    alignItems: 'center',
  },
  wordVotedContainer: {
    paddingVertical: verticalScale(spacing.xl),
    paddingHorizontal: scale(spacing.md),
    backgroundColor: colors.orange[200],
  },
  secretWordContainer: {
    paddingHorizontal: scale(spacing.md),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.white[100],
  },
  word: {
    marginTop: verticalScale(spacing.sm),
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(35),
    color: colors.black[100],
  },
});
