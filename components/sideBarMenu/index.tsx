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

export default function SidebarMenu() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigation = useNavigation();

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
            <View style={styles.startNewGameContainer}>
              <Button
                text="Start a new game"
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
                    <Text style={styles.titleInformation}>Do you want to:</Text>
                  </View>
                </View>
                <Character mood="bothCharacter" />
                <View style={{ gap: 40 }}>
                  <Button
                    text={'Start a fresh new game'}
                    onPress={handleStartNewGame}
                  />
                  <Button
                    text={'Continue with current game'}
                    variants="secondary"
                    onPress={() => {
                      setModalOpen(false);
                    }}
                  />
                </View>
              </>
            </CustomModal>

            <Text style={styles.menuItem}>📖 How to Play</Text>
            <Text style={styles.subtitle}>
              <Text style={styles.specialText}>All players</Text> except{' '}
              <Text style={styles.specialText}>one</Text> receive a secret{' '}
              <Text style={styles.specialText}>word</Text>. One random player is
              the <Text style={styles.specialText}>impostor</Text> for the
              round.
              <Text style={styles.specialText}>Questions</Text> are asked
              between players. Can you{' '}
              <Text style={styles.specialText}>identify</Text> who is{' '}
              <Text style={styles.specialText}>pretending</Text> to know the
              word? Will the <Text style={styles.specialText}>impostor</Text> be
              able to guess what the secret{' '}
              <Text style={styles.specialText}>word</Text> is?
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
              impostor – <Text style={styles.specialText}>+50 points</Text>.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>9.2.</Text> If you are the
              impostor and no one voted for you –{' '}
              <Text style={styles.specialText}>+50 points</Text>.
            </Text>
            <Text style={styles.text}>
              <Text style={styles.specialText}>9.3.</Text> If you are the
              impostor and correctly guessed the secret word –{' '}
              <Text style={styles.specialText}>+50 points</Text>.
            </Text>
            <View style={{ marginBottom: 50 }} />
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
    right: 20,
    zIndex: 100,
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
