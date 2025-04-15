import Button from "@/components/button";
import Elipse from "@/components/elipse";
import { GameContext } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import { router } from "expo-router";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Discussion() {
    const { game } = useContext(GameContext)

    const rounds = game.rounds

    const agregateByPlayer = () => {
        let agregatedArray = [game.rounds[0]]

        for(let i=1; i < rounds.length ; i++) {
            let hasPlayer = false
            let playerPosition = 0
            const player = rounds[i].playerThatAnswers

            agregatedArray.forEach((r, idx) => {
                if(r.playerThatAnswers.id === player.id) {
                    hasPlayer = true
                    playerPosition = idx 
                }
            })
            if(hasPlayer) {
                agregatedArray = agregatedArray
                                    .slice(0, playerPosition)
                                    .concat([rounds[i]])
                                    .concat(agregatedArray.slice(playerPosition, agregatedArray.length))
            } else {
                agregatedArray = [...agregatedArray, rounds[i]]
            }
        }

        return agregatedArray
    }

    const handleNextPage = () => {
        router.navigate('/votes')
    }

    const agregatedArray = agregateByPlayer()

    return(
        <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
            <Elipse left={10} />
            <Text style={styles.title}>Discussion time!</Text>
            <View style={styles.table}>
                {
                    agregatedArray.map(round => {
                        return(
                            <View key={round.question}>
                                <Text style={styles.playerName}>{round.playerThatAnswers.name}</Text>
                                <Text style={styles.question}>{round.question}</Text>
                            </View>
                        )
                    })
                }
            </View>
            <View style={styles.buttonContainer}>
                <Button text="Continue" onPress={handleNextPage} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 35,
        fontFamily: "Raleway",
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 50,
        marginBottom: 40
    },
    table: {
        gap: 10,
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
    playerName: {
        fontSize: 17,
        fontFamily: "Sigmar",
        color: colors.orange[200],
    },
    question: {
        fontSize: 15,
        fontFamily: "Raleway"
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