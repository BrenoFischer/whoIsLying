import { GameContext } from '@/context/GameContext';
import { useContext, useState, useEffect, useRef } from 'react';
import {
  Text,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
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
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import FlipCard, { FlipCardRef } from '@/components/flipCard';
import ConfigMenu from '@/components/configMenu';

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
  const { setGameWord, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/selectCategory');
  }, []);
  const { height } = useWindowDimensions();

  const categoriesArray = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(categoriesArray[0] || '');
  const cardRefs = useRef<(FlipCardRef | null)[]>([]);

  const characterSize = height * 0.22;

  const handleContinueWithSelectedCategory = () => {
    setGameWord(selectedCategory);
    router.push('/createGame');
  };

  const handleCarouselIndexChange = (index: number) => {
    cardRefs.current.forEach((ref) => ref?.flipToFront());

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

    const front = (
      <View style={styles.categoryCardInner}>
        <View style={styles.cardOverlay} />
        {!isAvailable && <View style={styles.lockedOverlay} />}
        <Text></Text>
        <Image
          source={images[categoryName as keyof typeof images]}
          style={styles.categoryImage}
        />
        {!isAvailable && (
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={moderateScale(40)} color={colors.background[100]} />
          </View>
        )}
        <Text style={styles.categoryTitle}>
          {t(categoryName)}
        </Text>
      </View>
    );

    const back = (
      <View style={styles.categoryCardBack}>
        <Text style={styles.backCategoryTitle}>{t(categoryName)}</Text>
        <Text style={styles.backDescription}>{t(categoryData?.description ?? '')}</Text>
      </View>
    );

    return (
      <FlipCard
        ref={(el) => { cardRefs.current[index] = el; }}
        style={styles.categoryCardContainer}
        front={front}
        back={back}
      />
    );
  };

  return (
    <ScreenLayout
      footer={
        <Button
          text={t('Select category')}
          variants={selectedCategory ? 'primary' : 'disabled'}
          onPress={handleContinueWithSelectedCategory}
        />
      }
    >
      <Elipse top={scale(-180)} />

      <View style={styles.contentWrapper}>
        <View style={styles.menuButtonsRow}>
          <ConfigMenu />
          <SidebarMenu />
        </View>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>{t('Categories')}</Text>
            <Text style={styles.subtitle}>
              {t('Questions will be based on the selected category')}
            </Text>
          </View>

          <Character mood={'bothCharacter'} size={characterSize} />
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
  </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    paddingTop: verticalScale(spacing.xs),
  },
  menuButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(spacing.md),
    gap: scale(spacing.xs),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(spacing.md)
  },
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Ralway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Raleway-Medium',
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  categoryCardContainer: {
    width: '100%',
    minHeight: verticalScale(180),
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
    paddingVertical: verticalScale(spacing.sm),
    backgroundColor: colors.white[100],
    borderRadius: moderateScale(radius.lg),
  },
  categoryCardBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.md),
    paddingHorizontal: scale(spacing.md),
    backgroundColor: colors.white[100],
    borderRadius: moderateScale(radius.lg),
    gap: verticalScale(spacing.sm),
  },
  categoryCardBackgroundImage: {
    borderRadius: moderateScale(13),
    backgroundColor: colors.white[100]
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
  categoryTitle: {
    fontFamily: 'Ralway',
    textTransform: 'capitalize',
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.background[100],
    zIndex: 2,
    fontWeight: 'bold',
  },
  backCategoryTitle: {
    fontFamily: 'Ralway',
    textTransform: 'capitalize',
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.background[100],
    fontWeight: 'bold',
  },
  backDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    color: colors.gray[300],
    lineHeight: moderateScale(18),
  },
  categoryImage: {
    height: scale(90),
    width: scale(90),
  },
});
