import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function CreateGame() {
    const [names, setNames] = useState(['Breno', 'Paola']);
    const [newName, setNewName] = useState('');
 
    return(
        <SafeAreaView style={styles.container}>
            <FlatList
                data={names}
                renderItem={({item}) => <Text>{item}</Text>}
            />
            <TextInput placeholder="Add a new player." value={newName} onChangeText={setNewName} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    }
})