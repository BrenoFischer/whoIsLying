import { colors } from "@/styles/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: colors.purple[300],
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 35,
        marginTop: 50,
      },
      primaryButtonText: {
        color: colors.white[100],
        fontSize: 20,
    },
})