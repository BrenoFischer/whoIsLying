import { GameContext } from '@/context/GameContext';
import React, { useContext, useState, useEffect } from 'react';
import categories from '@/data/categories.json';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import Button from '@/components/button';
import { router } from 'expo-router';
import { colors } from '@/styles/colors';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import PlayerModal from '@/components/playerModal';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Dot from '@/components/dot';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { Ionicons } from '@expo/vector-icons';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function ShowWordToAll() {
  const { game, showWordToNextPlayer, getCurrentWord, setCurrentScreen, checkIfPlayerIsLiar } =
    useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/showWordToAll');
  }, []);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [isLyingPlayer, setIsLyingPlayer] = useState(false);
  const [rawWord, setRawWord] = useState('');
  const [modalVisible, setModalVisible] = useState(true);

  // Reveal animation
  const revealAnim = useSharedValue(0);
  useEffect(() => {
    if (wordRevealed) {
      revealAnim.value = withTiming(1, { duration: 500 });
    } else {
      revealAnim.value = 0;
    }
  }, [wordRevealed]);
  const revealAnimStyle = useAnimatedStyle(() => ({
    opacity: revealAnim.value,
    transform: [{ scale: interpolate(revealAnim.value, [0, 1], [0.85, 1]) }],
  }));

  const currentPlayer = game.players[game.showingWordToPlayer];

  // Translate during render so it reacts to language changes
  const displayWord = wordRevealed
    ? isLyingPlayer
      ? t('You will be the impostor this round!')
      : rawWord ? t(rawWord, { ns: 'categories' }) : ''
    : '';

  const displaySubtitle = wordRevealed
    ? isLyingPlayer
      ? t("Pretend you know the word and try to discover it based on people's answers.")
      : t('Answer the questions based on this word, but make sure to not make it easy for the impostor to discover it.')
    : '';

  const categoryData = game.category
    ? categories[game.category as keyof typeof categories]
    : null;
  const wordDescKey =
    wordRevealed && !isLyingPlayer && rawWord && categoryData?.wordDescriptions
      ? (categoryData.wordDescriptions as Record<string, string>)[rawWord]
      : null;
  const displayDescription = wordDescKey ? t(wordDescKey, { ns: 'categories' }) : '';

  function handleRevealWord() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const playerIsLying = checkIfPlayerIsLiar(currentPlayer.id);
    setIsLyingPlayer(playerIsLying);
    setRawWord(getCurrentWord());
    setWordRevealed(true);
  }

  function handleShowWordToNextPlayer() {
    if (game.showingWordToPlayer >= game.players.length - 1) {
      setWordRevealed(false);
      setRawWord('');
      setIsLyingPlayer(false);
      router.replace('/round');
    } else {
      showWordToNextPlayer();
      setWordRevealed(false);
      setRawWord('');
      setIsLyingPlayer(false);
      setModalVisible(true);
      router.replace('/showWordToAll');
    }
  }

  return (
    <ScreenLayout
      style={modalVisible && { opacity: 0.1 }}
      header={
        <View style={styles.headerContainer}>
          <Elipse top={verticalScale(-140)} left={scale(-30)} />
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: scale(5),
              flex: 1,
              paddingHorizontal: scale(spacing.sm)
            }}
          >
            <Text style={styles.headerCategoryTitle}>{t(game.category || '')}</Text>
            <Dot color={colors.white[100]} />
            <Text style={styles.headerCategoryTitle}>
              {t('Player')} {game.showingWordToPlayer + 1} {t('of')}{' '}
              {game.players.length}
            </Text>
          </View>
          <SidebarMenu />
        </View>
      }

      footer={
        <View>
          {wordRevealed === false ? (
            <Button
              text={t('Tap to reveal')}
              onPress={handleRevealWord}
              variants={modalVisible ? 'disabled' : 'primary'}
            />
          ) : (
            <Button text={t('Got it!')} onPress={handleShowWordToNextPlayer} />
          )}
        </View>
      }
    >
      <View style={styles.topContainer}>
        <View style={ styles.topTextContainer }>
          <Text style={styles.titleInformation}>{t('Pass device to:')}</Text>
          <Text style={styles.playerName}>{currentPlayer.name}</Text>
        </View>
        <Character mood={currentPlayer.character} />
      </View>
      <PlayerModal
        player={currentPlayer}
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
      />
      <View style={styles.secretWordContainer}>
        <View style={styles.flexSpacer} />

        {/* Card — always visible; outer border changes color for impostor */}
        <View style={[styles.wordCard, isLyingPlayer && styles.wordCardImpostor]}>
          <View style={[styles.wordCardInner, isLyingPlayer && styles.wordCardInnerImpostor]}>

            {!wordRevealed ? (
              /* Placeholder: locked state before reveal */
              <View style={styles.placeholderContent}>
                <Ionicons
                  name="lock-closed"
                  size={moderateScale(32)}
                  color={colors.gray[300]}
                />
              </View>
            ) : (
              /* Revealed content: fades in + scales up */
              <Animated.View style={[styles.revealedContent, revealAnimStyle]}>
                {/* Label row */}
                <View style={styles.cardLabelRow}>
                  <Text style={[styles.cardLabel, isLyingPlayer && styles.cardLabelImpostor]}>
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

                {/* Main word / role */}
                <Text style={[styles.secretWord, isLyingPlayer && styles.secretWordImpostor]}>
                  {displayWord}
                </Text>

                {/* Word description (non-impostor only) */}
                {displayDescription ? (
                  <Text style={styles.wordDescription}>{displayDescription}</Text>
                ) : null}
              </Animated.View>
            )}

          </View>
        </View>

        {/* Advice text — lives in a flex: 1 box below the card, mirroring the spacer above */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>{displaySubtitle}</Text>
        </View>
      </View>
    </ScreenLayout>

  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    flexDirection: "row",
    alignItems: "center" ,
    paddingHorizontal: scale(spacing.md)
  },
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
  },
  topContainer: {
    paddingLeft: scale(30),
    paddingTop: verticalScale(20),
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  topTextContainer: {
    flex: 1
  },
  titleInformation: {
    fontSize: fontSize.lg,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  modalPlayerName: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(25),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  secretWordContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(spacing.md),
  },
  // Card outer frame — always visible
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
  // Placeholder (before reveal)
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Revealed content (animated)
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
    fontFamily: 'Ralway',
    fontWeight: 'bold',
    color: colors.background[100],
    fontSize: fontSize.xxl,
    textAlign: 'center',
  },
  secretWordImpostor: {
    color: colors.white[100],
    fontSize: fontSize.lg,
  },
  flexSpacer: {
    flex: 1,
  },
  subtitleContainer: {
    flex: 1,
    paddingTop: verticalScale(spacing.md),
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    fontFamily: 'Ralway',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.orange[200],
    textAlign: 'center',
  },
  wordDescription: {
    fontFamily: 'Raleway-Medium',
    fontSize: fontSize.sm,
    color: colors.background[100],
    textAlign: 'center',
  },
});
