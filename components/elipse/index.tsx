import { colors } from "@/styles/colors"
import { StyleSheet, View } from "react-native"

export default function Elipse({left=-120, bottom=150}: {left?: number, bottom?: number}) {
    return(
        <View style={[styles.elipse, {bottom, left}]} />
    )
}

const styles = StyleSheet.create({
    elipse: {
        backgroundColor: colors.orange[200],
        width: 344,
        height: 377,
        position: "absolute",
        transform: [{rotate: "60deg"}],
        borderRadius: "50%"
    },
})