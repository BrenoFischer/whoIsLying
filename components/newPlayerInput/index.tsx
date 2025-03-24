import { useState } from "react";
import { TouchableOpacity, View, TextInput, Text } from "react-native";
import uuid from 'react-native-uuid';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from "./styles";
import { colors } from "@/styles/colors";
import { Player } from "@/types/Player";
import ColorPicker from "../colorPicker";


interface NewPlayerInputProps {
    setPlayer: ({id, name, color}: Player) => void
    disabled: boolean
}

export default function NewPlayerInput({setPlayer, disabled}: NewPlayerInputProps) {
    const colorsAvailable = [colors.black[100], colors.purple[100], colors.primary[300]];
    const randomColorNumber = Math.floor(Math.random() * colorsAvailable.length)

    const [newName, setNewName] = useState('');
    const [currentColorIndex, setCurrentColorIndex] = useState(randomColorNumber);
    const [currentColor, setCurrentColor] = useState(colorsAvailable[currentColorIndex]);
    const [inputError, setInputError] = useState(false);


    const handleChangeColor = () => {
        const newIndex = currentColorIndex >= colorsAvailable.length - 1 ? 0 : currentColorIndex + 1
        setCurrentColorIndex(newIndex)
        setCurrentColor(colorsAvailable[newIndex])
    }


    const handleSubmit = () => {
        if(newName.length < 1) {
            setInputError(true);
            return
        }
        setInputError(false);
        const id = uuid.v4();
        setPlayer({id, name: newName, color: currentColor});
        setNewName('');
    }

    const handleOnFocus = () => {
        setInputError(false);
    }

    const borderColor = disabled ? colors.gray[100] : inputError ? colors.red[100] : currentColor

    return(
        <>
            <View style={[styles.container, {borderColor}]}>
                {
                    disabled ?
                        <ColorPicker color={colors.gray[100]} />
                    :
                        <TouchableOpacity onPress={handleChangeColor}>
                            <ColorPicker color={currentColor} />
                        </TouchableOpacity>
                }
                <TextInput
                    placeholder="Add a new name"
                    keyboardType="ascii-capable"
                    inputMode="text"
                    maxLength={15}
                    style={styles.textInput}
                    value={newName}
                    onChangeText={text => setNewName(text)}
                    onSubmitEditing={handleSubmit}
                    onFocus={handleOnFocus}
                    returnKeyType="done"
                    editable={!disabled}
                />
                <TouchableOpacity style={styles.iconContainer} onPress={handleSubmit}>
                    <Ionicons name="add-circle" size={38} color={borderColor} />
                </TouchableOpacity>
            </View>
            {
                inputError &&
                <Text style={ styles.error }>A name should contains at least 1 character.</Text>
            }
        </>
    )
}