import { GameContext, GameContextProvider } from '@/context/GameContext';
import React, { useContext } from 'react';
import { StyleSheet, Text, SafeAreaView, View, TouchableOpacity } from 'react-native';
import EndGame from './endGame';
import Button from '@/components/button';
import { router } from 'expo-router';
import { colors } from '@/styles/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import Character from '@/components/character';


export default function RoundScreen() {
  const { game, nextRound, previousRound } = useContext(GameContext);

  const totalRounds = (game.players.length) * 2

  if(game.currentRound === totalRounds + 1) {
    return <EndGame />
  }

  const round = game.rounds[game.currentRound - 1]
  const playerThatAsks = round.playerThatAsks
  const playerThatAnswers = round.playerThatAnswers
  const question = round.question

  const handleNextRound = () => {
    nextRound();
    router.navigate('/round')
  }

  const handlePreviousRound = () => {
    previousRound();
    router.navigate('/round')
  }

  return (
    <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
      <View style={{ marginLeft: 10, marginTop: 30}}>
        {
          game.currentRound !== 1 ?
          <TouchableOpacity onPress={handlePreviousRound}>
            <Ionicons name="arrow-back" size={24} color={colors.orange[200]} />
          </TouchableOpacity>
          :
          <View style={{ height: 24 }} />
        }
        
        <View style={{alignItems: "center", flexDirection: "row", marginVertical: 12}}>
            <Text style={styles.headerCategoryTitle}>Round {game.currentRound} of {totalRounds}</Text>
            <View style={{ backgroundColor: colors.orange[200], width: 8, height: 8, borderRadius: "50%", marginHorizontal: 8 }} />
            <Text style={styles.headerCategoryTitle}>Category: {game.category}</Text>
        </View>
      </View>

      <View>
        <View>
          <Text style={styles.playerName}>{playerThatAsks.name} <Text style={styles.playerThatAnswers}>asks</Text> {playerThatAnswers.name}</Text>
          <View style={{ flexDirection: "row" }}> 
            <Character mood={playerThatAsks.character} />
            <Character mood={playerThatAnswers.character} flip />
          </View>
        </View>
      </View>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.buttonContainer}>
        <Button text='Continue' onPress={handleNextRound} />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  headerCategoryTitle: {
    textTransform: "capitalize",
    fontSize: 16,
    fontFamily: "Raleway",
    color: colors.white[100],
  },
  playerName: {
    marginTop: 30,
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: "Ralway",
    fontSize: 40,
    fontWeight: "bold",
    color: colors.white[100],
    textAlign: "center",
  },
  playerThatAnswers: {
    color: colors.orange[200]
  },
  question: {
    fontSize: 30,
    color: colors.white[100],
    fontFamily: "Sigmar",
    padding: 20,
    textAlign: "center",
    marginTop: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    justifyContent: 'center', 
    alignItems: 'center',
  },
});