import { GameContext } from "@/context/GameContext";
import { useContext, useState } from "react";
import { Text, SafeAreaView, StyleSheet, View, Image, TouchableHighlight, TouchableOpacity, ScrollView } from "react-native";

import categories from "@/data/categories.json";
import { colors } from "@/styles/colors";
import Button from "@/components/button";
import { router } from "expo-router";
import Elipse from "@/components/elipse";
import Ionicons from "@expo/vector-icons/Ionicons";
import Character from "@/components/character";

const images = {
    foods: require("@/assets/images/foodCategory.png"),
    animals: require("@/assets/images/animalCategory.png"),
    soon: require("@/assets/images/animalCategory.png"),
};

const cardColors = {
    foods: colors.blue[200],
    animals: colors.orange[100],
    soon: colors.gray[300],
}

const characterImages = {
    normal: require('@/assets/images/character.png'),
    happy: require('@/assets/images/characterHappy.png')
}


export default function SelectCategory() {
    const { setGameWord } = useContext(GameContext)
    const [selectedCategory, setSelectedCategory] = useState('')

    const handleSelectCategory = (categoryName: string) => {
        setSelectedCategory(categoryName)
    }

    const handleContinueWithSelectedCategory = () => {
        setGameWord(selectedCategory)
        router.navigate("/createGame")
    }

    function CategoryCard({categoryName}: {categoryName: string}) {
        const isCategorySelected = selectedCategory === categoryName 

        return(
            <TouchableOpacity
                style={[
                    styles.categoryCardContainer,
                    isCategorySelected && {transform: [{scale: 1.15}]}, 
                    {backgroundColor: cardColors[categoryName as keyof typeof cardColors]}
                ]}
                activeOpacity={1}
                onPress={() => handleSelectCategory(categoryName)}
            >
                <Text style={styles.categoryTitle}>
                    {categoryName}        
                </Text>
                <Image source={images[categoryName as keyof typeof images]} style={styles.categoryImage} />
            </TouchableOpacity>
        )
    }

    return(
        <SafeAreaView style={{backgroundColor: colors.background[100], height: "100%", overflow: "hidden"}}>
            <Elipse top={-90} />
            <ScrollView style={styles.container}>
                <View style={styles.headerContainer}>
                    <View>
                        <TouchableOpacity onPress={() => { router.back() }}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.pageTitle}>Categories</Text>
                        <Text style={styles.subtitle}>Questions will be based on the selected category</Text>
                    </View>
                    <Character mood={selectedCategory ? "happy" : "normal"} />
                </View>
                <View style={styles.categoriesContainer}>
                    {
                        Object.keys(categories).map(category => {
                            return(
                                <CategoryCard key={category} categoryName={category} />
                            )
                        })
                    }
                </View>
            </ScrollView>
                <View style={styles.buttonContainer}>
                    <Button text="Select category" variants={selectedCategory ? "primary" : "disabled" } onPress={handleContinueWithSelectedCategory} />
                </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 50,
        textAlign: "center",
        maxHeight: "84%",
    },
    headerContainer: {
        marginLeft: 30,
        flexDirection: "row"
    },
    pageTitle: {
        fontFamily: "Ralway",
        fontSize: 30,
        fontWeight: "bold",
        maxWidth: 200,
        marginVertical: 10,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Raleway",
        maxWidth: 190
    },
    categoriesContainer: {
        rowGap: 40,
        paddingTop: 70,
        paddingHorizontal: 20,
        height: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        alignContent: "flex-start",
    },
    categoryCardContainer: {
        width: 150,
        height: 200,
        paddingVertical: 22,
        backgroundColor: colors.orange[100],
        borderRadius: 16,
        justifyContent: "space-between",
        alignItems: "center",
    },
    categoryTitle: {
        fontFamily: "Raleway",
        textTransform: "capitalize",
        fontSize: 20,
        fontWeight: "600",
    },
    categoryImage: {
        height: 100
    },
    buttonContainer: {
        justifyContent: "center",
        alignItems: "center"
    }
})