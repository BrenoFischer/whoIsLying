import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';

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
}

interface GameMode {
  id: string;
  titleKey: string;
  descriptionKey: string;
  tagsKey: string;
  gradientStart: string;
  gradientEnd: string;
  config: ModeConfig | null;
}

const GAME_MODES: GameMode[] = [
  {
    id: 'party',
    titleKey: 'Party',
    descriptionKey: 'partyModeDescription',
    tagsKey: 'partyModeTags',
    gradientStart: '#6D28D9',
    gradientEnd: '#BE185D',
    config: { numberOfImpostors: 3, randomImpostors: false, setsOfQuestions: 1 },
  },
  {
    id: 'chaos',
    titleKey: 'Chaos',
    descriptionKey: 'chaosModeDescription',
    tagsKey: 'chaosModeTagss',
    gradientStart: '#991B1B',
    gradientEnd: '#B45309',
    config: { numberOfImpostors: 1, randomImpostors: true, setsOfQuestions: 1 },
  },
  {
    id: 'classic',
    titleKey: 'Classic',
    descriptionKey: 'classicModeDescription',
    tagsKey: 'classicModeTags',
    gradientStart: '#1E3A8A',
    gradientEnd: '#0E7490',
    config: { numberOfImpostors: 1, randomImpostors: false, setsOfQuestions: 2 },
  },
  {
    id: 'custom',
    titleKey: 'Custom',
    descriptionKey: 'customModeDescription',
    tagsKey: 'customModeTags',
    gradientStart: '#1F2937',
    gradientEnd: '#4B5563',
    config: null,
  },
];

export default function SelectGameMode() {
  const { setNumberOfImpostors, setRandomImpostors, setSetsOfQuestions, setCurrentScreen, setGameMode } =
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
    }
    router.push('/selectCategory');
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
              style={styles.card}
              onPress={() => handleSelectMode(mode)}
              activeOpacity={0.85}
            >
              {/* Gradient background */}
              <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id={`grad-${mode.id}`} x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={mode.gradientStart} stopOpacity="1" />
                    <Stop offset="1" stopColor={mode.gradientEnd} stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill={`url(#grad-${mode.id})`} />
              </Svg>

              {/* Subtle dark overlay on left for text legibility */}
              <View style={styles.cardLeftFade} />

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{t(mode.titleKey)}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {t(mode.descriptionKey)}
                </Text>
                <Text style={styles.cardTags}>{t(mode.tagsKey)}</Text>
              </View>

              {/* Arrow hint */}
              <View style={styles.cardArrow}>
                <Ionicons
                  name="chevron-forward"
                  size={moderateScale(20)}
                  color={'rgba(255,255,255,0.5)'}
                />
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
    paddingHorizontal: scale(spacing.lg),
    paddingBottom: verticalScale(spacing.xl),
    gap: verticalScale(spacing.sm),
  },
  card: {
    height: verticalScale(140),
    borderRadius: moderateScale(radius.lg),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeftFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: scale(spacing.lg),
    paddingVertical: verticalScale(spacing.md),
    justifyContent: 'center',
    gap: verticalScale(spacing.xs),
  },
  cardTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(22),
    color: colors.white[100],
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.80)',
    lineHeight: moderateScale(17),
  },
  cardTags: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: verticalScale(spacing.xs),
  },
  cardArrow: {
    paddingRight: scale(spacing.md),
  },
});
