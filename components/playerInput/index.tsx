import { useState } from "react";
import { TouchableOpacity, View, TextInput, StyleSheet } from "react-native";
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { colors } from "@/styles/colors";
import { Player } from "@/types/Player";


interface PlayerInputProps {
    player: Player
    editPlayer: (player: Player, newName: string) => void
    deletePlayer: (id: string) => void
}

export default function PlayerInput({editPlayer, player, deletePlayer}: PlayerInputProps) {
    const [newName, setNewName] = useState(player.name);

    const handleSubmit = () => {
        editPlayer(player, newName);
    }

    const handleDeletePlayer = () => {
        deletePlayer(player.id)
    }

    return(
        <View style={[styles.container, {borderColor: colors.orange[200]}]}>
            <TextInput
                placeholder="Add a new name"
                keyboardType="ascii-capable"
                inputMode="text"
                maxLength={15}
                style={styles.textInput}
                value={newName}
                onChangeText={text => setNewName(text)}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
            />
            <TouchableOpacity style={[styles.iconContainer]} onPress={handleDeletePlayer}>
                <EvilIcons name="trash" size={40} color="red" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 300,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 200,
        marginTop: 10,
        paddingHorizontal: 10
    },
    textInput: {
        width: 200,
        paddingVertical: 20,
        marginLeft: 20,
        fontSize: 15,
        color: colors.white[100],
    },
    iconContainer: {
        position: "absolute",
        right: 10,
    },
    errorContainer: {
        backgroundColor: "red",
    }
})