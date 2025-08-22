import Button from '@/components/button';
import Character from '@/components/character';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function RevealImpostor() {
  const phrasesToReveal = [
    'Impostor, you can cough 3 times to reveal yourself',
    'Impostor, you can raise your right hand to reveal yourself',
    'Impostor, you can stand up to reveal yourself',
  ];
  const [nextReveal, setNextReveal] = useState(false);
  const { game } = useContext(GameContext);

  const getRandomPhrase = () => {
    return phrasesToReveal[Math.floor(Math.random() * phrasesToReveal.length)];
  };

  const randomPhrase = getRandomPhrase();

  const impostorPlayer = game.lyingPlayer;

  function PlayerCard() {
    return (
      <View style={styles.playerCard}>
        <View style={styles.playerCardHeaderContainer}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.playerName}>{impostorPlayer.name}</Text>
            <Character mood={impostorPlayer.character} />
          </View>
        </View>
      </View>
    );
  }

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
          <Text style={styles.title}>The real impostor was:</Text>
          {nextReveal ? (
            <PlayerCard />
          ) : (
            <Text style={styles.randomPhrase}>{randomPhrase}</Text>
          )}
          <View style={styles.buttonContainer}>
            {nextReveal ? (
              <Button
                text="Continue"
                onPress={() => {
                  router.replace('/words');
                }}
              />
            ) : (
              <Button text="Done it" onPress={() => setNextReveal(true)} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 50,
    justifyContent: 'space-between',
    height: '90%',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.orange[200],
  },
  randomPhrase: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    paddingHorizontal: 25,
    fontSize: 35,
    color: colors.white[100],
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
