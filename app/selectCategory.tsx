import { GameContext } from '@/context/GameContext';
import { useContext, useState } from 'react';
import {
  Text,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import categories from '@/data/categories.json';
import { colors } from '@/styles/colors';
import Button from '@/components/button';
import { router } from 'expo-router';
import Elipse from '@/components/elipse';
import Ionicons from '@expo/vector-icons/Ionicons';
import Character from '@/components/character';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';

const images = {
  foods: require('@/assets/images/foodCategory.png'),
  animals: require('@/assets/images/animalCategory.png'),
};

const cardColors = {
  foods: colors.blue[200],
  animals: colors.orange[100],
};

export default function SelectCategory() {
  const { setGameWord } = useContext(GameContext);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { language, t } = useTranslation();

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleContinueWithSelectedCategory = () => {
    setGameWord(selectedCategory, language);
    router.replace('/createGame');
  };

  function CategoryCard({ categoryName }: { categoryName: string }) {
    const isCategorySelected = selectedCategory === categoryName;

    return (
      <TouchableOpacity
        style={[
          styles.categoryCardContainer,
          {
            backgroundColor:
              cardColors[categoryName as keyof typeof cardColors],
          },
          isCategorySelected && {
            transform: [{ scale: 1.15 }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.8,
            shadowRadius: 5,
            elevation: 6,
          },
        ]}
        activeOpacity={1}
        onPress={() => handleSelectCategory(categoryName)}
      >
        <Text style={styles.categoryTitle}>{t(categoryName)}</Text>
        <Image
          source={images[categoryName as keyof typeof images]}
          style={styles.categoryImage}
        />
      </TouchableOpacity>
    );
  }

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Elipse top={-90} />
        <ScrollView style={styles.container}>
          <View style={styles.headerContainer}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  router.back();
                }}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.pageTitle}>{t('Categories')}</Text>
              <Text style={styles.subtitle}>
                {t('Questions will be based on the selected category')}
              </Text>
            </View>
            <View style={styles.charContainer}>
              <Character mood={'bothCharacter'} size='medium' />
            </View>
          </View>
          <View style={styles.categoriesContainer}>
            {Object.keys(categories).map(category => {
              return <CategoryCard key={category} categoryName={category} />;
            })}
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button
            text={t('Select category')}
            variants={selectedCategory ? 'primary' : 'disabled'}
            onPress={handleContinueWithSelectedCategory}
          />
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    textAlign: 'center',
    maxHeight: '84%',
    position: "relative"
  },
  headerContainer: {
    marginLeft: "6%",
    marginTop: 30,
    marginBottom: 40
  },
  charContainer: {
    position: "absolute",
    right: "1%"
  },
  pageTitle: {
    fontFamily: 'Ralway',
    fontSize: 28,
    fontWeight: 'bold',
    maxWidth: '50%',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
    maxWidth: '50%',
  },
  categoriesContainer: {
    rowGap: 20,
    paddingTop: 50,
    paddingHorizontal: 20,
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    alignContent: 'flex-start',
  },
  categoryCardContainer: {
    width: '25%',
    minWidth: 140,
    maxWidth: 180,
    height: 150,
    paddingVertical: 18,
    backgroundColor: colors.orange[100],
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    borderBottomWidth: 7,
    borderEndWidth: 7,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
    marginBottom: 20,
  },
  categoryTitle: {
    fontFamily: 'Raleway-Medium',
    textTransform: 'capitalize',
    fontSize: 18,
    textAlign: 'center',
  },
  categoryImage: {
    height: 80,
    width: 80,
    resizeMode: 'contain',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
