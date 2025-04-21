import { GameContext } from '@/context/GameContext';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, SafeAreaView, View, Modal, Alert, Pressable } from 'react-native';
import Button from '@/components/button';
import { router } from 'expo-router';
import { colors } from '@/styles/colors';
import Character from '@/components/character';
import Elipse from '@/components/elipse';


export default function ShowWordToAll() {
  const { game, showWordToNextPlayer } = useContext(GameContext);
  const [ wordRevealed, setWordRevealed ] = useState(false);
  const [ displayWord, setDisplayWord ] = useState('');
  const [ displaySubtitle, setDisplaySubtitle ] = useState('');
  const [ modalVisible, setModalVisible ] = useState(true);

  const currentPlayer = game.players[game.showingWordToPlayer]

  function handleRevealWord() {
    const playerIsLying = game.lyingPlayer.id === currentPlayer.id
    const word = playerIsLying ? "You will be the impostor this round!" : game.word
    const subtitle = playerIsLying ? "Pretend you know the word and try to discover it based on people's answers." : "Answer the questions based on this word, but make sure to not make it easy for the impostor to discover it."
    setDisplayWord(word || '');
    setDisplaySubtitle(subtitle || '');
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
        setDisplaySubtitle('')
        setModalVisible(true)
        router.navigate('/showWordToAll')
    }
  }

  return (
    <SafeAreaView style={[{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}, modalVisible && { opacity: 0.1 }]}>
        <Elipse top={-30} left={-30} />
        <View style={{alignItems: "center", flexDirection: "row", marginVertical: 12, marginLeft: 30, marginTop: 20 }}>
            <Text style={styles.headerCategoryTitle}>Category</Text>
            <View style={{ backgroundColor: colors.white[100], width: 8, height: 8, borderRadius: "50%", marginHorizontal: 8 }} />
            <Text style={styles.headerCategoryTitle}>{game.category}</Text>
            <View style={{ backgroundColor: colors.white[100], width: 8, height: 8, borderRadius: "50%", marginHorizontal: 8 }} />
            <Text style={styles.headerCategoryTitle}>Player {game.showingWordToPlayer + 1} of {game.players.length}</Text>
        </View>
        <View style={styles.headerContainer}>
            <View>
                <Text style={styles.titleInformation}>Pass device to:</Text>
                <Text style={styles.playerName}>{currentPlayer.name}</Text>
            </View>
            <Character mood={currentPlayer.character} />
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.modalView}>
              <View>
                <View>
                    <Text style={styles.titleInformation}>Pass device to:</Text>
                    <Text style={styles.modalPlayerName}>{currentPlayer.name}</Text>
                </View>
              <Character mood={currentPlayer.character} />
          </View>
              <Button text={`I'm ${currentPlayer.name}`} onPress={() => {setModalVisible(false)}} />
            </View>
          </View>
        </Modal>
        <View style={styles.secretWordContainer}>
            <Text style={styles.secretWord}>{displayWord}</Text>
            <Text style={styles.subtitle}>{displaySubtitle}</Text>
        </View>
        <View style={styles.buttonContainer}>
            {
                wordRevealed === false ?
                    <Button text={'Tap to reveal'} onPress={handleRevealWord} variants={modalVisible ? 'disabled' : 'primary'} />
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
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-around"
    },
    modalPlayerName: {
      fontFamily: "Ralway",
      fontSize: 25,
      fontWeight: "bold",
      color: colors.orange[200]
    },
    headerCategoryTitle: {
        textTransform: "capitalize",
        fontSize: 16,
        fontFamily: "Raleway",
    },
    titleInformation: {
        fontSize: 20,
        fontFamily: "Raleway",
        fontWeight: "bold",
        color: colors.black[100],
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
        fontSize: 30,
        paddingHorizontal: 25,
    },
    subtitle: {
        fontFamily: "Ralway",
        fontSize: 15,
        fontWeight: "bold",
        color: colors.orange[200],
        paddingHorizontal: 28,
        marginTop: 30,
    },
    buttonContainer: {
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        justifyContent: 'center', 
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
});
