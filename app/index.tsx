import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssets } from "expo-asset";
import { colors } from "@/styles/colors";



export default function Index() {
    

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <Image source={require('@/assets/images/test.jpg')} style={styles.image} />
        <View>
          <Text style={styles.title}><Text style={{color: colors.green[300]}}>Who</Text> is lying?</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "fff",
    padding: 60,
  },
  wrapper: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  title: {
    fontFamily: "SigmarRegular",
    fontSize: 36,
    color: colors.gray[900],
  }
})
