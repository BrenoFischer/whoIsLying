import { Image, StyleSheet } from "react-native"

export default function Character({mood}: {mood: string}) {
    const characterImages = {
        paola: require('@/assets/images/paola.png'),
        breno: require('@/assets/images/breno.png'),
        umpa: require('@/assets/images/umpa.png'),
        bothCharacter: require('@/assets/images/bothCharacter.png'),
        risada: require('@/assets/images/risada.png'),
        sara: require('@/assets/images/sara.png')
    }

    return(
        <Image source={characterImages[mood as keyof typeof characterImages]} style={styles.image} resizeMode="cover"/>
    )
}

const styles = StyleSheet.create({
    image: {
        height: 200,
        width: 200
    }
})