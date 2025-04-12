import { GameContext } from '@/context/GameContext';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, View } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { colors } from '@/styles/colors';
import Character from '@/components/character';
import Elipse from '@/components/elipse';


export default function ShowWordToAll() {
  const { game, showWordToNextPlayer } = useContext(GameContext);
  const [ wordRevealed, setWordRevealed ] = useState(false);
  const [ displayWord, setDisplayWord ] = useState('');

  const currentPlayer = game.players[game.showingWordToPlayer]

  function handleRevealWord() {
    const playerIsLying = game.lyingPlayer.id === currentPlayer.id
    const word = playerIsLying ? "You need to lie" : game.word
    setDisplayWord(word || '');
    setWordRevealed(true);
  }

  function handleShowWordToNextPlayer() {
    if(game.showingWordToPlayer >= game.players.length - 1) {
        router.navigate('/round')
    }
    else{
        showWordToNextPlayer()
        setWordRevealed(false)
        setDisplayWord('')
        router.navigate('/showWordToAll')
    }
  }

  return (
    <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
        <Elipse top={-30} left={-30} />
        <View style={styles.headerContainer}>
            <View>
                <Text style={styles.titleInformation}>Pass device to:</Text>
                <Text style={styles.playerName}>{currentPlayer.name}</Text>
            </View>
            <Character mood={currentPlayer.character} />
        </View>
        <View style={styles.secretWordContainer}>
            <Text style={styles.secretWord}>{displayWord}</Text>
        </View>
        <View style={styles.buttonContainer}>
            {
                wordRevealed === false ?
                    <Button text={'Tap to reveal'} onPress={handleRevealWord} />
                :
                    <Button text={'Got it!'} onPress={handleShowWordToNextPlayer} />
            }
        </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
    headerContainer: {
        marginLeft: 30,
        marginTop: 50,
        flexDirection: "row",
        justifyContent: "space-around"
    },
    titleInformation: {
        fontSize: 20,
        fontFamily: "Raleway",
        fontWeight: "bold",
        color: colors.black[100],
        marginBottom: 10
    },
    playerName: {
        fontFamily: "Ralway",
        fontSize: 40,
        fontWeight: "bold",
        color: colors.white[100]
    },
    secretWordContainer: {
        marginTop: 150,
        justifyContent: "center",
        alignItems: "center",
    },
    secretWord: {
        color: colors.white[100],
        fontSize: 30
    },
    buttonContainer: {
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        justifyContent: 'center', 
        alignItems: 'center',
    }
});