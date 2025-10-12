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
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

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
    router.replace('/votes');
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
        <Elipse left={scale(-20)} />
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: verticalScale(60),
          }}
        >
          <View style={{ marginBottom: verticalScale(30) }}>
            <Text style={styles.title}>{t('Discussion time!')}</Text>
            <Text style={styles.subtitle}>
              {t(
                'Review all questions and analyse each detail that was answered'
              )}
            </Text>
          </View>
          {/* <Character mood="bothCharacter" size='small' /> */}
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.table}>
            {agregatedArray.map((round, index) => {
              // Get the translated question for this specific round
              const translatedQuestion =
                game.category &&
                round.questionIndex !== undefined &&
                round.questionSet
                  ? (() => {
                      const categories: any = require('@/data/categories.json');
                      const key =
                        round.questionSet === 'first'
                          ? 'firstSetOfQuestions'
                          : 'secondSetOfQuestions';
                      return categories[game.category][language][key][
                        round.questionIndex
                      ];
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
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button text={t('Continue')} onPress={handleNextPage} />
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  title: {
    fontSize: moderateScale(30),
    maxWidth: scale(250),
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontFamily: 'Raleway-Medium',
    maxWidth: scale(250),
  },
  table: {
    gap: verticalScale(10),
    padding: scale(20),
    marginHorizontal: scale(25),
    marginBottom: verticalScale(15),
    backgroundColor: colors.white[100],
    borderRadius: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  playerName: {
    fontSize: moderateScale(17),
    fontFamily: 'Sigmar',
    color: colors.orange[200],
  },
  question: {
    fontSize: moderateScale(15),
    fontFamily: 'Raleway-Medium',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: verticalScale(20),
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20),
    backgroundColor: colors.background[100],
  },
});
