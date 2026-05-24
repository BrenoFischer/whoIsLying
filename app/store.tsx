import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { radius } from '@/styles/radius';
import { fontSize } from '@/styles/fontSize';
import ScreenLayout from '@/components/screenLayout';
import Character from '@/components/character';
import FlipCard, { FlipCardRef } from '@/components/flipCard';
import { usePurchase } from '@/context/PurchaseContext';
import { PACKS, type Pack } from '@/data/packs';
import { useTranslation } from '@/translations';

const PACK_ART: Record<string, number> = {
  halloween: require('@/assets/images/halloweenCategory.png'),
  geography: require('@/assets/images/geographyCategory.png'),
  professions: require('@/assets/images/professionsCategory.png'),
};

function PackCard({ pack }: { pack: Pack }) {
  const { isPurchased, purchasePack, storeProducts, isLoading } = usePurchase();
  const { t } = useTranslation();
  const [purchasing, setPurchasing] = useState(false);
  const cardRef = useRef<FlipCardRef>(null);

  const owned = isPurchased(pack.id);
  const storeProduct = pack.productId ? storeProducts[pack.productId] : null;

  const handleBuy = useCallback(async () => {
    if (owned) return;
    setPurchasing(true);
    try {
      await purchasePack(pack);
    } catch {
      Alert.alert(t('Purchase failed'), t('Please try again.'));
    } finally {
      setPurchasing(false);
    }
  }, [owned, pack, purchasePack, t]);

  const priceLabel = storeProduct?.displayPrice ?? '$2.99';
  const artImage = PACK_ART[pack.id] ?? null;
  const chars = pack.previewCharacters.slice(0, 3);

  const front = (
    <View style={[StyleSheet.absoluteFill, styles.frontFace, { backgroundColor: pack.color }]}>
      {artImage && (
        <View style={styles.artImageContainer} pointerEvents="none">
          <Image source={artImage} style={styles.artImage} resizeMode="contain" />
        </View>
      )}
      <View style={styles.cardTextContent} pointerEvents="none">
        <Text style={styles.cardTitle}>{t(pack.nameKey)}</Text>
        <Text style={styles.cardPrice}>{priceLabel}</Text>
      </View>
      <View style={styles.charRow} pointerEvents="none">
        {chars.map((charName, i) => (
          <View
            key={charName}
            style={[styles.charSlot, { left: i * scale(40), zIndex: i * (-1) }]}
          >
            <Character mood={charName} size={scale(72)} />
          </View>
        ))}
      </View>
    </View>
  );

  const back = (
    <View style={[styles.backFace, { backgroundColor: pack.color }]}>
      <Text style={styles.backDescription} numberOfLines={3}>
        {t(pack.descriptionKey)}
      </Text>
      <View style={styles.backSection}>
        <Text style={styles.backSectionLabel}>{t('packIncludes')}</Text>
        <View style={styles.highlightList}>
          {pack.highlights.map(key => (
            <View key={key} style={styles.highlightRow}>
              <Text style={styles.highlightBullet}>•</Text>
              <Text style={styles.highlightText}>{t(key)}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.accountNote}>{t('packAccountNote')}</Text>
      {owned ? (
        <View style={styles.ownedIndicator}>
          <Ionicons name="checkmark-circle" size={moderateScale(16)} color={colors.green[100]} />
          <Text style={styles.ownedText}>{t('Owned')}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuy}
          disabled={isLoading || purchasing}
          activeOpacity={0.85}
        >
          <Text style={styles.buyButtonText}>
            {purchasing || isLoading ? t('Processing...') : `${t('Buy now!')}  ${priceLabel}`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlipCard
      ref={cardRef}
      front={front}
      back={back}
      style={styles.card}
      onPress={() => cardRef.current?.flip()}
    />
  );
}

export default function Store() {
  const { restorePurchases, isLoading } = usePurchase();
  const { t } = useTranslation();

  const handleRestore = useCallback(async () => {
    try {
      await restorePurchases();
      Alert.alert(t('Purchases restored'), t('Your purchases have been restored.'));
    } catch {
      Alert.alert(t('Restore failed'), t('Please try again.'));
    }
  }, [restorePurchases, t]);

  return (
    <ScreenLayout
      header={
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.orange[200]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Store')}</Text>
          <View style={styles.headerRight} />
        </View>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{t('Packs')}</Text>
          <Text style={styles.subtitle}>{t('Expand your game with new categories and characters')}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {PACKS.filter(p => !p.isFree).map(pack => (
            <PackCard key={pack.id} pack={pack} />
          ))}

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={styles.restoreText}>{t('Restore Purchases')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.xs),
    paddingBottom: verticalScale(spacing.xs),
  },
  backButton: {
    padding: scale(spacing.xs),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.md,
    color: colors.white[100],
  },
  headerRight: {
    width: moderateScale(24) + scale(spacing.xs) * 2,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  titleSection: {
    paddingHorizontal: scale(spacing.lg),
    paddingTop: verticalScale(spacing.sm),
    paddingBottom: verticalScale(spacing.md),
  },
  pageTitle: {
    fontFamily: 'Raleway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  subtitle: {
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    color: colors.gray[300],
    marginTop: verticalScale(2),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.md),
    paddingBottom: verticalScale(spacing.xl),
    gap: verticalScale(spacing.sm),
  },
  card: {
    height: verticalScale(170),
    borderRadius: moderateScale(radius.lg),
  },
  frontFace: {
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',
  },
  artImageContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '55%',
  },
  artImage: {
    flex: 1,
    width: '100%',
  },
  cardTextContent: {
    position: 'absolute',
    top: verticalScale(spacing.lg),
    left: scale(spacing.lg),
    right: '48%',
    zIndex: 2,
    gap: verticalScale(4),
  },
  cardTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(26),
    color: colors.white[100],
    letterSpacing: 0.3,
  },
  cardPrice: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: moderateScale(16),
    color: colors.orange[200],
  },
  cardPriceOwned: {
    color: colors.green[100],
  },
  charRow: {
    position: 'absolute',
    bottom: 0,
    left: scale(spacing.sm),
    width: scale(72 + 2 * 40),
    height: scale(72),
    zIndex: 2,
  },
  charSlot: {
    position: 'absolute',
    bottom: 0,
  },
  backFace: {
    flex: 1,
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',
    paddingHorizontal: scale(spacing.md),
    paddingVertical: verticalScale(spacing.sm),
    justifyContent: 'space-between',
  },
  backDescription: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: colors.white[100],
    lineHeight: moderateScale(18),
    paddingRight: scale(spacing.xl),
  },
  backSection: {
    gap: verticalScale(4),
  },
  backSectionLabel: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: moderateScale(9),
    color: colors.white[100],
    opacity: 0.55,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  highlightList: {
    gap: verticalScale(2),
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
  },
  highlightBullet: {
    color: colors.orange[200],
    fontSize: moderateScale(10),
  },
  highlightText: {
    fontFamily: 'Raleway',
    fontWeight: '500',
    fontSize: moderateScale(12),
    color: colors.white[100],
  },
  accountNote: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(8),
    color: colors.white[100],
    opacity: 0.4,
  },
  buyButton: {
    backgroundColor: colors.orange[200],
    borderRadius: moderateScale(radius.md),
    paddingVertical: verticalScale(spacing.xs),
    alignItems: 'center',
  },
  buyButtonText: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: moderateScale(14),
    color: colors.white[100],
  },
  ownedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(spacing.xs),
    paddingVertical: verticalScale(spacing.xs),
  },
  ownedText: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: moderateScale(14),
    color: colors.green[100],
  },
  restoreButton: {
    alignSelf: 'center',
    marginTop: verticalScale(spacing.sm),
    paddingVertical: verticalScale(spacing.sm),
  },
  restoreText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: colors.gray[300],
    textDecorationLine: 'underline',
  },
});
