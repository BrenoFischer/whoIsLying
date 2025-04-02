import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useState } from "react";
import PlayerInput from "@/components/playerInput";
import { Player } from "@/types/Player";
import NewPlayerInput from "@/components/newPlayerInput";
import CustomText from "@/components/text";
import Button from "@/components/button";
import { router } from "expo-router";
import { GameContext, GameContextProvider } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import Elipse from "@/components/elipse";

const MAX_PLAYERS = 10;

const windowHeight = Dimensions.get("screen").height;

export default function CreateGame() {
    const [players, setPlayers] = useState<Player[]>([]);
    const { createGame } = useContext(GameContext)

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
            <Elipse left={0} bottom={500} />
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.title}>Add all players of the round (3 to 10)</Text>
                    <View style={{alignItems: "center"}}>
                        <Image source={require('@/assets/images/character.png')} style={styles.image} resizeMode="cover"/>
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
                    </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
    },

    title: {
        fontFamily: "Ralway",
        fontSize: 28,
        fontWeight: "bold",
        width: 250,
        marginBottom: 40,
        marginLeft: 30,
        marginTop: 20,
    },

    image: {
        height: 200,
        width: 200
    },

    playersAddedContainer: {
        marginTop: 30,
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 50
    },
})