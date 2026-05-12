import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import CustomModal from '@/components/modal';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/styles/colors';
import Button from '../button';
import Character from '../character';
import { useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import { Language, useTranslation } from '@/translations';
import CheckPlayerWord from '../forgotWord';
import { GameContext } from '@/context/GameContext';
import { HistoryContext } from '@/context/HistoryContext';
import StatsModal from '@/components/statsModal';
import HowToPlay from '@/components/howToPlay';
import { radius } from '@/styles/radius';
import { spacing } from '@/styles/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlayerInput from '../playerInput';
import { fontSize } from '@/styles/fontSize';
import Dot from '@/components/dot';

export default function SidebarMenu() {
  const [visible, setVisible] = useState(false);
  const [newGameModalOpen, setNewGameModalOpen] = useState(false);
  const [howToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [showForgotWord, setShowForgotWord] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const navigation = useNavigation();
  const { t, language, setLanguage } = useTranslation();
  const { game, createNewGame, getSortedPlayers } = useContext(GameContext);
  const { savedPlayers, matchHistory } = useContext(HistoryContext);
  const insets = useSafeAreaInsets();

  const toggleMenu = () => setVisible(!visible);

  const handleStartNewGame = () => {
    createNewGame();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  const handleChangeLanguage = (lan: Language) => {
    if (lan === language) return;
    setLanguage(lan);
  };

  const isMatchRunning = game.rounds.length > 0;
  const hasData = savedPlayers.length > 0 || matchHistory.length > 0;

  const isForgotWordAvailable =
    game.players.length > 0 &&
    game.currentScreen !== '/createGame' &&
    game.currentScreen !== '/selectCategory';

  return (
    <>
      <TouchableOpacity onPress={toggleMenu} style={styles.triggerButton}>
        <Ionicons name="menu" size={scale(28)} color={colors.orange[200]} />
      </TouchableOpacity>

      <Modal transparent={false} visible={visible} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons
                name="close"
                size={scale(28)}
                color={colors.orange[200]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.backdrop}>
            <ScrollView style={styles.sidebar}>
              <View style={styles.characterCenter}>
                <Character mood="umpa" />
              </View>
              <View style={styles.languageContainer}>
                <Text style={styles.languageLabel}>Language / Idioma:</Text>
                <View style={styles.languageButtons}>
                  <TouchableOpacity
                    style={[
                      styles.langButton,
                      language === 'en' && styles.activeLangButton,
                    ]}
                    onPress={() => handleChangeLanguage('en')}
                  >
                    <Text
                      style={[
                        styles.langText,
                        language === 'en' && styles.activeLangText,
                      ]}
                    >
                      🇺🇸 EN
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.langButton,
                      language === 'pt' && styles.activeLangButton,
                    ]}
                    onPress={() => handleChangeLanguage('pt')}
                  >
                    <Text
                      style={[
                        styles.langText,
                        language === 'pt' && styles.activeLangText,
                      ]}
                    >
                      🇧🇷 PT
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isMatchRunning && (
                <View style={styles.configInfoCard}>
                  <Text style={styles.configInfoLabel}>
                    {t('Current match')}
                  </Text>
                  <View style={styles.configRowsContainer}>
                    <View style={styles.configInfoRow}>
                      <FontAwesome
                        name="user-secret"
                        size={moderateScale(13)}
                        color={colors.orange[200]}
                      />
                      {game.config.randomImpostors ? (
                        <Ionicons
                          name="shuffle"
                          size={moderateScale(13)}
                          color={colors.orange[200]}
                        />
                      ) : (
                        <Text style={styles.configInfoValue}>
                          {game.config.numberOfImpostors}
                        </Text>
                      )}
                    </View>
                    <View style={styles.configInfoRow}>
                      <FontAwesome
                        name="question"
                        size={moderateScale(13)}
                        color={colors.orange[200]}
                      />
                      <Text style={styles.configInfoValue}>
                        {game.config.setsOfQuestions}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* ── Group 1: current game ─────────────────────────── */}
              <View style={styles.menuList}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setNewGameModalOpen(true)}
                >
                  <Ionicons name="refresh" size={moderateScale(20)} color={colors.orange[200]} />
                  <Text style={styles.menuItemText}>{t('Start a new game')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, game.players.length === 0 && styles.menuItemDisabled]}
                  onPress={() => game.players.length > 0 && setShowRanking(true)}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={moderateScale(20)}
                    color={game.players.length > 0 ? colors.orange[200] : colors.gray[300]}
                  />
                  <Text style={[styles.menuItemText, game.players.length === 0 && styles.menuItemTextDisabled]}>
                    {t('Ranking')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, !isForgotWordAvailable && styles.menuItemDisabled]}
                  onPress={() => isForgotWordAvailable && setShowForgotWord(true)}
                >
                  <Ionicons
                    name="eye-outline"
                    size={moderateScale(20)}
                    color={isForgotWordAvailable ? colors.orange[200] : colors.gray[300]}
                  />
                  <Text style={[styles.menuItemText, !isForgotWordAvailable && styles.menuItemTextDisabled]}>
                    {t('Forgot your word')}?
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.menuDivider} />

              {/* ── Group 2: statistics ───────────────────────────── */}
              <View style={styles.menuList}>
                <TouchableOpacity
                  style={[styles.menuItem, !hasData && styles.menuItemDisabled]}
                  onPress={() => hasData && setShowStats(true)}
                >
                  <Ionicons
                    name="bar-chart-outline"
                    size={moderateScale(20)}
                    color={hasData ? colors.orange[200] : colors.gray[300]}
                  />
                  <Text style={[styles.menuItemText, !hasData && styles.menuItemTextDisabled]}>
                    {t('Statistics')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.menuDivider} />

              {/* ── Group 3: help ─────────────────────────────────── */}
              <View style={styles.menuList}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => setHowToPlayModalOpen(true)}
                >
                  <Ionicons name="help-circle-outline" size={moderateScale(20)} color={colors.orange[200]} />
                  <Text style={styles.menuItemText}>{t('Como jogar')}</Text>
                </TouchableOpacity>
              </View>

              <CustomModal
                setModalVisible={setNewGameModalOpen}
                modalVisible={newGameModalOpen}
              >
                <>
                  <View style={styles.newGameModalTitle}>
                    <Text style={styles.titleInformation}>
                      {t('Do you want to:')}
                    </Text>
                  </View>
                  <Character mood="bothCharacter" />
                  <View style={styles.newGameModalButtons}>
                    <Button
                      text={t('New game (resets all scores)')}
                      onPress={handleStartNewGame}
                    />
                    <Button
                      text={t('Continue with current game')}
                      variants="secondary"
                      onPress={() => setNewGameModalOpen(false)}
                    />
                  </View>
                </>
              </CustomModal>

              <HowToPlay
                visible={howToPlayModalOpen}
                onClose={() => setHowToPlayModalOpen(false)}
              />

              <StatsModal
                visible={showStats}
                onClose={() => setShowStats(false)}
              />

              <Modal
                transparent={false}
                visible={showRanking}
                animationType="slide"
              >
                <View
                  style={[
                    styles.showRankingContainer,
                    { paddingTop: insets.top, paddingBottom: insets.bottom },
                  ]}
                >
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => setShowRanking(false)}>
                      <Ionicons
                        name="close"
                        size={scale(28)}
                        color={colors.orange[200]}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.rankingTitleWrapper}>
                    <Text style={styles.rankingTitle}>{t('Leaderboard')}</Text>
                  </View>
                  <ScrollView
                    style={styles.rankingScrollView}
                    contentContainerStyle={styles.rankingScrollContent}
                  >
                    {getSortedPlayers().map(player => (
                      <PlayerInput
                        key={player.id}
                        player={player}
                        notEditable
                      />
                    ))}
                  </ScrollView>
                </View>
              </Modal>

              <CheckPlayerWord
                showForgotWord={showForgotWord}
                setShowForgotWord={setShowForgotWord}
              />

              <View style={styles.sidebarBottomSpacer} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background[100],
  },
  triggerButton: {
    backgroundColor: colors.background[100],
    borderRadius: moderateScale(radius.pill),
    padding: scale(5),
  },
  buttonContainer: {
    zIndex: 100,
    backgroundColor: colors.background[100],
    borderRadius: moderateScale(radius.pill),
    padding: scale(5),
    alignSelf: 'flex-end',
  },
  characterCenter: {
    alignSelf: 'center',
  },
  languageContainer: {
    marginVertical: verticalScale(20),
    alignItems: 'center',
  },
  languageLabel: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: colors.white[100],
    marginBottom: verticalScale(10),
  },
  languageButtons: {
    flexDirection: 'row',
    gap: scale(10),
  },
  langButton: {
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    borderWidth: scale(1),
    borderColor: colors.orange[200],
  },
  activeLangButton: {
    backgroundColor: colors.orange[200],
  },
  langText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  activeLangText: {
    color: colors.background[100],
  },
  menuButtonContainer: {
    marginVertical: '4%',
    alignSelf: 'center',
  },
  configInfoCard: {
    borderWidth: 1,
    borderColor: colors.orange[200] + '40',
    borderRadius: moderateScale(radius.md),
    paddingVertical: verticalScale(spacing.sm),
    paddingHorizontal: scale(spacing.md),
    marginBottom: verticalScale(spacing.md),
  },
  configInfoLabel: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: colors.gray[300],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(4),
  },
  configRowsContainer: {
    flexDirection: "row",
    gap: scale(15)
  },
  configInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  configInfoValue: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: colors.orange[200],
  },
  menuList: {
    gap: verticalScale(2),
    marginHorizontal: scale(20),
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.gray[300] + '30',
    marginHorizontal: scale(20),
    marginVertical: verticalScale(spacing.sm),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.sm),
    paddingVertical: verticalScale(spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300] + '30',
  },
  menuItemDisabled: {
    opacity: 0.4,
  },
  menuItemText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: colors.white[100],
  },
  menuItemTextDisabled: {
    color: colors.gray[300],
  },
  newGameModalTitle: {
    marginBottom: verticalScale(30),
  },
  newGameModalButtons: {
    gap: verticalScale(40),
  },
  backdrop: {
    flex: 1,
  },
  titleInformation: {
    fontSize: moderateScale(20),
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  specialText: {
    color: colors.orange[200],
    fontWeight: 'bold',
  },
  sidebar: {
    flex: 1,
    backgroundColor: colors.background[100],
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(16),
    elevation: 5,
  },
  sidebarBottomSpacer: {
    marginBottom: verticalScale(40),
  },
  showRankingContainer: {
    flex: 1,
    backgroundColor: colors.background[100],
  },
  rankingTitleWrapper: {
    alignItems: 'center',
  },
  rankingTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Raleway-Medium',
    color: colors.orange[200],
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: verticalScale(spacing.sm),
  },
  rankingScrollView: {
    marginTop: verticalScale(20),
  },
  rankingScrollContent: {
    gap: verticalScale(5),
    alignItems: 'center',
    paddingHorizontal: scale(spacing.md),
    paddingBottom: verticalScale(spacing.md),
  },
});
