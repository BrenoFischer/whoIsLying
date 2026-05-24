import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Pressable,
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
import CustomModal from '@/components/modal';
import { usePurchase } from '@/context/PurchaseContext';
import { PACKS, BASE_PACK_THEMES, type Pack } from '@/data/packs';
import categories from '@/data/categories.json';
import { characters } from '@/data/imagesData';
import { useTranslation } from '@/translations';

const PACK_ART: Record<string, number> = {
  halloween: require('@/assets/images/halloweenCategory.png'),
  geography: require('@/assets/images/geographyCategory.png'),
  professions: require('@/assets/images/professionsCategory.png'),
};

function PackCard({ pack }: { pack: Pack }) {
  const { isPurchased, purchasePack, storeProducts, isLoading } = usePurchase();
  const { t, language } = useTranslation();
  const [purchasing, setPurchasing] = useState(false);
  const cardRef = useRef<FlipCardRef>(null);

  const owned = isPurchased(pack.id);
  const storeProduct = pack.productId ? storeProducts[pack.productId] : null;

  const packCharacters = useMemo(() => {
    const newThemes = pack.characterThemes.filter(theme => !BASE_PACK_THEMES.has(theme));
    return characters.filter(c => newThemes.includes(c.theme)).map(c => c.name);
  }, [pack]);

  const highlights = useMemo(() => {
    const lines: string[] = [];

    let words = 0;
    let questions = 0;
    const categoryNames: string[] = [];

    for (const key of pack.categories) {
      const cat = (categories as any)[key];
      if (!cat) continue;
      categoryNames.push(t(key));
      words += Array.isArray(cat.content) ? cat.content.length : 0;
      if (cat.questions) {
        for (const arr of Object.values(cat.questions)) {
          if (Array.isArray(arr)) questions += arr.length;
        }
      }
    }

    if (categoryNames.length === 1) {
      lines.push(t('A new {{name}} category to play', { name: categoryNames[0] }));
    } else if (categoryNames.length > 1) {
      lines.push(t('{{count}} new categories to play', { count: categoryNames.length }));
    }
    if (words > 0) {
      lines.push(t('{{count}} secret words', { count: words }));
    }
    if (questions > 0) {
      lines.push(t('{{count}} questions based on the theme', { count: questions }));
    }
    if (packCharacters.length > 0) {
      lines.push(t('{{count}} new characters to choose from', { count: packCharacters.length }));
    }

    return lines;
  }, [pack, t, language, packCharacters]);

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

  const front = (
    <View style={[StyleSheet.absoluteFill, styles.frontFace, { backgroundColor: pack.color }]}>
      <View style={styles.frontHeader} pointerEvents="none">
        <Text style={styles.cardTitle}>{t(pack.nameKey)}</Text>
        <Text style={styles.cardPrice}>{priceLabel}</Text>
      </View>
      {artImage && (
        <View style={styles.frontArtContainer} pointerEvents="none">
          <Image source={artImage} style={styles.frontArt} resizeMode="contain" />
        </View>
      )}
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
          {highlights.map((line, i) => (
            <View key={i} style={styles.highlightRow}>
              <Text style={styles.highlightBullet}>•</Text>
              <Text style={styles.highlightText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>
      {packCharacters.length > 0 && (
        <View style={styles.backSection}>
          <Text style={styles.backSectionLabel}>{t('packCharactersLabel')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            directionalLockEnabled
            contentContainerStyle={styles.backCharRow}
          >
            {packCharacters.map(name => (
              <Pressable
                key={name}
                onPress={() => {}}
                style={styles.backCharItem}
              >
                <Character mood={name} size={scale(56)} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
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
  const { restorePurchases, isLoading, isPurchased } = usePurchase();
  const { t } = useTranslation();
  const [restoreInfoVisible, setRestoreInfoVisible] = useState(false);

  const paidPacks = useMemo(() => PACKS.filter(p => !p.isFree), []);
  const ownedCount = useMemo(
    () => paidPacks.filter(p => isPurchased(p.id)).length,
    [paidPacks, isPurchased]
  );
  const allUnlocked = ownedCount === paidPacks.length && paidPacks.length > 0;

  const handleRestore = useCallback(async () => {
    setRestoreInfoVisible(false);
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
          <TouchableOpacity
            onPress={() => setRestoreInfoVisible(true)}
            style={[styles.restoreHeaderButton, isLoading && styles.restoreHeaderButtonDisabled]}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud-download-outline" size={moderateScale(14)} color={colors.orange[200]} />
            <Text style={styles.restoreHeaderText}>{t('Restore purchases')}</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{t('Store')}</Text>
          <Text style={styles.subtitle}>
            {t('Unlock new categories, words and characters to expand your games')}
          </Text>
          {paidPacks.length > 0 && (
            <View style={[styles.ownedChip, allUnlocked && styles.ownedChipComplete]}>
              <Ionicons
                name={allUnlocked ? 'checkmark-circle' : 'lock-open-outline'}
                size={moderateScale(12)}
                color={allUnlocked ? colors.green[100] : colors.orange[200]}
              />
              <Text style={[styles.ownedChipText, allUnlocked && styles.ownedChipTextComplete]}>
                {allUnlocked
                  ? t('All packs unlocked')
                  : t('{{owned}} / {{total}} unlocked', {
                      owned: ownedCount,
                      total: paidPacks.length,
                    })}
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {paidPacks.map(pack => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </ScrollView>
      </View>

      <CustomModal
        modalVisible={restoreInfoVisible}
        setModalVisible={setRestoreInfoVisible}
      >
        <View style={styles.restoreModalIconWrap}>
          <Ionicons
            name="cloud-download-outline"
            size={moderateScale(40)}
            color={colors.orange[200]}
          />
        </View>
        <Text style={styles.restoreModalTitle}>{t('Restore purchases')}</Text>
        <Text style={styles.restoreModalBody}>
          {t('Your packs are linked to your App Store / Google Play account, not to this device. Signing in with the same account on any device lets you restore them.')}
        </Text>
        <View style={styles.restoreModalActions}>
          <TouchableOpacity
            onPress={() => setRestoreInfoVisible(false)}
            style={[styles.restoreModalButton, styles.restoreModalButtonSecondary]}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreModalButtonSecondaryText}>{t('Cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRestore}
            disabled={isLoading}
            style={[
              styles.restoreModalButton,
              styles.restoreModalButtonPrimary,
              isLoading && styles.restoreHeaderButtonDisabled,
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.restoreModalButtonPrimaryText}>
              {isLoading ? t('Processing...') : t('Restore now')}
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.xs),
    paddingBottom: verticalScale(spacing.xs),
  },
  backButton: {
    padding: scale(spacing.xs),
  },
  restoreHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(spacing.sm),
    paddingVertical: verticalScale(spacing.xs),
    borderRadius: moderateScale(radius.pill),
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  restoreHeaderButtonDisabled: {
    opacity: 0.5,
  },
  restoreHeaderText: {
    fontFamily: 'Raleway',
    fontWeight: '600',
    fontSize: moderateScale(11),
    color: colors.orange[200],
  },
  restoreModalIconWrap: {
    alignItems: 'center',
    marginBottom: verticalScale(spacing.sm),
  },
  restoreModalTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    color: colors.background[100],
    textAlign: 'center',
    marginBottom: verticalScale(spacing.sm),
  },
  restoreModalBody: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    color: colors.gray[300],
    textAlign: 'center',
    marginBottom: verticalScale(spacing.lg),
  },
  restoreModalActions: {
    flexDirection: 'row',
    gap: scale(spacing.sm),
  },
  restoreModalButton: {
    flex: 1,
    paddingVertical: verticalScale(spacing.sm),
    borderRadius: moderateScale(radius.md),
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreModalButtonPrimary: {
    backgroundColor: colors.orange[200],
  },
  restoreModalButtonPrimaryText: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: moderateScale(13),
    color: colors.white[100],
  },
  restoreModalButtonSecondary: {
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  restoreModalButtonSecondaryText: {
    fontFamily: 'Raleway',
    fontWeight: '600',
    fontSize: moderateScale(13),
    color: colors.gray[300],
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
  ownedChip: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(spacing.sm),
    paddingVertical: verticalScale(spacing.xs),
    borderRadius: moderateScale(radius.pill),
    borderWidth: 1,
    borderColor: colors.orange[200] + '55',
    backgroundColor: colors.orange[200] + '12',
    marginTop: verticalScale(spacing.sm),
  },
  ownedChipComplete: {
    borderColor: colors.green[100] + '66',
    backgroundColor: colors.green[100] + '15',
  },
  ownedChipText: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: moderateScale(11),
    color: colors.orange[200],
    letterSpacing: 0.3,
  },
  ownedChipTextComplete: {
    color: colors.green[100],
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
    height: verticalScale(290),
    borderRadius: moderateScale(radius.lg),
  },
  frontFace: {
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: verticalScale(spacing.lg),
    paddingBottom: verticalScale(spacing.md),
  },
  frontHeader: {
    alignItems: 'center',
    gap: verticalScale(4),
    zIndex: 2,
  },
  cardTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(28),
    color: colors.white[100],
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  cardPrice: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: moderateScale(18),
    color: colors.orange[200],
    textAlign: 'center',
  },
  frontArtContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(spacing.sm),
  },
  frontArt: {
    width: '65%',
    height: '100%',
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
  backCharRow: {
    gap: scale(spacing.sm),
    paddingVertical: verticalScale(spacing.xs),
    paddingRight: scale(spacing.md),
    alignItems: 'flex-end',
  },
  backCharItem: {
    backgroundColor: colors.white[100] + '18',
    borderRadius: moderateScale(radius.md),
    paddingHorizontal: scale(4),
    paddingTop: scale(4),
    overflow: 'hidden',
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
});
