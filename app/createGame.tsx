import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useState } from "react";
import PlayerInput from "@/components/playerInput";
import { Player } from "@/types/Player";
import NewPlayerInput from "@/components/newPlayerInput";
import CustomText from "@/components/text";
import Button from "@/components/button";
import { router } from "expo-router";
import { GameContext, GameContextProvider } from "@/context/GameContext";

const MAX_PLAYERS = 10;

const windowHeight = Dimensions.get("screen").height;

export default function CreateGame() {
    const [players, setPlayers] = useState<Player[]>([]);
    const { createGame } = useContext(GameContext)

    function setNewPlayer({id, name, color}: Player) {
        if(players.length >= MAX_PLAYERS) return

        setPlayers([{id, name, color}, ...players]);
    }

    function editPlayer(player: Player, newName: string, newColor: string) {
        const newPlayers = players.map(p => {
            if(p.id === player.id) {
                return Object.assign({}, p, {id: p.id, name: newName, color: newColor});
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
        <SafeAreaView>
            <ScrollView>
                <View style={styles.container}>
                    <CustomText variant="title">Add all players of the round (3 to 10)</CustomText>
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
                        players.length < 3 || players.length > MAX_PLAYERS ?
                            <Button text="Create game" onPress={handleCreateGame} variants="disabled" />
                        :
                            <Button text="Create game" onPress={handleCreateGame} />
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        marginTop: 30,
        minHeight: windowHeight - 300,
    },

    playersAddedContainer: {
        marginTop: 30,
    },
    buttonContainer: {
        flex: 1,
        alignItems: "center",
    },
})