import React from 'react';
import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import { Player } from '@/types/Player';
import categories from '@/data/categories.json';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from '@/translations';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ShowWordToSinglePlayerProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | undefined>>;
  setShowForgotWord: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShowWordToSinglePlayer({
  player,
  setPlayer,
  setShowForgotWord,
}: ShowWordToSinglePlayerProps) {
  const { game, getCurrentWord } = useContext(GameContext);
  const { t } = useTranslation();
  const [wordRevealed, setWordRevealed] = useState(false);
  const [isLyingPlayer, setIsLyingPlayer] = useState(false);
  const [rawWord, setRawWord] = useState('');

  const revealAnim = useSharedValue(0);
  useEffect(() => {
    revealAnim.value = wordRevealed ? withTiming(1, { duration: 500 }) : 0;
  }, [wordRevealed]);
  const revealAnimStyle = useAnimatedStyle(() => ({
    opacity: revealAnim.value,
    transform: [{ scale: interpolate(revealAnim.value, [0, 1], [0.85, 1]) }],
  }));

  const displayWord = wordRevealed
    ? isLyingPlayer
      ? t('You will be the impostor this round!')
      : rawWord
        ? t(rawWord, { ns: 'categories' })
        : ''
    : '';

  const displaySubtitle = wordRevealed
    ? isLyingPlayer
      ? t(
          "Pretend you know the word and try to discover it based on people's answers."
        )
      : t(
          'Answer the questions based on this word, but make sure to not make it easy for the impostor to discover it.'
        )
    : '';

  const categoryData = game.category
    ? categories[game.category as keyof typeof categories]
    : null;
  const wordDescKey =
    wordRevealed && !isLyingPlayer && rawWord && categoryData?.wordDescriptions
      ? (categoryData.wordDescriptions as Record<string, string>)[rawWord]
      : null;
  const displayDescription = wordDescKey
    ? t(wordDescKey, { ns: 'categories' })
    : '';

  function handleRevealWord() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const playerIsLying = game.lyingPlayers.some(lp => lp.id === player.id);
    setIsLyingPlayer(playerIsLying);
    setRawWord(getCurrentWord());
    setWordRevealed(true);
  }

  function handleCloseWindow() {
    setPlayer(undefined);
    setShowForgotWord(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.titleInformation}>{t('Pass device to:')}</Text>
          <Text style={styles.playerName}>{player.name}</Text>
        </View>
        <Character mood={player.character} />
      </View>

      <View style={styles.secretWordContainer}>
        <View style={styles.flexSpacer} />

        <View
          style={[styles.wordCard, isLyingPlayer && styles.wordCardImpostor]}
        >
          <View
            style={[
              styles.wordCardInner,
              isLyingPlayer && styles.wordCardInnerImpostor,
            ]}
          >
            {!wordRevealed ? (
              <View style={styles.placeholderContent}>
                <Ionicons
                  name="lock-closed"
                  size={moderateScale(32)}
                  color={colors.gray[300]}
                />
              </View>
            ) : (
              <Animated.View style={[styles.revealedContent, revealAnimStyle]}>
                <View style={styles.cardLabelRow}>
                  <Text
                    style={[
                      styles.cardLabel,
                      isLyingPlayer && styles.cardLabelImpostor,
                    ]}
                  >
                    {isLyingPlayer ? t('Your role') : t('Secret word')}
                  </Text>
                  {isLyingPlayer && (
                    <Ionicons
                      name="glasses-outline"
                      size={moderateScale(16)}
                      color={colors.purple[100]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.secretWord,
                    isLyingPlayer && styles.secretWordImpostor,
                  ]}
                >
                  {displayWord}
                </Text>
                {displayDescription ? (
                  <Text style={styles.wordDescription}>
                    {displayDescription}
                  </Text>
                ) : null}
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>{displaySubtitle}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!wordRevealed ? (
          <Button
            text={t('Tap to reveal')}
            onPress={handleRevealWord}
            variants="primary"
          />
        ) : (
          <Button text={t('Got it!')} onPress={handleCloseWindow} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    paddingLeft: scale(30),
    paddingTop: verticalScale(20),
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  topTextContainer: {
    flex: 1,
  },
  titleInformation: {
    fontSize: fontSize.lg,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  secretWordContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(spacing.md),
  },
  flexSpacer: {
    flex: 1,
  },
  wordCard: {
    width: '100%',
    backgroundColor: colors.orange[200],
    borderRadius: moderateScale(20),
    borderBottomWidth: scale(7),
    borderEndWidth: scale(7),
    borderTopWidth: scale(0),
    borderLeftWidth: scale(0),
    borderColor: colors.orange[200],
    overflow: 'hidden',
  },
  wordCardImpostor: {
    backgroundColor: colors.purple[100],
    borderColor: colors.purple[100],
  },
  wordCardInner: {
    backgroundColor: colors.white[100],
    borderRadius: moderateScale(radius.lg),
    paddingVertical: verticalScale(spacing.lg),
    paddingHorizontal: scale(spacing.md),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(130),
  },
  wordCardInnerImpostor: {
    backgroundColor: colors.purple[300],
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealedContent: {
    width: '100%',
    alignItems: 'center',
    gap: verticalScale(spacing.sm),
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
  },
  cardLabel: {
    fontFamily: 'Raleway-Medium',
    fontSize: fontSize.sm,
    color: colors.gray[300],
    textTransform: 'uppercase',
    letterSpacing: moderateScale(1),
  },
  cardLabelImpostor: {
    color: colors.purple[100],
  },
  secretWord: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.background[100],
    fontSize: fontSize.xxl,
    textAlign: 'center',
  },
  secretWordImpostor: {
    color: colors.white[100],
    fontSize: fontSize.lg,
  },
  wordDescription: {
    fontFamily: 'Raleway-Medium',
    fontSize: fontSize.sm,
    color: colors.background[100],
    textAlign: 'center',
  },
  subtitleContainer: {
    flex: 1,
    paddingTop: verticalScale(spacing.md),
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.orange[200],
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.md),
    paddingHorizontal: scale(spacing.md),
    backgroundColor: colors.background[100],
  },
});
