import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import CustomModal from '@/components/modal';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import Button from '../button';
import Character from '../character';
import { useNavigation } from 'expo-router';
import { useAppReset } from '@/context/AppResetContext';
import { CommonActions } from '@react-navigation/native';
import { Language, useTranslation } from '@/translations';
import AntDesign from '@expo/vector-icons/AntDesign';


interface HowToPlayProps {
  showHowToPlay: boolean;
  setShowHowToPlay: React.Dispatch<React.SetStateAction<boolean>>
}

function HowToPlay({showHowToPlay, setShowHowToPlay}: HowToPlayProps) {
  const [slide, setSlide] = useState(0);
  const totalSlides = 7
  const { t, language, setLanguage } = useTranslation();

  if(!showHowToPlay) return;

  const handleChangeSlide = (amount: number) => {
    const newSlide = slide + amount;
    if(newSlide >= totalSlides) return;
    if(newSlide < 0) return;

    setSlide(newSlide)
  }

  const slides = [
    //Slide 1
    <View>
      <View style={{marginBottom: 20, alignItems: "center"}}>
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
      <View style={{marginBottom: 20, alignItems: "center"}}>
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
      <View style={{marginBottom: 20, alignItems: "center"}}>
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
      <View style={{marginBottom: 20, alignItems: "center"}}>
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
      <View style={{marginBottom: 20, alignItems: "center"}}>
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
      <View style={{marginBottom: 20, alignItems: "center"}}>
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
      <View style={{marginBottom: 20, alignItems: "center"}}>
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

  return(
    <CustomModal
      setModalVisible={setShowHowToPlay}
      modalVisible={showHowToPlay}
      fixedHeight={"70%"}
    >
        <View style={{ minWidth: "100%" }}>
          <View style={{marginBottom: 20, alignSelf: "flex-end"}}>
            <TouchableOpacity onPress={() => {setShowHowToPlay(false);}}>
              <Ionicons name="close" size={28} color={colors.orange[200]} />
            </TouchableOpacity>
          </View>
        </View>
        
        {slides[slide]}

        <View style={{position: "absolute", bottom: "5%",flexDirection: 'row', gap: 15}}>
            <TouchableOpacity onPress={()=>{ handleChangeSlide(-1) }}>
              <Ionicons name="arrow-back-outline" size={28} color={colors.orange[200]} />
            </TouchableOpacity>
            <Text style={styles.titleInformation}>
              {slide + 1}/{totalSlides}
            </Text>
            <TouchableOpacity onPress={()=>{ handleChangeSlide(1) }}>
              <Ionicons name="arrow-forward-outline" size={28} color={colors.orange[200]} />
            </TouchableOpacity>
          </View>
    </CustomModal>
  );
}


export default function SidebarMenu() {
  const [visible, setVisible] = useState(false);
  const [newGameModalOpen, setNewGameModalOpen] = useState(false);
  const [howToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [clickedLanguage, setClickedLanguage] = useState<Language | undefined>(
    undefined
  );
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const navigation = useNavigation();
  const { t, language, setLanguage } = useTranslation();

  const { resetApp } = useAppReset();
  const toggleMenu = () => setVisible(!visible);

  const handleStartNewGame = () => {
    setNewGameModalOpen(!newGameModalOpen);
    resetApp();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  const clickSetLanguage = (lan: Language) => {
    if(lan === language) return;
    setLanguageModalOpen(true);
    setClickedLanguage(lan);
  };

  const handleChangeLanguage = () => {
    setLanguage(clickedLanguage!);
    setLanguageModalOpen(false);
    handleStartNewGame();
  };

  return (
    <>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name="menu" size={28} color={colors.orange[200]} />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={visible} animationType="slide">
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="close" size={28} color={colors.orange[200]} />
          </TouchableOpacity>
        </View>
        <View style={styles.backdrop}>
          <ScrollView style={styles.sidebar}>
            <View style={{alignSelf: "center"}}>
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
                  onPress={() => clickSetLanguage('en')}
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
                  onPress={() => clickSetLanguage('pt')}
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

            <View style={styles.startNewGameContainer}>
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
                <View>
                  <View style={{ marginBottom: 30 }}>
                    <Text style={styles.titleInformation}>
                      {t('Do you want to:')}
                    </Text>
                  </View>
                </View>
                <Character mood="bothCharacter" />
                <View style={{ gap: 40 }}>
                  <Button
                    text={t('Start a fresh new game')}
                    onPress={handleStartNewGame}
                  />
                  <Button
                    text={t('Continue with current game')}
                    variants="secondary"
                    onPress={() => {
                      setNewGameModalOpen(false);
                    }}
                  />
                </View>
              </>
            </CustomModal>

            <CustomModal
              setModalVisible={setLanguageModalOpen}
              modalVisible={languageModalOpen}
            >
              <>
                <View>
                  <View style={{marginBottom: 15, alignSelf: "flex-end"}}>
                    <TouchableOpacity onPress={() => {setLanguageModalOpen(false);}}>
                      <Ionicons name="close" size={28} color={colors.orange[200]} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 30 }}>
                    <Text style={styles.titleInformation}>
                      {language === 'en' ? 
                        'Você deseja mudar o idioma?'
                        : 
                        'Do you want to change the language?'}
                    </Text>
                    <Text style={styles.altText}>
                      {language === 'en' ? 
                        'Note que isso irá iniciar um novo jogo para efetivar a mudança.'
                        : 
                        'Note that this will start a new game to be effective.'}
                    </Text>
                  </View>
                </View>
                <Character mood="bothCharacter" />
                <View style={{ gap: 40 }}>
                  <Button
                    text={language === 'en' ? 'Mudar idioma e iniciar novo jogo': 'Change language and start a new game'}
                    onPress={handleChangeLanguage}
                  />
                  <Button
                    text={language === 'en' ? 'Continuar jogo atual ': 'Continue with current game'}
                    variants="secondary"
                    onPress={() => {
                      setLanguageModalOpen(false);
                    }}
                  />
                </View>
              </>
            </CustomModal>

            <View style={styles.startNewGameContainer}>
              <Button
                text={t('Como jogar')}
                onPress={() => { setHowToPlayModalOpen(true) }}
              />
            </View>

            <HowToPlay setShowHowToPlay={setHowToPlayModalOpen} showHowToPlay={howToPlayModalOpen} />

            <View style={{ marginBottom: 150 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 100,
    backgroundColor: colors.background[100],
    borderRadius: 20,
    padding: 5,
  },
  languageContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  languageLabel: {
    fontFamily: 'Raleway',
    fontWeight: "bold",
    fontSize: 16,
    color: colors.white[100],
    marginBottom: 10,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  langButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  activeLangButton: {
    backgroundColor: colors.orange[200],
  },
  langText: {
    fontFamily: 'Raleway',
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  activeLangText: {
    color: colors.background[100],
  },
  startNewGameContainer: {
    marginVertical: "4%",
    alignSelf: "center",
  },
  backdrop: {
    flex: 1,
    flexDirection: 'row',
  },
  titleInformation: {
    fontSize: 20,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
  altText: {
    marginTop: 10,
    fontFamily: 'Raleway',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  sidebar: {
    width: width,
    backgroundColor: colors.background[100],
    padding: 40,
    paddingTop: 80,
    elevation: 5,
  },
  menuItem: {
    fontFamily: 'Sigmar',
    color: colors.orange[200],
    fontSize: 25,
    marginVertical: 15,
  },
  subtitle: {
    fontFamily: 'Raleway',
    fontSize: 18,
    color: colors.white[100],
    marginBottom: 20,
  },
  text: {
    fontFamily: 'Raleway',
    fontSize: 16,
    color: colors.white[100],
    marginBottom: 5,
  },
  specialText: {
    color: colors.orange[200],
    fontWeight: 'bold',
  },
  subtitleBlack: {
    fontFamily: 'Raleway',
    fontSize: 16,
    color: colors.black[100],
    marginBottom: 12,
  },
});
