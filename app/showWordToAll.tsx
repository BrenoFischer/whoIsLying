import { GameContext } from '@/context/GameContext';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { colors } from '@/styles/colors';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import PlayerModal from '@/components/playerModal';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';

export default function ShowWordToAll() {
  const { game, showWordToNextPlayer, getCurrentWord } =
    useContext(GameContext);
  const { language, t } = useTranslation();
  const [wordRevealed, setWordRevealed] = useState(false);
  const [displayWord, setDisplayWord] = useState('');
  const [displaySubtitle, setDisplaySubtitle] = useState('');
  const [modalVisible, setModalVisible] = useState(true);

  const currentPlayer = game.players[game.showingWordToPlayer];

  function handleRevealWord() {
    const playerIsLying = game.lyingPlayer.id === currentPlayer.id;
    const word = playerIsLying
      ? t('You will be the impostor this round!')
      : getCurrentWord(language);
    const subtitle = playerIsLying
      ? t(
          "Pretend you know the word and try to discover it based on people's answers."
        )
      : t(
          'Answer the questions based on this word, but make sure to not make it easy for the impostor to discover it.'
        );
    setDisplayWord(word || '');
    setDisplaySubtitle(subtitle || '');
    setWordRevealed(true);
  }

  function handleShowWordToNextPlayer() {
    if (game.showingWordToPlayer >= game.players.length - 1) {
      setWordRevealed(false);
      setDisplayWord('');
      setDisplaySubtitle('');
      router.replace('/round');
    } else {
      showWordToNextPlayer();
      setWordRevealed(false);
      setDisplayWord('');
      setDisplaySubtitle('');
      setModalVisible(true);
      router.navigate('/showWordToAll');
    }
  }

  return (
    <WithSidebar>
      <SafeAreaView
        style={[
          {
            backgroundColor: colors.background[100],
            overflow: 'hidden',
            height: '100%',
          },
          modalVisible && { opacity: 0.1 },
        ]}
      >
        <Elipse top={-60} left={-30} />
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginBottom: 12,
            marginLeft: 15,
            marginRight: 15,
            marginTop: 30,
          }}
        >
          <Text style={styles.headerCategoryTitle}>{t('Category')}</Text>
          <View
            style={{
              backgroundColor: colors.white[100],
              width: 8,
              height: 8,
              borderRadius: '50%',
              marginHorizontal: 8,
            }}
          />
          <Text style={styles.headerCategoryTitle}>{t(game.category || '')}</Text>
          <View
            style={{
              backgroundColor: colors.white[100],
              width: 8,
              height: 8,
              borderRadius: '50%',
              marginHorizontal: 8,
            }}
          />
          <Text style={styles.headerCategoryTitle}>
            {t('Player')} {game.showingWordToPlayer + 1} {t('of')}{' '}
            {game.players.length}
          </Text>
        </View>
        <View style={styles.headerContainer}>
          <View>
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
        <View style={styles.buttonContainer}>
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
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginLeft: 30,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalPlayerName: {
    fontFamily: 'Ralway',
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
  },
  titleInformation: {
    fontSize: 18,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  secretWordContainer: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  secretWord: {
    color: colors.white[100],
    fontSize: 26,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  subtitle: {
    fontFamily: 'Ralway',
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.orange[200],
    paddingHorizontal: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
