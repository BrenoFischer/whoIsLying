import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { GameContext } from '@/context/GameContext';
import { useTranslation } from '@/translations';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { radius } from '@/styles/radius';
import { fontSize } from '@/styles/fontSize';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';

interface ModeConfig {
  numberOfImpostors: number;
  randomImpostors: boolean;
  setsOfQuestions: number;
  timedRound?: boolean;
  roundDuration?: number;
}

interface GameMode {
  id: string;
  titleKey: string;
  descriptionKey: string;
  tagsKey: string;
  color: string;
  config: ModeConfig | null;
  image?: number;
  randomImpostorCount?: boolean;
}

const GAME_MODES: GameMode[] = [
  {
    id: 'party',
    titleKey: 'Party',
    descriptionKey: 'partyModeDescription',
    tagsKey: 'partyModeTags',
    color: '#6D28D9',
    config: { numberOfImpostors: 3, randomImpostors: false, setsOfQuestions: 1, timedRound: true, roundDuration: 5 },
    image: require('@/assets/images/partyGameModeBg.png'),
  },
  {
    id: 'chaos',
    titleKey: 'Chaos',
    descriptionKey: 'chaosModeDescription',
    tagsKey: 'chaosModeTagss',
    color: '#991B1B',
    config: { numberOfImpostors: 1, randomImpostors: true, setsOfQuestions: 1, timedRound: true, roundDuration: 10 },
    image: require('@/assets/images/chaosGameModeBg.png'),
    randomImpostorCount: true,
  },
  {
    id: 'classic',
    titleKey: 'Classic',
    descriptionKey: 'classicModeDescription',
    tagsKey: 'classicModeTags',
    color: colors.orange[200],
    config: { numberOfImpostors: 1, randomImpostors: false, setsOfQuestions: 2, timedRound: false },
    image: require('@/assets/images/classicGameModeBg.png'),
  },
  {
    id: 'custom',
    titleKey: 'Custom',
    descriptionKey: 'customModeDescription',
    tagsKey: 'customModeTags',
    color: '#1F2937',
    config: null,
    image: require('@/assets/images/customGameModeBg.png'),
  },
  {
    id: 'mimic',
    titleKey: 'Mimic',
    descriptionKey: 'mimicModeDescription',
    tagsKey: 'mimicModeTags',
    color: '#065F46',
    config: { numberOfImpostors: 1, randomImpostors: false, setsOfQuestions: 2, timedRound: false, roundDuration: 10 },
  },
];

export default function SelectGameMode() {
  const { setNumberOfImpostors, setRandomImpostors, setSetsOfQuestions, setTimedRound, setRoundDuration, setCurrentScreen, setGameMode } =
    useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/selectGameMode');
  }, []);

  const handleSelectMode = (mode: GameMode) => {
    setGameMode(mode.id);
    if (mode.config) {
      setNumberOfImpostors(mode.config.numberOfImpostors);
      setRandomImpostors(mode.config.randomImpostors);
      setSetsOfQuestions(mode.config.setsOfQuestions);
      if (mode.config.timedRound !== undefined) setTimedRound(mode.config.timedRound);
      if (mode.config.roundDuration !== undefined) setRoundDuration(mode.config.roundDuration);
    }
    router.push(mode.id === 'custom' ? '/selectCategory?openConfig=true' : '/selectCategory');
  };

  return (
    <ScreenLayout>
      <View style={styles.contentWrapper}>
        <View style={styles.menuButtonsRow}>
          <SidebarMenu />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{t('Game Mode')}</Text>
          <Text style={styles.subtitle}>{t('Choose how you want to play')}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {GAME_MODES.map(mode => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.card, { backgroundColor: mode.color }]}
              onPress={() => handleSelectMode(mode)}
              activeOpacity={0.9}
            >
              {/* Image anchored to the right side */}
              {mode.image && (
                <View style={styles.imageContainer}>
                  <Image
                    source={mode.image}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Uniform dark overlay */}
              <View style={styles.darkOverlay} />

              {/* Left accent bar */}
              <View style={[styles.accentBar, { backgroundColor: mode.color }]} />

              {/* Config chips — top-right corner */}
              {mode.config && (
                <View style={styles.statsColumn}>
                  {/* Impostor chip: "random" for chaos, count for others */}
                  <View style={styles.statChip}>
                    <Ionicons
                      name={mode.randomImpostorCount ? 'shuffle-outline' : 'people-outline'}
                      size={moderateScale(9)}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.statText}>
                      {mode.randomImpostorCount
                        ? t('random_chip')
                        : `${mode.config.numberOfImpostors} ${t(mode.config.numberOfImpostors === 1 ? 'impostor_chip' : 'impostors_chip')}`}
                    </Text>
                  </View>

                  {/* Sets chip */}
                  <View style={styles.statChip}>
                    <Ionicons name="layers-outline" size={moderateScale(9)} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statText}>
                      {mode.config.setsOfQuestions}{' '}
                      {t(mode.config.setsOfQuestions === 1 ? 'round_chip' : 'rounds_chip')}
                    </Text>
                  </View>

                  {/* Random chip — only when not already shown as the impostor chip */}
                  {mode.config.randomImpostors && !mode.randomImpostorCount && (
                    <View style={[styles.statChip, styles.statChipHighlight]}>
                      <Ionicons name="shuffle-outline" size={moderateScale(9)} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.statText}>{t('random_chip')}</Text>
                    </View>
                  )}

                  {/* Timed round chip */}
                  {mode.config.timedRound && (
                    <View style={[styles.statChip, styles.statChipHighlight]}>
                      <Ionicons name="timer-outline" size={moderateScale(9)} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.statText}>{mode.config.roundDuration}s {t('to answer')}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Content — left side only */}
              <View style={styles.cardContent}>
                <View style={styles.textBlock}>
                  <Text style={styles.cardTitle}>{t(mode.titleKey)}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {t(mode.descriptionKey)}
                  </Text>
                </View>

                <View style={styles.tagsRow}>
                  {t(mode.tagsKey).split(' · ').map((tag, i) => (
                    <View key={i} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
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
  menuButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.xs),
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
    paddingBottom: verticalScale(spacing.xl),
    gap: verticalScale(spacing.sm),
  },
  card: {
    height: verticalScale(200),
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardContent: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    left: 0,
    bottom: 0,
    width: '70%',
    padding: scale(spacing.lg),
    justifyContent: 'space-between',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scale(4),
    zIndex: 3,
  },
  textBlock: {
    flex: 1,
  },
  statsColumn: {
    position: 'absolute',
    top: scale(spacing.lg),
    right: scale(spacing.lg),
    zIndex: 3,
    alignItems: 'flex-end',
    gap: verticalScale(4),
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    backgroundColor: '#111827',
    borderRadius: moderateScale(4),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
  },
  statChipHighlight: {
    backgroundColor: colors.orange[200],
  },
  statText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(9),
    color: colors.white[100],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(5),
    paddingBottom: verticalScale(2),
  },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
  },
  tagPillText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  imageContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(fontSize.xxl),
    color: colors.white[100],
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.85)',
    marginTop: verticalScale(4),
  },
});
