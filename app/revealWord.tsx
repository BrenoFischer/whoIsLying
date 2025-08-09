import Button from '@/components/button';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function RevealWord() {
  const [secretWordRevealed, setSecretWordRevealed] = useState(false);
  const { game, updatePointsToPlayer, updatePlayers } = useContext(GameContext);

  const handleContinue = () => {
    //if impostor got correct the secret word, it obtains 50 points
    if (game.selectedWord === game.word) {
      const updatedPlayers = updatePointsToPlayer(game.lyingPlayer, 50);
      updatePlayers(updatedPlayers);
    }

    router.navigate('/endGame');
  };

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <View style={styles.headerContainer}>
          <Character mood={game.lyingPlayer.character} />
          <View>
            <Text style={styles.title}>{game.lyingPlayer.name} voted for:</Text>
            <Text style={styles.word}>{game.selectedWord}</Text>
          </View>
        </View>

        {secretWordRevealed && (
          <View style={{ marginTop: 120 }}>
            <Text style={styles.title}>The secret word was:</Text>
            <Text style={[styles.word, { color: colors.orange[200] }]}>
              {game.word}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {secretWordRevealed ? (
            <Button text="Continue" onPress={handleContinue} />
          ) : (
            <Button
              text="Reveal secret word"
              onPress={() => {
                setSecretWordRevealed(true);
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange[200],
    marginTop: 30,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.white[100],
  },
  word: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: 35,
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
});
