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

export default function SidebarMenu() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedLanguage, setClickedLanguage] = useState<Language | undefined>(
    undefined
  );
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const navigation = useNavigation();
  const { t, language, setLanguage } = useTranslation();

  const { resetApp } = useAppReset();
  const toggleMenu = () => setVisible(!visible);

  const handleStartNewGame = () => {
    setModalOpen(!modalOpen);
    resetApp();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  const clickSetLanguage = (lan: Language) => {
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
            <Character mood="umpa" />
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
                  setModalOpen(true);
                }}
              />
            </View>

            <CustomModal
              setModalVisible={setModalOpen}
              modalVisible={modalOpen}
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
                      setModalOpen(false);
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
                  <View style={{ marginBottom: 30 }}>
                    <Text style={styles.titleInformation}>
                      {t('Do you want to change the language?')}
                    </Text>
                    <Text style={styles.altText}>
                      {t(
                        'Note that this will start a new game to be effective.'
                      )}
                    </Text>
                  </View>
                </View>
                <Character mood="bothCharacter" />
                <View style={{ gap: 40 }}>
                  <Button
                    text={t('Change language and start a new game')}
                    onPress={handleChangeLanguage}
                  />
                  <Button
                    text={t('Continue with current game')}
                    variants="secondary"
                    onPress={() => {
                      setLanguageModalOpen(false);
                    }}
                  />
                </View>
              </>
            </CustomModal>

            <Text style={styles.menuItem}>{t('📖 How to Play')}</Text>
            <Text style={styles.subtitle}>
              <Text style={styles.specialText}>{t('All players')}</Text>{' '}
              {t('except')} <Text style={styles.specialText}>{t('one')}</Text>{' '}
              {t('receive a secret')}{' '}
              <Text style={styles.specialText}>{t('word')}</Text>.{' '}
              {t('One random player is the')}{' '}
              <Text style={styles.specialText}>{t('impostor')}</Text>{' '}
              {t('for the round.')}
              <Text style={styles.specialText}>{t('Questions')}</Text>{' '}
              {t('are asked between players. Can you')}{' '}
              <Text style={styles.specialText}>{t('identify')}</Text>{' '}
              {t('who is')}{' '}
              <Text style={styles.specialText}>{t('pretending')}</Text>{' '}
              {t('to know the word? Will the')}{' '}
              <Text style={styles.specialText}>{t('impostor')}</Text>{' '}
              {t('be able to guess what the secret')}{' '}
              <Text style={styles.specialText}>{t('word')}</Text> {t('is?')}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>1.</Text> Enter the names of{' '}
              <Text style={styles.specialText}>all players</Text> who will
              participate.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>2.</Text> Choose a category for
              the <Text style={styles.specialText}>secret word</Text> (e.g.,
              Animals, Foods).
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>3.</Text> Each player will see
              either the secret word or a message indicating they are{' '}
              <Text style={styles.specialText}>the impostor</Text>.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>4.</Text> Players ask each other{' '}
              <Text style={styles.specialText}>questions</Text> based on the
              secret word.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>5.</Text> A round of{' '}
              <Text style={styles.specialText}>discussion</Text> may be
              needed—share your thoughts!
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>6.</Text> Each player{' '}
              <Text style={styles.specialText}>votes</Text> for who they think
              the impostor is.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>7.</Text> The{' '}
              <Text style={styles.specialText}>impostor</Text> is revealed after
              all votes are counted.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>8.</Text> Now it's the{' '}
              <Text style={styles.specialText}>impostor's</Text> turn to guess
              the secret word.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>9.</Text>{' '}
              <Text style={styles.specialText}>Scores</Text> are calculated as
              follows:
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>9.1.</Text> If you voted for the
              impostor <Text style={styles.specialText}>+3 points</Text>.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>9.2.</Text> If you are the
              impostor you receive{' '}
              <Text style={styles.specialText}>+1 point</Text> for every vote
              not on you.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>9.3.</Text> If you are the
              impostor and correctly guessed the secret word{' '}
              <Text style={styles.specialText}>+2 point</Text>.
            </Text>
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
    marginBottom: 30,
    alignItems: 'center',
  },
  languageLabel: {
    fontFamily: 'Raleway',
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
    marginBottom: 50,
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
});
