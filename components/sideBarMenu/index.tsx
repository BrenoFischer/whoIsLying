import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  useWindowDimensions,
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
import PlayerStats from '@/components/playerStats';
import MatchHistory from '@/components/matchHistory';
import { radius } from '@/styles/radius';
import { spacing } from '@/styles/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlayerInput from '../playerInput';
import { fontSize } from '@/styles/fontSize';
import Dot from '@/components/dot';

interface HowToPlayProps {
  showHowToPlay: boolean;
  setShowHowToPlay: React.Dispatch<React.SetStateAction<boolean>>;
}

function HowToPlay({ showHowToPlay, setShowHowToPlay }: HowToPlayProps) {
  const [slide, setSlide] = useState(0);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const totalSlides = 8;
  const { t } = useTranslation();

  // Character sizes scaled to screen height so the layout works on all devices
  const charSm = Math.round(height * 0.09);
  const charMd = Math.round(height * 0.12);
  const charLg = Math.round(height * 0.16);

  const handleChangeSlide = (amount: number) => {
    const newSlide = slide + amount;
    if (newSlide >= totalSlides || newSlide < 0) return;
    setSlide(newSlide);
  };

  // Each slide is an object with a scene (visual top) and title + text (bottom)
  const slides = [
    // ── Slide 1 · The Roles ───────────────────────────────────────────────
    {
      title: t('The Roles'),
      scene: (
        <View style={styles.htpSlide1Scene}>
          {/* Civilian group — 3 characters slightly overlapping */}
          <View style={styles.htpCivilianCluster}>
            <View style={{ zIndex: 3 }}>
              <Character mood="breno" size={charMd} />
            </View>
            <View style={{ zIndex: 2, marginLeft: -charMd * 0.45 }}>
              <Character mood="gabs" size={charMd} />
            </View>
            <View style={{ zIndex: 1, marginLeft: -charMd * 0.45 }}>
              <Character mood="sara" size={charMd} />
            </View>
          </View>

          {/* VS divider */}
          <View style={styles.htpVsDivider}>
            <View style={styles.htpVsLine} />
            <Text style={styles.htpVsText}>VS</Text>
            <View style={styles.htpVsLine} />
          </View>

          {/* The impostor — facing the group */}
          <Character mood="ghost" size={charLg} flip />
        </View>
      ),
      text: (
        <Text style={styles.htpBody}>
          {t('Everyone receives a')}{' '}
          <Text style={styles.htpOrange}>{t('secret word')}</Text>
          {'. '}
          {t('But one or more players are secretly the')}{' '}
          <Text style={styles.htpOrange}>{t('impostors')}</Text>
          {' — '}
          {t('they know nothing and must bluff their way through.')}
        </Text>
      ),
    },

    // ── Slide 2 · Setup ───────────────────────────────────────────────────
    {
      title: t('Setup'),
      scene: (
        <View style={styles.htpCenteredScene}>
          <Character mood="bothCharacter" size={charLg * 1.5} />
          <View style={styles.htpBadgeRow}>
            <View style={styles.htpBadge}>
              <FontAwesome name="user-secret" size={moderateScale(18)} color={colors.orange[200]} />
              <Text style={styles.htpBadgeLabel}>{t('Impostors')}</Text>
            </View>
            <View style={styles.htpBadge}>
              <FontAwesome name="question" size={moderateScale(18)} color={colors.orange[200]} />
              <Text style={styles.htpBadgeLabel}>{t('Questions')}</Text>
            </View>
            <View style={styles.htpBadge}>
              <Ionicons name="people" size={moderateScale(18)} color={colors.orange[200]} />
              <Text style={styles.htpBadgeLabel}>{t('Players')}</Text>
            </View>
          </View>
        </View>
      ),
      text: (
        <Text style={styles.htpBody}>
          {t('Choose a')}{' '}
          <Text style={styles.htpOrange}>{t('category')}</Text>
          {', '}
          {t('configure')}{' '}
          <Text style={styles.htpOrange}>{t('impostors')}</Text>
          {' (1–3) '}
          {t('and')}{' '}
          <Text style={styles.htpOrange}>{t('question sets')}</Text>
          {' (1–3). '}
          {t('Then add all')}{' '}
          <Text style={styles.htpOrange}>{t('players')}</Text>
          {' '}
          {t('and pick their unique characters.')}
        </Text>
      ),
    },

    // ── Slide 3 · Secret Reveal ───────────────────────────────────────────
    {
      title: t('Secret Reveal'),
      scene: (
        <View style={styles.htpRevealScene}>
          <View style={styles.htpRevealPlayer}>
            <Character mood="gio" size={charLg} />
            <View style={[styles.htpRevealBadge, styles.htpRevealBadgeCivilian]}>
              <Ionicons name="eye" size={moderateScale(13)} color={colors.green[100]} />
              <Text style={styles.htpRevealTextCivilian}>{t('Sees the word')}</Text>
            </View>
          </View>

          <View style={styles.htpRevealPlayer}>
            <Character mood="ber" size={charLg} />
            <View style={[styles.htpRevealBadge, styles.htpRevealBadgeImpostor]}>
              <Ionicons name="eye-off" size={moderateScale(13)} color={colors.red[200]} />
              <Text style={styles.htpRevealTextImpostor}>{t('Impostor')}</Text>
            </View>
          </View>
        </View>
      ),
      text: (
        <Text style={styles.htpBody}>
          {t('Pass the phone to each player')}{' '}
          <Text style={styles.htpOrange}>{t('privately')}</Text>
          {'. '}
          {t('Civilians see the')}{' '}
          <Text style={styles.htpOrange}>{t('secret word')}</Text>
          {'. '}
          {t('Impostors only see')}{' "'}
          <Text style={styles.htpOrange}>{t('You are the impostor')}</Text>
          {'" — '}
          {t('they must blend in.')}
        </Text>
      ),
    },

    // ── Slide 4 · Questions ───────────────────────────────────────────────
    {
      title: t('Questions'),
      scene: (
        <View style={styles.htpQuestionsScene}>
          <Character mood="umpa" size={charLg} />
          <View style={styles.htpMicBubble}>
            <Ionicons name="mic" size={moderateScale(30)} color={colors.orange[200]} />
          </View>
          <Character mood="luh" size={charLg} flip />
        </View>
      ),
      text: (
        <Text style={styles.htpBody}>
          {t('Players take turns')}{' '}
          <Text style={styles.htpOrange}>{t('asking')}</Text>
          {' '}
          {t('and')}{' '}
          <Text style={styles.htpOrange}>{t('answering questions')}</Text>
          {' '}
          {t('about the word. Each answer can optionally be')}{' '}
          <Text style={styles.htpOrange}>{t('recorded as audio')}</Text>
          {'.'}
        </Text>
      ),
    },

    // ── Slide 5 · Discussion ──────────────────────────────────────────────
    {
      title: t('Discussion'),
      scene: (
        <View style={styles.htpDiscussionScene}>
          <Ionicons name="headset" size={moderateScale(30)} color={colors.orange[200]} style={{ marginBottom: verticalScale(4) }} />
          <View style={styles.htpDiscussionRow}>
            <Character mood="pedro" size={charSm} />
            <Character mood="pri" size={charMd} />
            <Character mood="risada" size={charSm} />
          </View>
        </View>
      ),
      text: (
        <Text style={styles.htpBody}>
          {t('After all rounds, review every')}{' '}
          <Text style={styles.htpOrange}>{t('question and answer')}</Text>
          {'. '}
          {t('Replay')}{' '}
          <Text style={styles.htpOrange}>{t('audio recordings')}</Text>
          {' '}
          {t('to catch inconsistencies. Share suspicions before the vote.')}
        </Text>
      ),
    },

    // ── Slide 6 · Vote ────────────────────────────────────────────────────
    {
      title: t('Vote'),
      scene: (
        <View style={styles.htpVotingScene}>
          {(['breno', 'sara', 'gabs', 'paola'] as const).map((name, i) => (
            <View key={name} style={styles.htpVotingSlot}>
              <Character mood={name} size={charSm} />
              {i === 2 && (
                <View style={styles.htpVoteCheck}>
                  <Ionicons name="checkmark-circle" size={moderateScale(20)} color={colors.orange[200]} />
                </View>
              )}
            </View>
          ))}
        </View>
      ),
      text: (
        <Text style={styles.htpBody}>
          {t('Each player votes')}{' '}
          <Text style={styles.htpOrange}>{t('privately')}</Text>
          {'. '}
          {t('You must select exactly as many suspects as there are')}{' '}
          <Text style={styles.htpOrange}>{t('impostors')}</Text>
          {' '}
          {t('configured for this game.')}
        </Text>
      ),
    },

    // ── Slide 7 · Impostor Guess ──────────────────────────────────────────
    {
      title: t('Impostor Guess'),
      scene: (
        <View style={styles.htpGuessScene}>
          <Character mood="ghost" size={charLg} flip />
          <View style={styles.htpGuessBubble}>
            <Ionicons name="help-circle" size={moderateScale(22)} color={colors.orange[200]} />
            <Text style={styles.htpGuessWordPlaceholder}>{'???'}</Text>
          </View>
        </View>
      ),
      text: (
        <Text style={styles.htpBody}>
          {t('After the vote, detected impostors get')}{' '}
          <Text style={styles.htpOrange}>{t('one chance')}</Text>
          {' '}
          {t('to guess the')}{' '}
          <Text style={styles.htpOrange}>{t('secret word')}</Text>
          {'. '}
          {t('A correct guess earns bonus points and can still turn the game around.')}
        </Text>
      ),
    },

    // ── Slide 8 · Scoring ─────────────────────────────────────────────────
    {
      title: t('Scoring'),
      scene: (
        <View style={styles.htpScoringScene}>
          <Ionicons name="trophy" size={moderateScale(32)} color={colors.orange[200]} />
          <View style={styles.htpScoringCharRow}>
            <Character mood="breno" size={charLg} />
            <Character mood="gabs" size={charMd} />
            <Character mood="paola" size={charSm} />
          </View>
        </View>
      ),
      text: (
        <View style={styles.htpScoringTable}>
          {/* Civilians */}
          <Text style={styles.htpScoringSection}>{t('Civilians')}</Text>
          <View style={styles.htpScoringRow}>
            <Text style={styles.htpBody}>{t('Detect 1 impostor')}</Text>
            <Text style={styles.htpScoringPts}>+2 pts</Text>
          </View>
          <View style={styles.htpScoringRow}>
            <Text style={styles.htpBody}>{t('Detect 2 impostors')}</Text>
            <Text style={styles.htpScoringPts}>+3 pts</Text>
          </View>
          <View style={styles.htpScoringRow}>
            <Text style={styles.htpBody}>{t('Detect all 3')}</Text>
            <Text style={styles.htpScoringPts}>+5 pts</Text>
          </View>

          <View style={styles.htpScoringDivider} />

          {/* Impostors */}
          <Text style={styles.htpScoringSection}>{t('Impostors')}</Text>
          <View style={styles.htpScoringRow}>
            <Text style={styles.htpBody}>{t('Each voter that misses you')}</Text>
            <Text style={styles.htpScoringPts}>+1 pt</Text>
          </View>
          <View style={styles.htpScoringRow}>
            <Text style={styles.htpBody}>{t('Never detected')}</Text>
            <Text style={styles.htpScoringPts}>+3/5/10</Text>
          </View>
          <View style={styles.htpScoringRow}>
            <Text style={styles.htpBody}>{t('Guess the word')}</Text>
            <Text style={styles.htpScoringPts}>+3 pts</Text>
          </View>
        </View>
      ),
    },
  ];

  const currentSlide = slides[slide];

  return (
    <Modal transparent={false} visible={showHowToPlay} animationType="slide">
      <View
        style={[
          styles.htpContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Header */}
        <View style={styles.htpHeader}>
          <Text style={styles.htpPageTitle}>{t('How to play')}</Text>
          <TouchableOpacity onPress={() => setShowHowToPlay(false)}>
            <Ionicons name="close" size={scale(24)} color={colors.orange[200]} />
          </TouchableOpacity>
        </View>

        {/* Scene */}
        <View style={[styles.htpSceneArea, { height: height * 0.35 }]}>
          {currentSlide.scene}
        </View>

        {/* Text content */}
        <ScrollView
          style={styles.htpTextArea}
          contentContainerStyle={styles.htpTextContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.htpSlideTitle}>{currentSlide.title}</Text>
          {currentSlide.text}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.htpNavigation}>
          <TouchableOpacity
            onPress={() => handleChangeSlide(-1)}
            disabled={slide === 0}
            style={[styles.htpNavBtn, slide === 0 && styles.htpNavBtnDisabled]}
          >
            <Ionicons
              name="arrow-back"
              size={scale(22)}
              color={slide === 0 ? colors.gray[300] : colors.orange[200]}
            />
          </TouchableOpacity>

          <View style={styles.htpDots}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setSlide(i)}>
                <View style={[styles.htpDot, i === slide && styles.htpDotActive]} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => handleChangeSlide(1)}
            disabled={slide === totalSlides - 1}
            style={[
              styles.htpNavBtn,
              slide === totalSlides - 1 && styles.htpNavBtnDisabled,
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={scale(22)}
              color={
                slide === totalSlides - 1 ? colors.gray[300] : colors.orange[200]
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SidebarMenu() {
  const [visible, setVisible] = useState(false);
  const [newGameModalOpen, setNewGameModalOpen] = useState(false);
  const [howToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [showForgotWord, setShowForgotWord] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showMatchHistory, setShowMatchHistory] = useState(false);
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

  const isForgotWordAvailable =
    game.players.length > 0 &&
    game.currentScreen !== '/createGame' &&
    game.currentScreen !== '/selectCategory';

  return (
    <>
      <View>
        <TouchableOpacity onPress={toggleMenu} style={styles.buttonContainer}>
          <Ionicons name="menu" size={scale(28)} color={colors.orange[200]} />
        </TouchableOpacity>
      </View>

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

              {/* ── Group 2: history ──────────────────────────────── */}
              <View style={styles.menuList}>
                <TouchableOpacity
                  style={[styles.menuItem, savedPlayers.length === 0 && styles.menuItemDisabled]}
                  onPress={() => savedPlayers.length > 0 && setShowPlayerStats(true)}
                >
                  <Ionicons
                    name="person-outline"
                    size={moderateScale(20)}
                    color={savedPlayers.length > 0 ? colors.orange[200] : colors.gray[300]}
                  />
                  <Text style={[styles.menuItemText, savedPlayers.length === 0 && styles.menuItemTextDisabled]}>
                    {t('Player stats')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, matchHistory.length === 0 && styles.menuItemDisabled]}
                  onPress={() => matchHistory.length > 0 && setShowMatchHistory(true)}
                >
                  <Ionicons
                    name="time-outline"
                    size={moderateScale(20)}
                    color={matchHistory.length > 0 ? colors.orange[200] : colors.gray[300]}
                  />
                  <Text style={[styles.menuItemText, matchHistory.length === 0 && styles.menuItemTextDisabled]}>
                    {t('Match history')}
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
                setShowHowToPlay={setHowToPlayModalOpen}
                showHowToPlay={howToPlayModalOpen}
              />

              <PlayerStats
                visible={showPlayerStats}
                onClose={() => setShowPlayerStats(false)}
              />

              <MatchHistory
                visible={showMatchHistory}
                onClose={() => setShowMatchHistory(false)}
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
  // ─── How To Play modal ──────────────────────────────────────────────────
  htpContainer: {
    flex: 1,
    backgroundColor: colors.background[100],
    paddingHorizontal: scale(20),
  },
  htpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  htpPageTitle: {
    fontFamily: 'Raleway-Medium',
    fontWeight: 'bold',
    fontSize: fontSize.xl,
    color: colors.orange[200],
  },
  htpSceneArea: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: verticalScale(8),
  },
  htpTextArea: {
    flex: 1,
  },
  htpTextContent: {
    paddingBottom: verticalScale(12),
  },
  htpSlideTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(20),
    color: colors.orange[200],
    marginBottom: verticalScale(8),
  },
  htpBody: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(14),
    color: colors.white[100],
    lineHeight: moderateScale(22),
  },
  htpOrange: {
    color: colors.orange[200],
    fontWeight: 'bold',
  },
  htpNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: colors.gray[300] + '30',
  },
  htpNavBtn: {
    padding: scale(8),
  },
  htpNavBtnDisabled: {
    opacity: 0.3,
  },
  htpDots: {
    flexDirection: 'row',
    gap: scale(6),
    alignItems: 'center',
  },
  htpDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: colors.gray[300] + '60',
  },
  htpDotActive: {
    backgroundColor: colors.orange[200],
    width: scale(10),
    height: scale(10),
  },
  // ── Slide 1 · Roles ──────────────────────────────────────────────────────
  htpSlide1Scene: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  htpCivilianCluster: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  htpVsDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  htpVsLine: {
    width: 1,
    height: verticalScale(20),
    backgroundColor: colors.gray[300] + '60',
  },
  htpVsText: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(11),
    color: colors.gray[300],
    letterSpacing: 1,
  },
  // ── Slide 2 · Setup ──────────────────────────────────────────────────────
  htpCenteredScene: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(10),
  },
  htpBadgeRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  htpBadge: {
    alignItems: 'center',
    gap: verticalScale(4),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(radius.sm),
    borderWidth: 1,
    borderColor: colors.orange[200] + '50',
  },
  htpBadgeLabel: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: colors.orange[200],
  },
  // ── Slide 3 · Reveal ─────────────────────────────────────────────────────
  htpRevealScene: {
    flexDirection: 'row',
    gap: scale(32),
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  htpRevealPlayer: {
    alignItems: 'center',
    gap: verticalScale(6),
  },
  htpRevealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(radius.pill),
  },
  htpRevealBadgeCivilian: {
    backgroundColor: colors.green[100] + '25',
    borderWidth: 1,
    borderColor: colors.green[100] + '60',
  },
  htpRevealBadgeImpostor: {
    backgroundColor: colors.red[200] + '25',
    borderWidth: 1,
    borderColor: colors.red[200] + '60',
  },
  htpRevealTextCivilian: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: colors.green[100],
  },
  htpRevealTextImpostor: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: colors.red[200],
  },
  // ── Slide 4 · Questions ──────────────────────────────────────────────────
  htpQuestionsScene: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: scale(16),
    width: '100%',
  },
  htpMicBubble: {
    backgroundColor: colors.orange[200] + '20',
    borderRadius: moderateScale(radius.pill),
    padding: scale(10),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: colors.orange[200] + '50',
  },
  // ── Slide 5 · Discussion ─────────────────────────────────────────────────
  htpDiscussionScene: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(8),
  },
  htpDiscussionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: scale(12),
  },
  // ── Slide 6 · Vote ───────────────────────────────────────────────────────
  htpVotingScene: {
    flexDirection: 'row',
    gap: scale(12),
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },
  htpVotingSlot: {
    alignItems: 'center',
    position: 'relative',
  },
  htpVoteCheck: {
    position: 'absolute',
    top: 0,
    right: -scale(6),
  },
  // ── Slide 7 · Impostor Guess ────────────────────────────────────────────
  htpGuessScene: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: scale(24),
    width: '100%',
  },
  htpGuessBubble: {
    alignItems: 'center',
    gap: verticalScale(6),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(radius.md),
    borderWidth: 1,
    borderColor: colors.orange[200] + '50',
    backgroundColor: colors.orange[200] + '10',
    marginBottom: verticalScale(8),
  },
  htpGuessWordPlaceholder: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    color: colors.orange[200],
    letterSpacing: 3,
  },
  // ── Slide 8 · Scoring ────────────────────────────────────────────────────
  htpScoringScene: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(6),
  },
  htpScoringCharRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: scale(16),
  },
  htpScoringTable: {
    gap: verticalScale(4),
  },
  htpScoringSection: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(13),
    color: colors.orange[200],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(2),
    marginTop: verticalScale(4),
  },
  htpScoringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(2),
  },
  htpScoringPts: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(13),
    color: colors.orange[200],
  },
  htpScoringDivider: {
    height: 1,
    backgroundColor: colors.gray[300] + '40',
    marginVertical: verticalScale(6),
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
