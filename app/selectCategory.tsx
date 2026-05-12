import { GameContext } from '@/context/GameContext';
import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import categories from '@/data/categories.json';
import { colors } from '@/styles/colors';
import Button from '@/components/button';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from '@/translations';
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

  const { width } = useWindowDimensions();

  const categoriesArray = Object.keys(categories);

  const sortedCategories = useMemo(() =>
    [...categoriesArray].sort((a, b) => {
      const aAvail = (categories[a as keyof typeof categories] as any)?.available ?? false;
      const bAvail = (categories[b as keyof typeof categories] as any)?.available ?? false;
      if (aAvail === bAvail) return 0;
      return aAvail ? -1 : 1;
    }),
    []
  );

  const [selectedCategory, setSelectedCategory] = useState('');
  const cardRefs = useRef<(FlipCardRef | null)[]>([]);

  const CARD_GAP = scale(spacing.sm);
  const H_PADDING = scale(spacing.md);
  const cardWidth = (width - H_PADDING * 2 - CARD_GAP) / 2;
  const cardHeight = cardWidth * 1.55;

  const handleContinueWithSelectedCategory = () => {
    setGameWord(selectedCategory);
    router.push('/createGame');
  };

  const handleSelectCard = (categoryName: string) => {
    const categoryData = categories[categoryName as keyof typeof categories] as any;
    if (!categoryData?.available) return;

    if (selectedCategory === categoryName) {
      setSelectedCategory('');
    } else {
      if (selectedCategory) {
        const oldIndex = sortedCategories.indexOf(selectedCategory);
        if (oldIndex >= 0) cardRefs.current[oldIndex]?.flipToFront();
      }
      setSelectedCategory(categoryName);
    }
  };

  const renderCategoryCard = (categoryName: string, index: number) => {
    const categoryData = categories[categoryName as keyof typeof categories] as any;
    const isAvailable = categoryData?.available ?? true;
    const categoryColor = CATEGORY_COLORS[categoryName] ?? '#1F2937';
    const content = (categoryData?.content as string[]) ?? [];
    const sampleWords = content.length >= 3
      ? [
          content[Math.floor(content.length * 0.15)],
          content[Math.floor(content.length * 0.5)],
          content[Math.floor(content.length * 0.85)],
        ]
      : content.slice(0, 3);

    const front = (
      <View style={[styles.cardFront, { backgroundColor: categoryColor, opacity: isAvailable ? 1 : 0.82 }]}>
        {!isAvailable && <View style={styles.lockedOverlay} />}
        {!isAvailable && (
          <View style={styles.lockIconCenter}>
            <View style={styles.lockIconBackground}>
              <Ionicons name="lock-closed" size={moderateScale(28)} color={colors.white[100]} />
            </View>
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
      <View style={styles.cardBack}>
        {!isAvailable && (
          <View style={styles.comingSoonBadge}>
            <Ionicons name="lock-closed" size={moderateScale(9)} color={colors.orange[200]} />
            <Text style={styles.comingSoonText}>{t('Buy now!')}</Text>
          </View>
        )}
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
        key={categoryName}
        ref={el => { cardRefs.current[index] = el; }}
        style={{ width: cardWidth, height: cardHeight, borderRadius: moderateScale(radius.lg) }}
        onPress={() => handleSelectCard(categoryName)}
        selected={selectedCategory === categoryName}
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
            <ConfigMenu initialOpen={openConfig === 'true'} />
            <SidebarMenu />
          </View>
        </View>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle} numberOfLines={1} adjustsFontSizeToFit>
            {t('Categories')}
          </Text>
          <Text style={styles.subtitle}>
            {t('Questions will be based on the selected category')}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: Math.ceil(sortedCategories.length / 2) }, (_, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {sortedCategories.slice(rowIdx * 2, rowIdx * 2 + 2).map((name, colIdx) =>
                renderCategoryCard(name, rowIdx * 2 + colIdx)
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    width: '100%',
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
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    color: colors.orange[200],
  },
  titleSection: {
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.xs),
    paddingBottom: verticalScale(spacing.sm),
  },
  pageTitle: {
    fontFamily: 'Raleway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    color: colors.gray[300],
    marginTop: verticalScale(2),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(spacing.md),
    paddingBottom: verticalScale(spacing.lg),
    gap: scale(spacing.sm),
  },
  gridRow: {
    flexDirection: 'row',
    gap: scale(spacing.sm),
  },
  cardFront: {
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
  cardBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.sm),
    paddingHorizontal: scale(spacing.sm),
    backgroundColor: colors.white[100],
    gap: verticalScale(spacing.xs),
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: 1,
    borderRadius: moderateScale(radius.lg),
  },
  lockIconCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  lockIconBackground: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: moderateScale(radius.pill),
    padding: moderateScale(12),
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    backgroundColor: colors.black[100],
    borderRadius: moderateScale(radius.pill),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
  },
  comingSoonText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: colors.orange[200],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  categoryTitle: {
    fontFamily: 'Raleway',
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    textAlign: 'center',
    color: colors.white[100],
    fontWeight: 'bold',
    paddingBottom: verticalScale(spacing.xs),
  },
  backCategoryTitle: {
    fontFamily: 'Raleway',
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    textAlign: 'center',
    color: colors.background[100],
    fontWeight: 'bold',
  },
  backDescription: {
    fontSize: moderateScale(10),
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    color: colors.gray[300],
    lineHeight: moderateScale(14),
  },
  sampleWordsContainer: {
    alignItems: 'center',
    gap: verticalScale(4),
  },
  sampleWordsLabel: {
    fontFamily: 'Raleway-Medium',
    fontSize: moderateScale(8),
    color: colors.gray[300],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sampleWordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: scale(3),
  },
  sampleWordPill: {
    backgroundColor: colors.black[100],
    borderRadius: moderateScale(radius.pill),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
  },
  sampleWordPillText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(9),
    color: colors.white[100],
    fontWeight: '600',
  },
});
