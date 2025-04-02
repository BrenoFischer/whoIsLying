import { colors } from "@/styles/colors";
import { StyleSheet, Text } from "react-native";

export default function Logo() {
    return(
        <>
            <Text style={styles.logo}>Who is</Text>
            <Text style={styles.logo}>lying?</Text>
        </>
        
    )
}

const styles = StyleSheet.create({
    logo: {
        fontFamily: "Sigmar",
        fontSize: 38,
        color: colors.white[100],
        textAlign: "center",
        lineHeight: 50,
    },
})