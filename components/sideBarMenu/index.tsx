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
import { colors } from '@/styles/colors';
import Button from '../button';
import Character from '../character';
import { useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import { Language, useTranslation } from '@/translations';
import CheckPlayerWord from '../forgotWord';
import { GameContext } from '@/context/GameContext';
import { radius } from '@/styles/radius';
import { spacing } from '@/styles/spacing';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import PlayerInput from '../playerInput';
import { fontSize } from '@/styles/fontSize';


interface HowToPlayProps {
  showHowToPlay: boolean;
  setShowHowToPlay: React.Dispatch<React.SetStateAction<boolean>>
}

function HowToPlay({showHowToPlay, setShowHowToPlay}: HowToPlayProps) {
  const [slide, setSlide] = useState(0);
  const totalSlides = 7
  const { t } = useTranslation();

  const handleChangeSlide = (amount: number) => {
    const newSlide = slide + amount;
    if(newSlide >= totalSlides) return;
    if(newSlide < 0) return;

    setSlide(newSlide)
  }

  const slides = [
    //Slide 1
    <View>
      <View style={styles.slideCharacterWrapper}>
        <Character mood="slide1" />
      </View>
      <Text style={styles.subtitleBlack}>{t('All players except')}{' '}
      <Text style={styles.specialText}>{t('one')}</Text>{' '}
      {t('receives a')}{' '}<Text style={styles.specialText}>{t('secret word')}</Text></Text>
      <Text style={styles.subtitleBlack}>{t('One random player is the')}{' '}
      <Text style={styles.specialText}>{t('impostor')}</Text>{' '}
      {t('for the round.')}
      </Text>
    </View>,

    //Slide 2
    <View>
      <View style={styles.slideCharacterWrapper}>
        <Character mood="slide2" />
      </View>
      <Text style={styles.subtitleBlack}><Text style={styles.specialText}>{t('Questions')}</Text>{' '}
      {t('are asked between players.')}{' '}</Text>
      <Text style={styles.subtitleBlack}>{t('Can you')}{' '}
      <Text style={styles.specialText}>{t('identify')}</Text>{' '}
      {t('who is')}{' '}
      <Text style={styles.specialText}>{t('pretending')}</Text>{' '}
      {t('to know the word? Will the')}{' '}
      <Text style={styles.specialText}>{t('impostor')}</Text>{' '}
      {t('be able to guess what the secret')}{' '}
      <Text style={styles.specialText}>{t('word')}</Text> {t('is?')}</Text>
    </View>,

    //Slide 3
    <View>
      <View style={styles.slideCharacterWrapper}>
        <Character mood="slide3" />
      </View>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>1.{' '}</Text>{t('Choose a category for the')}{' '}
        <Text style={styles.specialText}>{t('secret word')}{' '}</Text>{t('(e.g. Animals, Foods)')}.
      </Text>
      <Text style={styles.subtitleBlack}>
        {t('Questions will be based on the selected category')}.
      </Text>
            <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>2.{' '}</Text>{t('Enter the names of')}{' '}
        <Text style={styles.specialText}>{t('all players')}</Text>{' '}{t('who will participate')}.{' '}
      </Text>
      <Text style={styles.subtitleBlack}>{t('Each player will have a unique character')}.</Text>
    </View>,

    //Slide 4
    <View>
      <View style={styles.slideCharacterWrapper}>
        <Character mood="slide4" />
      </View>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>3.{' '}</Text>{t('Each player will see either the secret word or a message indicating they are')}
        {' '}
        <Text style={styles.specialText}>{t('the impostor')}</Text>.
      </Text>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>4.{' '}</Text>{t('Players ask each other')}{' '}
        <Text style={styles.specialText}>{t('questions')},{' '}</Text>{t('based on the secret word')}.
      </Text>
    </View>,

    //Slide 5
    <View>
      <View style={styles.slideCharacterWrapper}>
        <Character mood="slide5" />
      </View>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>5.{' '}</Text>{t('A round of')}{' '}
        <Text style={styles.specialText}>{t('discussion')}{' '}</Text>
        {t('may be needed — share your thoughts')}!
        </Text>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>6.{' '}</Text>{t('Each player')}{' '}
        <Text style={styles.specialText}>{t('votes')}{' '}</Text>
        {t('for who they think the impostor is')}.
      </Text>
    </View>,

    //Slide 6
    <View>
      <View style={styles.slideCharacterWrapper}>
        <Character mood="slide6" />
      </View>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>7.{' '}</Text>{t('The')}{' '}
        <Text style={styles.specialText}>{t('impostor')}</Text>{' '}
        {t('is revealed after all votes are counted')}.
        </Text>
        <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>8.{' '}</Text>{t("Now it's the")}{' '}
        <Text style={styles.specialText}>{t("impostor's")}{' '}</Text>
        {t("turn to guess the secret word")}.
        </Text>
    </View>,

    //Slide 7
    <View>
      <View style={styles.slideCharacterWrapper}>
        <Character mood="slide7" />
      </View>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>9.</Text>{' '}
        <Text style={styles.specialText}>{t("Scores")}</Text>{' '}
        {t("are calculated as follows")}:
      </Text>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>9.1.</Text>{t("Voted on the impostor")}{' '}
        <Text style={styles.specialText}>+3{' '}{t('points')}</Text>.
      </Text>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>9.2.</Text>{t("The impostor receives")}{' '}
        <Text style={styles.specialText}>+1{' '}{t('point')}{' '}</Text>{t('for every vote not on him')}.
      </Text>
      <Text style={styles.subtitleBlack}>
        <Text style={styles.specialText}>9.3.</Text>{t("The impostor receives")}{' '}
        <Text style={styles.specialText}>+2{' '}{t('points')}{' '}</Text>{t('if correctly guessed the secret word')}.
      </Text>
    </View>,
  ]

  return (
    <Modal
      transparent={false}
      visible={showHowToPlay}
      animationType="slide"
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.howToPlayContainer}>
          <View style={styles.howToPlayHeader}>
            <TouchableOpacity onPress={() => setShowHowToPlay(false)}>
              <Ionicons name="close" size={scale(28)} color={colors.orange[200]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.howToPlayContent}
            contentContainerStyle={styles.howToPlayContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {slides[slide]}
          </ScrollView>

          <View style={styles.howToPlayNavigation}>
            <TouchableOpacity onPress={() => handleChangeSlide(-1)}>
              <Ionicons name="arrow-back-outline" size={scale(28)} color={colors.orange[200]} />
            </TouchableOpacity>
            <Text style={styles.titleInformation}>
              {slide + 1}/{totalSlides}
            </Text>
            <TouchableOpacity onPress={() => handleChangeSlide(1)}>
              <Ionicons name="arrow-forward-outline" size={scale(28)} color={colors.orange[200]} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}


export default function SidebarMenu() {
  const [visible, setVisible] = useState(false);
  const [newGameModalOpen, setNewGameModalOpen] = useState(false);
  const [howToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [showForgotWord, setShowForgotWord] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const navigation = useNavigation();
  const { t, language, setLanguage } = useTranslation();
  const { game, createNewGame, getSortedPlayers } = useContext(GameContext);

  const toggleMenu = () => setVisible(!visible);

  const handleStartNewGame = () => {
    setNewGameModalOpen(!newGameModalOpen);
    createNewGame();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  const handleChangeLanguage = (lan: Language) => {
    if(lan === language) return;
    setLanguage(lan);
  };

  const isForgotWordAvailable = game.players.length > 0 && game.currentScreen !== '/createGame' && game.currentScreen !== '/selectCategory';

  return (
    <>
      <View>
        <TouchableOpacity onPress={toggleMenu} style={styles.buttonContainer}>
          <Ionicons name="menu" size={scale(28)} color={colors.orange[200]} />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={false}
        visible={visible}
        animationType="slide"
      >
        <SafeAreaProvider>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons name="close" size={scale(28)} color={colors.orange[200]} />
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

            <View style={styles.menuButtonContainer}>
              <Button
                text={t('Start a new game')}
                onPress={() => {
                  setNewGameModalOpen(true);
                }}
              />
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
                    variants='secondary'
                    onPress={() => {
                      setNewGameModalOpen(false);
                    }}
                  />
                </View>
              </>
            </CustomModal>

            <View style={styles.menuButtonContainer}>
              <Button
                text={t('Como jogar')}
                onPress={() => { setHowToPlayModalOpen(true) }}
              />
            </View>

            <HowToPlay setShowHowToPlay={setHowToPlayModalOpen} showHowToPlay={howToPlayModalOpen} />

            <View style={styles.menuButtonContainer}>
              <Button
                text={t('Ranking')}
                variants={game.players.length > 0 ? "secondary" : "disabled"}
                onPress={() => { setShowRanking(true) }}
              />
            </View>

            <Modal
              transparent={false}
              visible={showRanking}
              animationType="slide"
            >
              <SafeAreaProvider>
                <SafeAreaView style={styles.showRankingContainer}>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => setShowRanking(false)}>
                      <Ionicons name="close" size={scale(28)} color={colors.orange[200]} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.rankingTitleWrapper}>
                    <Text style={styles.rankingTitle}>{t('Leaderboard')}</Text>
                  </View>
                  <ScrollView
                    style={styles.rankingScrollView}
                    contentContainerStyle={styles.rankingScrollContent}
                  >
                    {getSortedPlayers().map((player) => (
                      <PlayerInput key={player.id} player={player} notEditable />
                    ))}
                  </ScrollView>
                </SafeAreaView>
              </SafeAreaProvider>
            </Modal>

            <View style={styles.menuButtonContainer}>
              <Button
                text={t('Forgot your word') + '?'}
                variants={isForgotWordAvailable ? "secondary" : "disabled"}
                onPress={() => { setShowForgotWord(true) }}
              />
            </View>

            <CheckPlayerWord showForgotWord={showForgotWord} setShowForgotWord={setShowForgotWord} />

            <View style={styles.sidebarBottomSpacer} />
          </ScrollView>
        </View>
        </SafeAreaView>
        </SafeAreaProvider>
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
    alignSelf: "flex-end"
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
    fontWeight: "bold",
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
  subtitleBlack: {
    fontFamily: 'Raleway-Medium',
    fontSize: moderateScale(16),
    color: colors.black[100],
    marginBottom: verticalScale(12),
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
  howToPlayContainer: {
    flex: 1,
    backgroundColor: colors.white[100],
  },
  howToPlayHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: scale(spacing.sm),
    paddingVertical: verticalScale(spacing.xs),
  },
  howToPlayContent: {
    flex: 1,
    paddingHorizontal: scale(spacing.md),
  },
  howToPlayContentContainer: {
    paddingBottom: verticalScale(spacing.md),
  },
  howToPlayNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(spacing.lg),
    paddingVertical: verticalScale(spacing.md),
    borderTopWidth: 1,
    borderTopColor: colors.orange[200],
  },
  slideCharacterWrapper: {
    marginBottom: verticalScale(20),
    alignItems: 'center',
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
