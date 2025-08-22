import Button from '@/components/button';
import Character from '@/components/character';
import CustomModal from '@/components/modal';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppReset } from '@/context/AppResetContext';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

export default function EndOfMatches() {
  const navigation = useNavigation();
  const [modalOpen, setModalOpen] = useState(false);

  const { resetApp } = useAppReset();
  const { game } = useContext(GameContext);

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
        <View style={styles.playerCardHeaderContainer}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Character mood={player.character} />
          </View>
        </View>
      </View>
    );
  }

  const handleContinue = () => {
    setModalOpen(true);
  };

  const handlePlayerOneMoreRound = () => {
    setModalOpen(!modalOpen);
    router.replace('/selectCategory');
  };

  const handleStartNewGame = () => {
    setModalOpen(!modalOpen);
    resetApp();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  return (
    <SafeAreaView
      style={[
        {
          backgroundColor: colors.background[100],
          overflow: 'hidden',
          height: '100%',
        },
        modalOpen && { opacity: 0.1 },
      ]}
    >
      <View style={styles.headerContainer}>
        {allWinners.length > 1 ? (
          <Text style={styles.title}>The grand winners are!</Text>
        ) : (
          <Text style={styles.title}>The grand winner is!</Text>
        )}
        <ScrollView>
          {allWinners.map(p => {
            return <PlayerCard player={p} key={p.id} />;
          })}
        </ScrollView>
      </View>
      <CustomModal setModalVisible={setModalOpen} modalVisible={modalOpen}>
        <>
          <View>
            <View style={{ marginBottom: 30 }}>
              <Text style={styles.titleInformation}>Do you want to:</Text>
            </View>
          </View>
          <Character mood="bothCharacter" />
          <View style={{ gap: 40 }}>
            <Button
              text={'Play one more round'}
              onPress={handlePlayerOneMoreRound}
            />
            <Button
              text={'Start a fresh new game'}
              onPress={handleStartNewGame}
            />
          </View>
        </>
      </CustomModal>
      <View style={styles.buttonContainer}>
        <Button text="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 100,
    height: '90%',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.orange[200],
  },
  titleInformation: {
    fontSize: 20,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  playerCard: {
    backgroundColor: colors.white[100],
    marginHorizontal: 30,
    borderRadius: 10,
    marginVertical: 20,
    paddingTop: 20,
  },
  playerCardHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.orange[200],
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
