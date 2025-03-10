import { colors } from "@/styles/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: colors.purple[300],
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginTop: 50,
      },
      primaryButtonText: {
        color: colors.white[100],
        fontSize: 16,
        fontWeight: 'bold',
    },
})