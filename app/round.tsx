import { GameContext, GameContextProvider } from '@/context/GameContext';
import React, { useContext } from 'react';
import { StyleSheet, Text, SafeAreaView } from 'react-native';
import EndGame from './endGame';
import Button from '@/components/button';
import { router } from 'expo-router';


export default function RoundScreen() {
  const { game, nextRound } = useContext(GameContext);

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

  return (
    <SafeAreaView>
      <Text>Round {game.currentRound} of {totalRounds}</Text>
        <Text>{playerThatAsks.name} asks {playerThatAnswers.name}</Text>
        <Text>{question}</Text>
        <Button text='Continue' onPress={handleNextRound} />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
});