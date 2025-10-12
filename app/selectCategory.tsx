import { GameContext } from '@/context/GameContext';
import { useContext, useState, useEffect } from 'react';
import {
  Text,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import categories from '@/data/categories.json';
import { colors } from '@/styles/colors';
import Button from '@/components/button';
import { router } from 'expo-router';
import Elipse from '@/components/elipse';
import Ionicons from '@expo/vector-icons/Ionicons';
import Character from '@/components/character';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';
import Carousel from '@/components/carousel';

const images = {
  foods: require('@/assets/images/foodCategory.png'),
  animals: require('@/assets/images/animalCategory.png'),
  halloween: require('@/assets/images/halloweenCategory.png'),
};

const backgroundImages = {
  foods: require('@/assets/images/foodCategoryBg.png'),
  animals: require('@/assets/images/animalCategoryBg.png'),
  halloween: require('@/assets/images/halloweenCategoryBg.png'),
};

export default function SelectCategory() {
  const { setGameWord } = useContext(GameContext);
  const { language, t } = useTranslation();

  const categoriesArray = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(categoriesArray[0] || '');

  const handleContinueWithSelectedCategory = () => {
    setGameWord(selectedCategory, language);
    router.push('/createGame');
  };

  const handleCarouselIndexChange = (index: number) => {
    const categoryName = categoriesArray[index];
    const categoryData = categories[categoryName as keyof typeof categories];
    if (categoryData?.available) {
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory('');
    }
  };

  const renderCategoryCard = (categoryName: string, index: number, isActive: boolean) => {
    const categoryData = categories[categoryName as keyof typeof categories];
    const isAvailable = categoryData?.available ?? true;

    return (
      <View style={[
        styles.categoryCardContainer,
        isActive && styles.categoryCardActive
      ]}>
        <ImageBackground
          source={backgroundImages[categoryName as keyof typeof backgroundImages]}
          style={styles.categoryCardInner}
          imageStyle={styles.categoryCardBackgroundImage}
          resizeMode="cover"
        >
          <View style={styles.cardOverlay} />
          {!isAvailable && <View style={styles.lockedOverlay} />}
          <Text></Text>
          <Image
            source={images[categoryName as keyof typeof images]}
            style={[
              styles.categoryImage,
              isActive && styles.categoryImageActive,
            ]}
          />
          {!isAvailable && (
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={moderateScale(40)} color={colors.background[100]} />
            </View>
          )}
          <Text style={[
            styles.categoryTitle,
            isActive && styles.categoryTitleActive,
          ]}>
            {t(categoryName)}
          </Text>
        </ImageBackground>
      </View>
    );
  };

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Elipse top={scale(-180)} />
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.pageTitle}>{t('Categories')}</Text>
              <Text style={styles.subtitle}>
                {t('Questions will be based on the selected category')}
              </Text>
            </View>
            <View style={styles.charContainer}>
              <Character mood={'bothCharacter'} size='medium' />
            </View>
          </View>
          <View style={styles.carouselWrapper}>
            <Carousel
              data={categoriesArray}
              renderItem={renderCategoryCard}
              onIndexChange={handleCarouselIndexChange}
              itemWidth={scale(200)}
              spacing={scale(20)}
            />
          </View>
        </View>
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
    paddingVertical: verticalScale(30),
    flex: 1,
    position: "relative"
  },
  headerContainer: {
    marginLeft: scale(20),
    marginTop: verticalScale(30),
    marginBottom: verticalScale(40)
  },
  charContainer: {
    position: "absolute",
    right: scale(5)
  },
  pageTitle: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    maxWidth: '50%',
    marginVertical: verticalScale(10),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
    maxWidth: '50%',
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(50),
  },
  categoryCardContainer: {
    width: '100%',
    minHeight: verticalScale(180),
    maxHeight: verticalScale(220),
    backgroundColor: colors.orange[200],
    borderRadius: moderateScale(20),
    borderBottomWidth: scale(7),
    borderEndWidth: scale(7),
    borderTopWidth: scale(4),
    borderLeftWidth: scale(4),
    borderColor: colors.orange[200],
    overflow: 'hidden',
  },
  categoryCardInner: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    backgroundColor: colors.white[100],
    borderRadius: moderateScale(13),
  },
  categoryCardBackgroundImage: {
    borderRadius: moderateScale(13),
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: moderateScale(13),
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: moderateScale(13),
    zIndex: 1,
  },
  lockIconContainer: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    zIndex: 5,
  },
  categoryCardActive: {
    height: verticalScale(240),
    opacity: 1,
    transform: [{ scale: 1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  categoryTitle: {
    fontFamily: 'Ralway',
    textTransform: 'capitalize',
    fontSize: moderateScale(18),
    textAlign: 'center',
    color: colors.background[100],
    zIndex: 2,
  },
  categoryTitleActive: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
  },
  categoryImage: {
    height: scale(90),
    width: scale(90),
    resizeMode: 'contain',
    zIndex: 0,
  },
  categoryImageActive: {
    height: scale(120),
    width: scale(120),
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
});
