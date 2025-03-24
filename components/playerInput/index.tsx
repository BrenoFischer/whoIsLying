import { useState } from "react";
import { TouchableOpacity, View, TextInput, Text } from "react-native";
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { styles } from "./styles";
import { colors } from "@/styles/colors";
import { Player } from "@/types/Player";
import ColorPicker from "../colorPicker";


interface PlayerInputProps {
    player: Player
    editPlayer: (player: Player, newName: string, newColor: string) => void
    deletePlayer: (id: string) => void
}

export default function PlayerInput({editPlayer, player, deletePlayer}: PlayerInputProps) {
    const colorsAvailable = [colors.black[100], colors.purple[100], colors.primary[300]];
    const randomColorNumber = Math.floor(Math.random() * colorsAvailable.length)

    const [newName, setNewName] = useState(player.name);
    const [currentColorIndex, setCurrentColorIndex] = useState(randomColorNumber);

    const [currentColor, setCurrentColor] = useState(player.color);


    const handleChangeColor = () => {
        const newIndex = currentColorIndex >= colorsAvailable.length - 1 ? 0 : currentColorIndex + 1
        setCurrentColorIndex(newIndex)
        setCurrentColor(colorsAvailable[newIndex])
    }

    const handleSubmit = () => {
        editPlayer(player, newName, currentColor);
    }

    const handleDeletePlayer = () => {
        deletePlayer(player.id)
    }

    return(
        <View style={[styles.container, {borderColor: currentColor}]}>
            <TouchableOpacity onPress={handleChangeColor}>
                <ColorPicker color={currentColor} />
            </TouchableOpacity>
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