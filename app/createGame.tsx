import { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Player } from "@/types/Player";
import NewPlayerInput from "@/components/newPlayerInput";
import CustomText from "@/components/text";
import Button from "@/components/button";
import { GameContext } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import Elipse from "@/components/elipse";
import PlayerInput from "@/components/playerInput";
import Character from "@/components/character";
import WithSidebar from "@/components/withSideBar";

const MAX_PLAYERS = 10;

export default function CreateGame() {
    const maleImages = ['breno', 'umpa', 'risada']
    const femaleImages = ['paola', 'sara']
    const [ playerGender, setPlayerGender ] = useState('man')
    const [ currentImage, setCurrentImage ] = useState(maleImages[0])
    const [ currentImageIndex, setCurrentImageIndex ] = useState(0)
    const { createGame, game } = useContext(GameContext)
    const [ players, setPlayers ] = useState<Player[]>(game.players);

    const imagesArray = playerGender === 'man' ? maleImages : femaleImages

    const notAvailableToContinue = players.length < 3 || players.length > MAX_PLAYERS

    function setNewPlayer({id, name, gender}: Player) {
        if(players.length >= MAX_PLAYERS) return

        setPlayers([{id, name, gender, character: currentImage, score: 0}, ...players]);
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
        router.replace("/selectCategory");
    }

    function handleChangeGender() {
        setCurrentImageIndex(0)
        if(playerGender === 'man') { 
            setPlayerGender('woman')
            setCurrentImage(femaleImages[0]) 
        }
        else { 
            setPlayerGender('man')
            setCurrentImage(maleImages[0])
        }
    }

    function handleChangeImage() {
        const newIndex = imagesArray.length - 1 <= currentImageIndex ? 0 : currentImageIndex + 1

        setCurrentImage(imagesArray[newIndex])
        setCurrentImageIndex(newIndex)
    }
 
    return(
        <WithSidebar>
            <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
                <Elipse top={-30} />
                <ScrollView>
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <View>
                                <View style={{alignItems: "center", flexDirection: "row", marginVertical: 12}}>
                                    <Text style={styles.headerCategoryTitle}>Category</Text>
                                    <View style={{ backgroundColor: colors.white[100], width: 8, height: 8, borderRadius: "50%", marginHorizontal: 8 }} />
                                    <Text style={styles.headerCategoryTitle}>{game.category}</Text>
                                </View>
                                <Text style={styles.title}>Add players</Text>
                                <Text style={styles.title}>(3 to 10)</Text>
                            </View>
                            <View>
                                <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
                                    <TouchableOpacity onPress={handleChangeImage}>
                                        <MaterialCommunityIcons style={{left: 20}} name="image-edit" size={35} color={colors.black[100]} />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 16, color: colors.white[100], fontWeight: "bold" }}>{currentImageIndex + 1} of {imagesArray.length}</Text>
                                </View>
                                <Character mood={currentImage} />
                            </View>
                        </View>
                        <View style={{alignItems: "center"}}>
                            {
                                players.length >= MAX_PLAYERS ?
                                <NewPlayerInput disabled={true} setPlayer={() => {}} currentPlayerGender={playerGender} handleChangeGender={handleChangeGender} />
                                :
                                <NewPlayerInput disabled={false} setPlayer={setNewPlayer} currentPlayerGender={playerGender} handleChangeGender={handleChangeGender} />
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
        </WithSidebar>
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
