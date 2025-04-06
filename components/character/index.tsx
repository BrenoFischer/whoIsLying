import { Image, StyleSheet } from "react-native"

export default function Character({mood}: {mood: string}) {
    const characterImages = {
        manNormal: require('@/assets/images/character.png'),
        manHappy: require('@/assets/images/characterHappy.png'),
        paolaAngry: require('@/assets/images/paolaAngry.png'),
        brenoHappy: require('@/assets/images/brenoHappy.png'),
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