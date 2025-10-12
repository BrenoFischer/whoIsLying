import { GameContext } from '@/context/GameContext';
import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
} from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { colors } from '@/styles/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Character from '@/components/character';
import Discussion from './discussion';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function RoundScreen() {
  const { game, nextRound, previousRound, getCurrentQuestion } =
    useContext(GameContext);
  const { language, t } = useTranslation();

  const totalRounds = game.players.length * 2;

  if (game.currentRound === totalRounds + 1) {
    return <Discussion />;
  }

  const round = game.rounds[game.currentRound - 1];
  const playerThatAsks = round.playerThatAsks;
  const playerThatAnswers = round.playerThatAnswers;
  const question = getCurrentQuestion(language);

  const handleNextRound = () => {
    nextRound();
    router.navigate('/round');
  };

  const handlePreviousRound = () => {
    previousRound();
    router.navigate('/round');
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
        <View style={{ marginLeft: scale(15), marginRight: scale(15), marginTop: verticalScale(30) }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginVertical: verticalScale(12),
            }}
          >
            <Text style={styles.headerCategoryTitle}>
              {t('Round')} {game.currentRound} {t('of')} {totalRounds}
            </Text>
            <View
              style={{
                backgroundColor: colors.orange[200],
                width: scale(8),
                height: verticalScale(8),
                borderRadius: '50%',
                marginHorizontal: scale(8),
              }}
            />
            <Text style={styles.headerCategoryTitle}>
              {t('Category')}: {t(game.category || '')}
            </Text>
          </View>
        </View>

        <View>
          <View>
            <Text style={styles.playerName}>
              {playerThatAsks.name}{' '}
              <Text style={styles.playerThatAnswers}>{t('asks')}</Text>{' '}
              {playerThatAnswers.name}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Character mood={playerThatAsks.character} />
              <Character mood={playerThatAnswers.character} flip />
            </View>
          </View>
        </View>
        <Text style={styles.question}>{question}</Text>
        <View style={styles.buttonContainer}>
          <Button text={t('Continue')} onPress={handleNextRound} />
          <View style={styles.arrowButtonContainer}>
            {game.currentRound !== 1 ? (
              <TouchableOpacity onPress={handlePreviousRound}>
                <AntDesign
                  name="left"
                  size={moderateScale(24)}
                  color={colors.orange[200]}
                />
              </TouchableOpacity>
            ) : (
              <View style={{ height: verticalScale(24) }} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
    color: colors.white[100],
    textAlign: 'center',
  },
  playerName: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
    paddingHorizontal: scale(15),
    fontFamily: 'Ralway',
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: colors.white[100],
    textAlign: 'center',
  },
  playerThatAnswers: {
    color: colors.orange[200],
  },
  question: {
    fontSize: moderateScale(18),
    color: colors.white[100],
    fontFamily: 'Sigmar',
    padding: scale(15),
    textAlign: 'center',
    marginTop: scale(50),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: verticalScale(40),
    left: scale(20),
    right: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonContainer: {
    position: 'absolute',
    left: scale(5)
  }
});
