import { GameContext } from '@/context/GameContext';
import React, { useContext, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
} from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { colors } from '@/styles/colors';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import PlayerModal from '@/components/playerModal';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Dot from '@/components/dot';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { Ionicons } from '@expo/vector-icons';
import { fontSize } from '@/styles/fontSize';

export default function ShowWordToAll() {
  const { game, showWordToNextPlayer, getCurrentWord, setCurrentScreen } =
    useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/showWordToAll');
  }, []);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [isLyingPlayer, setIsLyingPlayer] = useState(false);
  const [rawWord, setRawWord] = useState('');
  const [modalVisible, setModalVisible] = useState(true);

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

  function handleRevealWord() {
    const playerIsLying = game.lyingPlayer.id === currentPlayer.id;
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
        <Text style={styles.secretWord}>{displayWord}</Text>
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(5),
  },
  secretWord: {
    color: colors.white[100],
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Ralway',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.orange[200],
    paddingTop: verticalScale(spacing.sm),
    textAlign: 'center',
  },
});
