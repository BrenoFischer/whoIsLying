import { GameContext } from "@/context/GameContext";
import { useContext, useState } from "react";
import { Text, SafeAreaView, StyleSheet, View, Image, TouchableHighlight, TouchableOpacity, ScrollView } from "react-native";

import categories from "@/data/categories.json";
import { colors } from "@/styles/colors";
import Button from "@/components/button";
import { router } from "expo-router";

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
        <SafeAreaView style={{backgroundColor: "#393939", height: "100%"}}>
            <View style={styles.elipse} />
            <ScrollView style={styles.container}>
                <Text style={styles.pageTitle}>Select a category</Text>
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
    elipse: {
        backgroundColor: colors.orange[200],
        width: 344,
        height: 377,
        position: "absolute",
        bottom: 150,
        left: -120,
        transform: [{rotate: "60deg"}],
        borderRadius: "50%"
    },
    pageTitle: {
        fontSize: 30,
        fontFamily: 'Raleway', 
        fontWeight: "bold", 
        color: colors.white[100], 
        textAlign: "center"
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
        textTransform: "uppercase",
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