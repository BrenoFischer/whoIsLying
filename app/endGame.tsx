import { colors } from "@/styles/colors";
import { SafeAreaView, Text } from "react-native";


export default function EndGame() {
    return(
        <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
            <Text>End game</Text>
        </SafeAreaView>
    )
}