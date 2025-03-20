import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import PlayerInput from "@/components/playerInput";

export default function CreateGame() {
    const [names, setNames] = useState(['Breno', 'Paola']);
    
 
    return(
        <SafeAreaView style={styles.container}>
            <PlayerInput />
            {/* <FlatList
                data={names}
                renderItem={({item}) => <Text>{item}</Text>}
            /> */}
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
    }
})