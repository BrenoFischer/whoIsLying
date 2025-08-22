import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { router } from 'expo-router';
import { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function EndGame() {
  const { game, addNewMatch } = useContext(GameContext);

  const sortedWinningPlayers = game.players
    .slice()
    .sort((p1, p2) => p2.score - p1.score);

  function PlayerWithScore({
    player,
    index,
  }: {
    player: Player;
    index: number;
  }) {
    return (
      <View style={styles.playerCard}>
        <View style={styles.headerContainer}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <Text style={styles.index}>{index + 1}</Text>
              <Text style={styles.playerName}>{player.name}</Text>
            </View>
            <Character mood={player.character} />
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: 150,
            }}
          >
            <Text style={styles.playerScore}>
              {player.score} <Text style={styles.playerPointsText}>points</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const handleContinue = () => {
    const currentMatch = game.currentMatch;

    if (currentMatch >= game.maximumMatches) {
      router.navigate('/endOfMatches');
    } else {
      addNewMatch();
      router.navigate('/selectCategory');
    }
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: colors.background[100],
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <ScrollView style={{ marginBottom: 120 }}>
        <Text style={styles.title}>Scores:</Text>
        {sortedWinningPlayers.map((p, idx) => {
          return <PlayerWithScore key={p.id} player={p} index={idx} />;
        })}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button text="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.orange[200],
    marginTop: 40,
  },
  playerCard: {
    backgroundColor: colors.orange[200],
    marginHorizontal: 13,
    borderRadius: 10,
    marginVertical: 20,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  index: {
    fontFamily: 'Ralway',
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.black[200],
  },
  playerScore: {
    fontFamily: 'Ralway',
    fontSize: 30,
    fontWeight: 'bold',
  },
  playerPointsText: {
    fontSize: 20,
    fontWeight: 'normal',
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
