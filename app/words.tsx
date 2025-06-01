import Button from "@/components/button";
import Character from "@/components/character";
import PlayerModal from "@/components/playerModal";
import WithSidebar from "@/components/withSideBar";
import { GameContext } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Words() {
    const [modalVisible, setModalVisible] = useState(true)
    const [newSelectedWord, setNewSelectedWord] = useState('')
    const [allWords, setAllWords] = useState<string[]>([])
    const {game, getRandomWord, setSelectedWord} = useContext(GameContext)

    const impostorPlayer = game.lyingPlayer

    const getRandomWords = (): string[] => {
        let i = 0;
        let randomWords = []

        while(i < 4) {
            const word = getRandomWord(game.category!)
            if(word !== game.word) {
                let wordNotAlreadySelected = true
                for(let j = 0; j < randomWords.length; j++) {
                    if(randomWords[j] === word) {
                        wordNotAlreadySelected = false
                    }
                }
                if(wordNotAlreadySelected) {
                    randomWords.push(word)
                    i += 1
                }
            }
        }

        return randomWords
    }

    const addWordAndShuffle = (words: string[]) => {
        words.push(game.word!)
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]]; // Swap elements
        }
        return words;
    }

    const handleSelectWord = (word: string) => {
        setNewSelectedWord(word)
    }

    function WordVoteOption({word}: {word: string}){
        const isWordSelected = newSelectedWord === word

        return(
            <TouchableOpacity onPress={() => handleSelectWord(word)} style={[styles.wordContainer, isWordSelected && {backgroundColor: colors.orange[200]}]}>
                <Text style={styles.wordOption}>{word}</Text>
            </TouchableOpacity>
        )
    }

    const handleContinue = () => {
        setSelectedWord(newSelectedWord)
        setAllWords([])
        router.push('/revealWord')
    }

    useEffect(() => {
        const randomWords = getRandomWords()
        const words = addWordAndShuffle(randomWords)

        setAllWords(words)
    }, [])

    return(
        <WithSidebar>
            <SafeAreaView style={[{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}, modalVisible && { opacity: 0.1 }]}>
                <PlayerModal player={impostorPlayer} modalVisible={modalVisible} setModalVisible={setModalVisible} />
                <Character mood={impostorPlayer.character} />
                <View style={styles.table}>
                    <Text style={styles.playerNameOnTable}>{impostorPlayer.name}, <Text style={styles.tableText}>vote on the secret word your think is the correct one:</Text></Text>
                    {
                        allWords.map(w => {
                            return <WordVoteOption key={w} word={w} />
                        })
                    }
                </View>
                <View style={styles.buttonContainer}>
                    <Button text="Vote!" onPress={handleContinue} variants={newSelectedWord ? "primary" : "disabled" } />
                </View>
            </SafeAreaView>
        </WithSidebar>
    )
}

const styles = StyleSheet.create({
    tableText: {
        fontSize: 20,
        fontFamily: "Raleway",
        color: colors.black[100],
    },
    playerNameOnTable: {
        fontFamily: "Ralway",
        fontSize: 30,
        fontWeight: "bold",
        color: colors.orange[200]
    },
    table: {
        padding: 20,
        marginHorizontal: 25,
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
    wordContainer: {
        width: 300,
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 10,
        borderColor: colors.orange[200],
        marginTop: 15,
        paddingHorizontal: 10,
        paddingVertical: 9,
        backgroundColor: colors.white[100],
    },
    wordOption: {
        fontFamily: "Ralway",
        fontSize: 20,
        color: colors.black[200]
    },
    buttonContainer: {
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        justifyContent: 'center', 
        alignItems: 'center',
    },
})