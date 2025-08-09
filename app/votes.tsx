import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { useContext, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/button';
import { router } from 'expo-router';
import Elipse from '@/components/elipse';
import Character from '@/components/character';
import { Player } from '@/types/Player';
import PlayerModal from '@/components/playerModal';
import WithSidebar from '@/components/withSideBar';

export default function Votes() {
  const { game, addVote } = useContext(GameContext);
  const players = game.players;
  const [player, setPlayer] = useState(players[0]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>(
    undefined
  );

  const handleNextPlayer = () => {
    const newIndex = playerIndex + 1;

    addVote(player, selectedPlayer!);

    if (newIndex >= players.length) {
      setPlayerIndex(0);
      setPlayer(players[0]);
      setModalVisible(true);
      setSelectedPlayer(undefined);
      router.replace('/votesResults');
    } else {
      setPlayerIndex(newIndex);
      setPlayer(players[newIndex]);
      setModalVisible(true);
      setSelectedPlayer(undefined);
    }
  };

  const getRestOfPlayers = () => {
    return players.filter(p => p.id !== player.id);
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
  };

  function PlayerVoteOption({
    player,
    isLastPlayer,
  }: {
    player: Player;
    isLastPlayer: boolean;
  }) {
    const isPlayerSelected =
      selectedPlayer === undefined ? false : player.id === selectedPlayer.id;

    return (
      <TouchableOpacity
        onPress={() => handleSelectPlayer(player)}
        style={[
          styles.container,
          isLastPlayer && { marginBottom: 50 },
          isPlayerSelected && { backgroundColor: colors.orange[200] },
        ]}
      >
        <Text style={styles.playerOptionName}>{player.name}</Text>
      </TouchableOpacity>
    );
  }

  const restOfPlayer = getRestOfPlayers();

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
        <Elipse top={-30} left={-30} />
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginVertical: 12,
            marginLeft: 30,
            marginTop: 20,
          }}
        >
          <Text style={styles.headerCategoryTitle}>Vote</Text>
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
            Player {playerIndex + 1} of {players.length}
          </Text>
        </View>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.titleInformation}>Pass device to:</Text>
            <Text style={styles.playerName}>{player.name}</Text>
          </View>
          <Character mood={player.character} />
        </View>
        <PlayerModal
          player={player}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
        <ScrollView style={styles.table}>
          <Text style={styles.playerNameOnTable}>
            {player.name},{' '}
            <Text style={styles.tableText}>
              vote on the person you think is the impostor:
            </Text>
          </Text>
          {restOfPlayer.map((p, idx) => {
            const isLastPlayer = idx === restOfPlayer.length - 1;
            return (
              <PlayerVoteOption
                key={p.id}
                player={p}
                isLastPlayer={isLastPlayer}
              />
            );
          })}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button
            text="Vote!"
            onPress={handleNextPlayer}
            variants={selectedPlayer ? 'primary' : 'disabled'}
          />
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
  },
  headerContainer: {
    marginLeft: 30,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  titleInformation: {
    fontSize: 20,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  playerNameOnTable: {
    fontFamily: 'Ralway',
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  tableText: {
    fontSize: 20,
    fontFamily: 'Raleway',
    color: colors.black[100],
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    padding: 20,
    marginHorizontal: 25,
    maxHeight: 380,
    backgroundColor: colors.white[100],
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalPlayerName: {
    fontFamily: 'Ralway',
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.orange[200],
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
  container: {
    width: 300,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: colors.orange[200],
    marginTop: 15,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: colors.white[100],
  },
  playerOptionName: {
    fontFamily: 'Ralway',
    fontSize: 20,
    color: colors.black[200],
  },
});
