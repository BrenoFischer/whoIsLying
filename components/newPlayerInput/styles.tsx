import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
    },
    iconContainer: {
        position: "absolute",
        right: 10,
    }
})