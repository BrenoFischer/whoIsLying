import { Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import { router } from "expo-router";


interface ButtonProps {
    text: string
}

export default function Button({ text }: ButtonProps) {
    return(
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.navigate("/createGame")}>
            <Text style={styles.primaryButtonText}>{text}</Text>
        </TouchableOpacity>
    )
}