import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useState } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import PlayerInput from "@/components/playerInput";
import { Player } from "@/types/Player";
import NewPlayerInput from "@/components/newPlayerInput";
import CustomText from "@/components/text";
import Button from "@/components/button";
import { router } from "expo-router";
import { GameContext, GameContextProvider } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import Elipse from "@/components/elipse";
import Character from "@/components/character";

const MAX_PLAYERS = 10;

const windowHeight = Dimensions.get("screen").height;

export default function CreateGame() {
    const [players, setPlayers] = useState<Player[]>([]);
    const { createGame, game } = useContext(GameContext)

    const notAvailableToContinue = players.length < 3 || players.length > MAX_PLAYERS

    function setNewPlayer({id, name}: Player) {
        if(players.length >= MAX_PLAYERS) return

        setPlayers([{id, name}, ...players]);
    }

    function editPlayer(player: Player, newName: string) {
        const newPlayers = players.map(p => {
            if(p.id === player.id) {
                return Object.assign({}, p, {id: p.id, name: newName});
            }
            return p;
        })
    }

    function deletePlayer(id: string) {
        const newPlayers = players.filter(p => p.id !== id);

        setPlayers(newPlayers);
    }

    function handleCreateGame() {
        createGame(players);
        router.navigate("/round");
    }
 
    return(
        <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
            <Elipse top={-30} />
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <View>
                            <TouchableOpacity onPress={() => { router.back() }}>
                                <Ionicons name="arrow-back" size={24} color="black" />
                            </TouchableOpacity>
                            <View style={{alignItems: "center", flexDirection: "row", marginVertical: 12}}>
                                <Text style={styles.headerCategoryTitle}>Category</Text>
                                <View style={{ backgroundColor: colors.white[100], width: 8, height: 8, borderRadius: "50%", marginHorizontal: 8 }} />
                                <Text style={styles.headerCategoryTitle}>{game.word}</Text>
                            </View>
                            <Text style={styles.title}>Add players</Text>
                            <Text style={styles.title}>(3 to 10)</Text>
                        </View>
                        <Character mood={notAvailableToContinue ? "normal" : "happy"} />
                    </View>
                    <View style={{alignItems: "center"}}>
                        {
                            players.length >= MAX_PLAYERS ?
                            <NewPlayerInput disabled={true} setPlayer={() => {}} />
                            :
                            <NewPlayerInput disabled={false} setPlayer={setNewPlayer} />
                        }
                        <View style={styles.playersAddedContainer}>
                            <CustomText>Players added - {players.length}</CustomText>
                        </View>
                        {
                            players.map((player) => 
                                <PlayerInput key={player.id} player={player} editPlayer={editPlayer} deletePlayer={deletePlayer} />
                            )
                        }
                    </View>
                    <View style={styles.buttonContainer}>
                        {
                            notAvailableToContinue ?
                                <Button text="Create game" onPress={handleCreateGame} variants="disabled" />
                            :
                                <Button text="Create game" onPress={handleCreateGame} />
                        }
                    </View>
                    </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
    },

    headerContainer: {
        marginLeft: 30,
        marginTop: 20,
        flexDirection: "row"
    },

    headerCategoryTitle: {
        textTransform: "capitalize",
        fontSize: 16,
        fontFamily: "Raleway",
    },

    title: {
        fontFamily: "Ralway",
        fontSize: 30,
        fontWeight: "bold",
    },

    playersAddedContainer: {
        marginTop: 90,
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 50,
    },
})