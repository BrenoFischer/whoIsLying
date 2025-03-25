import { GameContext, GameContextProvider } from '@/context/GameContext';
import React, { useContext } from 'react';
import { View, Image, StyleSheet, Platform, Text } from 'react-native';


export default function SkillUpScreen() {
  const {game} = useContext(GameContext);

  console.log(game)

  return (
    <GameContextProvider>
      <View>
          <Text>Test</Text>
      </View>
    </GameContextProvider>
  );
}


const styles = StyleSheet.create({
});