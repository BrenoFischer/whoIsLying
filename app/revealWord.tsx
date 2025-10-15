import Button from '@/components/button';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function RevealWord() {
  const [secretWordRevealed, setSecretWordRevealed] = useState(false);
  const { game, checkVoteForSecretWord, getCurrentWord } =
    useContext(GameContext);
  const { t } = useTranslation();

  const handleContinue = () => {
    //if impostor got correct the secret word, it obtains 2 points
    checkVoteForSecretWord();

    router.replace('/endGame');
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
        </View>
        <View style={styles.wordVotedContainer}>
          <Text style={styles.title}>
            {game.lyingPlayer.name} {t('voted for:')}
          </Text>
          <Text style={styles.word}>{t(game.selectedWord || '', { ns: 'categories' })}</Text>
        </View>

        {secretWordRevealed && (
          <View style={styles.secretWordContainer}>
            <Text style={styles.title}>{t('The secret word was:')}</Text>
            <Text style={[styles.word, { color: colors.orange[200] }]}>
              {t(getCurrentWord(), { ns: 'categories' })}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {secretWordRevealed ? (
            <Button text={t('Continue')} onPress={handleContinue} />
          ) : (
            <Button
              text={t('Reveal secret word')}
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
    marginTop: verticalScale(50),
  },
  wordVotedContainer: {
    paddingVertical: verticalScale(30),
    backgroundColor: colors.orange[200],
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(20),
    color: colors.white[100],
  },
  secretWordContainer: {
    marginTop: "5%",
  },
  word: {
    marginTop: verticalScale(10),
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(35),
    color: colors.black[100],
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.background[100],
  },
});
