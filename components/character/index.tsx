import { Image, StyleSheet } from "react-native"

export default function Character({mood}: {mood: string}) {
    const characterImages = {
        normal: require('@/assets/images/character.png'),
        happy: require('@/assets/images/characterHappy.png')
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