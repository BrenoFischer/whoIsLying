import Button from '@/components/button';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/translations';

export default function Discussion() {
  const { game, getCurrentQuestion } = useContext(GameContext);
  const { language, t } = useTranslation();

  const rounds = game.rounds;

  const agregateByPlayer = () => {
    let agregatedArray = [game.rounds[0]];

    for (let i = 1; i < rounds.length; i++) {
      let hasPlayer = false;
      let playerPosition = 0;
      const player = rounds[i].playerThatAnswers;

      agregatedArray.forEach((r, idx) => {
        if (r.playerThatAnswers.id === player.id) {
          hasPlayer = true;
          playerPosition = idx;
        }
      });
      if (hasPlayer) {
        agregatedArray = agregatedArray
          .slice(0, playerPosition)
          .concat([rounds[i]])
          .concat(agregatedArray.slice(playerPosition, agregatedArray.length));
      } else {
        agregatedArray = [...agregatedArray, rounds[i]];
      }
    }

    return agregatedArray;
  };

  const handleNextPage = () => {
    router.navigate('/votes');
  };

  const agregatedArray = agregateByPlayer();

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <Elipse left={10} />
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 60,
          }}
        >
          <View style={{ marginBottom: 30 }}>
            <Text style={styles.title}>{t('Discussion time!')}</Text>
            <Text style={styles.subtitle}>
              {t('Review all questions and analyse each detail that was answered')}
            </Text>
          </View>
          <Character mood="bothCharacter" />
        </View>
        <ScrollView>
          <View style={styles.table}>
            {agregatedArray.map((round, index) => {
              // Get the translated question for this specific round
              const translatedQuestion = game.category && round.questionIndex !== undefined && round.questionSet
                ? (() => {
                    const categories: any = require('@/data/categories.json');
                    const key = round.questionSet === 'first' ? 'firstSetOfQuestions' : 'secondSetOfQuestions';
                    return categories[game.category][language][key][round.questionIndex];
                  })()
                : round.question;
              
              return (
                <View key={`${round.playerThatAnswers.id}-${index}`}>
                  <Text style={styles.playerName}>
                    {round.playerThatAnswers.name}
                  </Text>
                  <Text style={styles.question}>{translatedQuestion}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.buttonContainer}>
            <Button text={t('Continue')} onPress={handleNextPage} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 35,
    maxWidth: 250,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    maxWidth: 250,
  },
  table: {
    gap: 10,
    padding: 20,
    marginHorizontal: 25,
    marginBottom: 200,
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
  playerName: {
    fontSize: 17,
    fontFamily: 'Sigmar',
    color: colors.orange[200],
  },
  question: {
    fontSize: 15,
    fontFamily: 'Raleway-Medium',
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
