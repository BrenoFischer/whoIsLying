import { colors } from "@/styles/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    buttonStyle: {
      paddingVertical: 20,
      paddingHorizontal: 40,
      borderRadius: 35,
      marginTop: 50,
      
    },
    primaryButton: {
        backgroundColor: colors.purple[300],
      },
    primaryButtonText: {
      fontSize: 20,
      color: colors.white[100],
    },
    disabledButton: {
      backgroundColor: colors.gray[200],
    },
    disabledButtonText: {
      color: colors.gray[300],
      fontSize: 20,
    },
})