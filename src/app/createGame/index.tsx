import { Text, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router";

export default function CreateGame() {
    return(
        <View>
            <Text>Novo jogo sendo criado</Text>
            <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={32} />
            </TouchableOpacity>
        </View>
    )
}