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

export default function RevealWord() {
  const [secretWordRevealed, setSecretWordRevealed] = useState(false);
  const { game, checkVoteForSecretWord, getCurrentWord, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/revealWord');
  }, []);

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
        <View style={styles.secretWordContainer}>
          <Text style={styles.label}>{t('The secret word was:')}</Text>
          <Text style={[styles.word, { color: colors.orange[200] }]}>
            {t(getCurrentWord(), { ns: 'categories' })}
          </Text>
        </View>
      )}
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
  characterContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(spacing.lg),
  },
  wordVotedContainer: {
    paddingVertical: verticalScale(spacing.xl),
    paddingHorizontal: scale(spacing.md),
    backgroundColor: colors.orange[200],
    marginTop: verticalScale(spacing.md),
  },
  secretWordContainer: {
    paddingVertical: verticalScale(spacing.xl),
    paddingHorizontal: scale(spacing.md),
    marginTop: verticalScale(spacing.lg),
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
