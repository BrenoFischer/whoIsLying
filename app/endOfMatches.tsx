import Button from '@/components/button';
import Character from '@/components/character';
import CustomModal from '@/components/modal';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { router } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import * as FileSystem from 'expo-file-system';
import ScreenLayout from '@/components/screenLayout';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function EndOfMatches() {
  const navigation = useNavigation();
  const [modalOpen, setModalOpen] = useState(false);

  const { game, setCurrentScreen, resetGameWithExistingPlayers, createNewGame } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/endOfMatches');
  }, []);

  const getWinners = () => {
    const firstPlayer = game.players[0];
    let highScore = firstPlayer.score;
    let winners = [firstPlayer];

    for (let i = 1; i < game.players.length; i++) {
      const player = game.players[i];
      if (player.score > highScore) {
        highScore = player.score;
        winners = [player];
      } else if (player.score === highScore) {
        winners = [...winners, player];
      }
    }

    return winners;
  };

  const allWinners = getWinners();

  function PlayerCard({ player }: { player: Player }) {
    return (
      <View style={styles.playerCard}>
        <Text style={styles.playerName}>{player.name}</Text>
        <Character mood={player.character} />
      </View>
    );
  }

  const cleanupAudioFiles = () => {
    game.rounds
      .filter(round => round.audio)
      .forEach(round => {
        try {
          new FileSystem.File(round.audio!).delete();
        } catch (e) {
          console.warn('Failed to delete audio file:', round.audio, e);
        }
      });
  };

  const handlePlayerOneMoreRound = () => {
    setModalOpen(false);
    cleanupAudioFiles();
    resetGameWithExistingPlayers();
    router.replace('/selectCategory');
  };

  const handleStartNewGame = () => {
    setModalOpen(false);
    cleanupAudioFiles();
    createNewGame();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  return (
    <ScreenLayout
      scrollable
      style={modalOpen ? { opacity: 0.1 } : undefined}
      footer={<Button text={t('Continue')} onPress={() => setModalOpen(true)} />}
    >
      <CustomModal setModalVisible={setModalOpen} modalVisible={modalOpen}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('Do you want to:')}</Text>
          <Character mood="bothCharacter" />
          <View style={styles.modalButtons}>
            <Button text={t('Play one more round')} onPress={handlePlayerOneMoreRound} />
            <Button text={t('Start a fresh new game')} onPress={handleStartNewGame} />
          </View>
        </View>
      </CustomModal>

      <Text style={styles.title}>
        {allWinners.length > 1 ? t('The grand winners are!') : t('The grand winner is!')}
      </Text>

      {allWinners.map(p => (
        <PlayerCard player={p} key={p.id} />
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
    marginTop: verticalScale(spacing.xl),
    marginBottom: verticalScale(spacing.sm),
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: colors.white[100],
    marginHorizontal: scale(spacing.md),
    borderRadius: radius.md,
    marginVertical: verticalScale(spacing.md),
    paddingVertical: verticalScale(spacing.lg),
    gap: verticalScale(spacing.sm),
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  modalContent: {
    alignItems: 'center',
    gap: verticalScale(spacing.lg),
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  modalButtons: {
    width: '100%',
    gap: verticalScale(spacing.xl),
  },
});
