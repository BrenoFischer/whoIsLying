import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TextInput } from 'react-native-paper';
import { styles } from "./styles";
import { colors } from "@/styles/colors";

import Ionicons from '@expo/vector-icons/Ionicons';

interface ColorPickerProps {
    color: string,
}

function ColorPicker({color}: ColorPickerProps) {
    return(
        <View 
            style={{
                backgroundColor: color,
                width: 80,
                height: "100%",
                borderRightWidth: 3,
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Ionicons name="brush-sharp" size={20} color="black" />
        </View>
    )
}

export default function PlayerInput() {
    const colorsAvailable = [colors.pink[100], colors.purple[100], colors.primary[300]];
    const randomNumber = Math.floor(Math.random() * colorsAvailable.length)
    const [newName, setNewName] = useState('');
    const [currentColorIndex, setCurrentColorIndex] = useState(randomNumber);
    const [currentColor, setCurrentColor] = useState(colorsAvailable[currentColorIndex]);

    const handleChangeColor = () => {
        const newIndex = currentColorIndex >= colorsAvailable.length - 1 ? 0 : currentColorIndex + 1
        setCurrentColorIndex(newIndex)
        setCurrentColor(colorsAvailable[newIndex])
    }


    return(
        <View style={styles.container}>
            <TouchableOpacity onPress={handleChangeColor}>
                <ColorPicker color={currentColor} />
            </TouchableOpacity>
            <TextInput
                label="Add a new player"
                value={newName}
                onChangeText={text => setNewName(text)}
                contentStyle={{ width: 500, backgroundColor: currentColor }}
            />
        </View>
    )
}