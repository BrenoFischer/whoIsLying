import { GameContext } from '@/context/GameContext';
import { useContext, useState, useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import categories from '@/data/categories.json';
import { colors } from '@/styles/colors';
import Button from '@/components/button';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Character from '@/components/character';
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
  movies: require('@/assets/images/moviesCategory.png'),
  sports: require('@/assets/images/sportsCategory.png'),
  music: require('@/assets/images/musicCategory.png'),
};

const CATEGORY_COLORS: Record<string, string> = {
  foods: '#92400E',
  animals: '#14532D',
  halloween: '#3B0764',
  movies: '#172554',
  sports: '#1E3A8A',
  music: '#831843',
  geography: '#7C2D12',
  professions: '#1F2937',
};

export default function SelectCategory() {
  const { setGameWord, setCurrentScreen, game } = useContext(GameContext);
  const { t } = useTranslation();
  const { openConfig } = useLocalSearchParams<{ openConfig?: string }>();

  useEffect(() => {
    setCurrentScreen('/selectCategory');
  }, []);
  const { height } = useWindowDimensions();

  const categoriesArray = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(
    categoriesArray[0] || ''
  );
  const cardRefs = useRef<(FlipCardRef | null)[]>([]);

  const characterSize = height * 0.18;

  const handleContinueWithSelectedCategory = () => {
    setGameWord(selectedCategory);
    router.push('/createGame');
  };

  const handleCarouselIndexChange = (index: number) => {
    cardRefs.current.forEach(ref => ref?.flipToFront());

    const categoryName = categoriesArray[index];
    const categoryData = categories[categoryName as keyof typeof categories];
    if (categoryData?.available) {
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory('');
    }
  };

  const renderCategoryCard = (
    categoryName: string,
    index: number,
    isActive: boolean
  ) => {
    const categoryData = categories[categoryName as keyof typeof categories];
    const isAvailable = categoryData?.available ?? true;
    const categoryColor = CATEGORY_COLORS[categoryName] ?? '#1F2937';
    const content = ((categoryData as any)?.content as string[]) ?? [];
    const sampleWords = content.length >= 3
      ? [content[Math.floor(content.length * 0.15)], content[Math.floor(content.length * 0.5)], content[Math.floor(content.length * 0.85)]]
      : content.slice(0, 3);

    const front = (
      <View style={[styles.categoryCardInner, { backgroundColor: categoryColor }]}>
        {!isAvailable && <View style={styles.lockedOverlay} />}
        {!isAvailable && (
          <View style={styles.lockIconContainer}>
            <Ionicons
              name="lock-closed"
              size={moderateScale(40)}
              color="rgba(255,255,255,0.9)"
            />
          </View>
        )}
        <Image
          source={images[categoryName as keyof typeof images]}
          style={styles.categoryImage}
          resizeMode="contain"
        />
        <Text style={styles.categoryTitle}>{t(categoryName)}</Text>
      </View>
    );

    const back = (
      <View style={styles.categoryCardBack}>
        <Text style={styles.backCategoryTitle}>{t(categoryName)}</Text>
        <Text style={styles.backDescription}>
          {t(categoryData?.description ?? '')}
        </Text>
        {sampleWords.length > 0 && (
          <View style={styles.sampleWordsContainer}>
            <Text style={styles.sampleWordsLabel}>{t('Examples')}</Text>
            <View style={styles.sampleWordsRow}>
              {sampleWords.map((word, i) => (
                <View key={i} style={styles.sampleWordPill}>
                  <Text style={styles.sampleWordPillText}>{t(word, { ns: 'categories' })}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );

    return (
      <FlipCard
        ref={el => {
          cardRefs.current[index] = el;
        }}
        style={[
          styles.categoryCardContainer,
          isActive && styles.categoryCardContainerActive,
          { shadowColor: categoryColor, minHeight: Math.min(verticalScale(240), height * 0.38) },
        ]}
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
      header={
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.replace('/selectGameMode')}>
                <Ionicons name="arrow-back" size={24} color={colors.orange[200]} />
              </TouchableOpacity>
              {game.gameMode && (
                <Text style={styles.headerCategoryTitle} numberOfLines={1}>
                  {t(game.gameMode.charAt(0).toUpperCase() + game.gameMode.slice(1))} {t('Mode')}
                </Text>
              )}
            </View>
            <SidebarMenu />
          </View>
          <View style={styles.headerConfigRow}>
            <ConfigMenu initialOpen={openConfig === 'true'} variant="accent" />
          </View>
        </View>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.titleRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle} numberOfLines={1} adjustsFontSizeToFit>{t('Categories')}</Text>
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
            itemWidth={scale(265)}
            spacing={scale(16)}
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
    paddingTop: verticalScale(spacing.xs),
  },
  headerContainer: {
    paddingTop: verticalScale(spacing.xs),
    paddingBottom: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    overflow: 'hidden',
  },
  headerConfigRow: {
    alignItems: 'flex-end',
    marginTop: verticalScale(4),
  },
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    color: colors.orange[200],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.md),
  },
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Raleway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Raleway-Medium',
    color: colors.gray[200],
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  categoryCardContainer: {
    width: '100%',
    maxHeight: verticalScale(300),
    borderRadius: moderateScale(radius.lg),
  },
  categoryCardContainerActive: {},
  categoryCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(spacing.sm),
    paddingHorizontal: scale(spacing.sm),
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',
  },
  categoryImage: {
    flex: 1,
    width: '100%',
  },
  categoryCardBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.md),
    paddingHorizontal: scale(spacing.md),
    backgroundColor: colors.white[100],
    gap: verticalScale(spacing.sm),
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  lockIconContainer: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    zIndex: 5,
  },
  categoryTitle: {
    fontFamily: 'Raleway',
    textTransform: 'capitalize',
    fontSize: fontSize.lg,
    textAlign: 'center',
    color: colors.white[100],
    fontWeight: 'bold',
    paddingBottom: verticalScale(spacing.xs),
  },
  backCategoryTitle: {
    fontFamily: 'Raleway',
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
  sampleWordsContainer: {
    alignItems: 'center',
    gap: verticalScale(4),
  },
  sampleWordsLabel: {
    fontFamily: 'Raleway-Medium',
    fontSize: moderateScale(9),
    color: colors.gray[300],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sampleWordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: scale(4),
  },
  sampleWordPill: {
    backgroundColor: colors.black[100],
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
  },
  sampleWordPillText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(10),
    color: colors.white[100],
    fontWeight: '600',
  },
});
