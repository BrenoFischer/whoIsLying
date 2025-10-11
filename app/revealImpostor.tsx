import Button from '@/components/button';
import Character from '@/components/character';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function RevealImpostor() {
  const { t } = useTranslation();
  const phrasesToReveal = [
    t('Impostor, you can cough 3 times to reveal yourself'),
    t('Impostor, you can raise your right hand to reveal yourself'),
    t('Impostor, you can stand up to reveal yourself'),
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
          <Text style={styles.title}>{t('The real impostor was:')}</Text>
          {nextReveal ? (
            <PlayerCard />
          ) : (
            <Text style={styles.randomPhrase}>{randomPhrase}</Text>
          )}
          <View style={styles.buttonContainer}>
            {nextReveal ? (
              <Button
                text={t('Continue')}
                onPress={() => {
                  router.replace('/words');
                }}
              />
            ) : (
              <Button text={t('Done it')} onPress={() => setNextReveal(true)} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: verticalScale(50),
    justifyContent: 'space-between',
    height: '90%',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(20),
    color: colors.orange[200],
  },
  randomPhrase: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    paddingHorizontal: scale(25),
    fontSize: moderateScale(35),
    color: colors.white[100],
  },
  playerCard: {
    backgroundColor: colors.white[100],
    marginHorizontal: scale(30),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(20),
    paddingTop: verticalScale(20),
  },
  playerCardHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.orange[200],
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
