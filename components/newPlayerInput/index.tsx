import { Dispatch, SetStateAction, useState } from "react";
import { TouchableOpacity, View, TextInput, Text, StyleSheet } from "react-native";
import uuid from 'react-native-uuid';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { colors } from "@/styles/colors";
import { Player } from "@/types/Player";


interface NewPlayerInputProps {
    setPlayer: ({id, name}: Player) => void
    disabled: boolean
    currentPlayerGender: string
    changePlayerGender: Dispatch<SetStateAction<string>>
}

export default function NewPlayerInput({setPlayer, disabled, currentPlayerGender, changePlayerGender}: NewPlayerInputProps) {
    const [newName, setNewName] = useState('');
    const [inputError, setInputError] = useState(false);

    const handleSubmit = () => {
        if(newName.length < 1) {
            setInputError(true);
            return
        }
        setInputError(false);
        const id = uuid.v4();
        setPlayer({id, name: newName});
        setNewName('');
    }

    const handleOnFocus = () => {
        setInputError(false);
    }

    const handleChangeGender = () => {
        if(currentPlayerGender === 'man') { changePlayerGender('woman') }
        else {changePlayerGender('man') }
    }

    const borderColor = disabled ? colors.gray[100] : inputError ? colors.red[100] : colors.orange[200]

    const playerGenderIcon = currentPlayerGender === 'man' ? "man-2" : "woman"

    return(
        <>
            <View style={[styles.container, {borderColor}]}>
                <TouchableOpacity onPress={handleChangeGender}>
                    <MaterialIcons name={playerGenderIcon} size={26} color={colors.orange[200]} />
                </TouchableOpacity>
                <TextInput
                    placeholder="Add a new name"
                    placeholderTextColor={colors.orange[200]}
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

const styles = StyleSheet.create({
    container: {
        width: 300,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: colors.background[100]
    },
    textInput: {
        width: 200,
        paddingVertical: 20,
        marginLeft: 20,
        fontSize: 15,
        color: colors.white[100]
    },
    iconContainer: {
        position: "absolute",
        right: 10,
    },
    error: {
        color: colors.red[100],
        marginTop: 10,
    }
})