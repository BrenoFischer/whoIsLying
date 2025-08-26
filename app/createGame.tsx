import { useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Player } from '@/types/Player';
import NewPlayerInput from '@/components/newPlayerInput';
import CustomText from '@/components/text';
import Button from '@/components/button';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import Elipse from '@/components/elipse';
import PlayerInput from '@/components/playerInput';
import Character from '@/components/character';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';
import CustomModal from '@/components/modal';
import { MaterialIcons } from '@expo/vector-icons';

const MAX_PLAYERS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const maleImagesBase = ['breno', 'umpa', 'risada', 'fabricin', 'gabs', 'pedro'];
const femaleImagesBase = ['paola', 'sara', 'luh', 'pri', 'gio', 'ginger'];

export default function CreateGame() {
  const { createGame, game } = useContext(GameContext);
  const { language, t } = useTranslation();
  const [playerGender, setPlayerGender] = useState('man');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>(game.players);
  const [maleImages] = useState(() => shuffleArray(maleImagesBase));
  const [femaleImages] = useState(() => shuffleArray(femaleImagesBase));
  const [modalOpen, setModalOpen] = useState(false);

  const imagesArray = playerGender === 'man' ? maleImages : femaleImages;
  const usedCharacters = players.map(player => player.character);
  const availableImages = imagesArray.filter(
    image => !usedCharacters.includes(image)
  );

  const playerGenderIcon = playerGender === 'man' ? 'man-2' : 'woman';

  // Check available characters for each gender
  const availableMaleImages = maleImages.filter(
    image => !usedCharacters.includes(image)
  );
  const availableFemaleImages = femaleImages.filter(
    image => !usedCharacters.includes(image)
  );

  // Determine if gender should be locked (when one gender has no available characters)
  const shouldLockToMale =
    availableMaleImages.length > 0 && availableFemaleImages.length === 0;
  const shouldLockToFemale =
    availableFemaleImages.length > 0 && availableMaleImages.length === 0;
  const isGenderLocked = shouldLockToMale || shouldLockToFemale;

  const notAvailableToContinue =
    players.length < 3 || players.length > MAX_PLAYERS;

  // Auto-switch gender when current gender has no available characters
  useEffect(() => {
    if (shouldLockToMale && playerGender !== 'man') {
      setPlayerGender('man');
      setCurrentImageIndex(0);
    } else if (shouldLockToFemale && playerGender !== 'woman') {
      setPlayerGender('woman');
      setCurrentImageIndex(0);
    }
  }, [shouldLockToMale, shouldLockToFemale, playerGender]);

  function setNewPlayer({ id, name, gender }: Player) {
    if (players.length >= MAX_PLAYERS) return;

    const selectedCharacter =
      availableImages.length > 0
        ? availableImages[currentImageIndex]
        : imagesArray[0];
    setPlayers([
      { id, name, gender, character: selectedCharacter, score: 0 },
      ...players,
    ]);

    // Reset to first available character after adding a player
    setCurrentImageIndex(0);
  }

  function editPlayer(player: Player, newName: string) {
    const newPlayers = players.map(p => {
      if (p.id === player.id) {
        return Object.assign({}, p, { id: p.id, name: newName });
      }
      return p;
    });
  }

  function deletePlayer(id: string) {
    const newPlayers = players.filter(p => p.id !== id);

    setPlayers(newPlayers);
  }

  function handleCreateGame() {
    createGame(players, language);
    router.replace('/showWordToAll');
  }

  function handleChangeGender() {
    if (isGenderLocked) return;

    setCurrentImageIndex(0);
    if (playerGender === 'man') {
      setPlayerGender('woman');
    } else {
      setPlayerGender('man');
    }
  }

  function handleChangeImage() {
    setModalOpen(true);
  }

  function handleSelectCharacter(index: number) {
    setCurrentImageIndex(index);
    setModalOpen(false);
  }

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <Elipse top={-30} />
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <View>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginVertical: 12,
                  }}
                >
                  <Text style={styles.headerCategoryTitle}>
                    {t('Game')} {game.currentMatch} {t('of')}{' '}
                    {game.maximumMatches}
                  </Text>
                </View>
                <Text style={styles.title}>{t('Add')}</Text>
                <Text style={styles.title}>{t('players')}</Text>
                <Text style={styles.title}>
                  (3 {t('to')} {MAX_PLAYERS})
                </Text>
              </View>
              <View>
                <CustomModal
                  modalVisible={modalOpen}
                  setModalVisible={setModalOpen}
                >
                  <ScrollView style={styles.modalContainer}>
                    <View style={styles.modalHeaderContainer}>
                      <TouchableOpacity
                        onPress={handleChangeGender}
                        style={styles.genderIconContainer}
                      >
                        <MaterialIcons
                          name={playerGenderIcon}
                          size={32}
                          color={
                            isGenderLocked
                              ? colors.gray[100]
                              : colors.orange[200]
                          }
                        />
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>
                        {t('Choose your character')}
                      </Text>
                    </View>
                    <View style={styles.imagesGrid}>
                      {availableImages.map((char, idx) => {
                        return (
                          <View key={char} style={styles.imageItem}>
                            <TouchableOpacity
                              onPress={() => handleSelectCharacter(idx)}
                            >
                              <Character mood={char} size="small" />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </CustomModal>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                >
                  <TouchableOpacity onPress={handleChangeImage}>
                    <MaterialCommunityIcons
                      name="image-edit"
                      size={35}
                      color={colors.black[100]}
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.white[100],
                      fontWeight: 'bold',
                    }}
                  ></Text>
                </View>
                <Character
                  mood={
                    availableImages.length > 0
                      ? availableImages[currentImageIndex]
                      : imagesArray[0]
                  }
                />
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              {players.length >= MAX_PLAYERS ? (
                <NewPlayerInput
                  disabled={true}
                  setPlayer={() => {}}
                  currentPlayerGender={playerGender}
                />
              ) : (
                <NewPlayerInput
                  disabled={false}
                  setPlayer={setNewPlayer}
                  currentPlayerGender={playerGender}
                />
              )}
              <View style={styles.playersAddedContainer}>
                <CustomText>
                  {t('Players added')} - {players.length}
                </CustomText>
              </View>
              {players.map(player => (
                <PlayerInput
                  key={player.id}
                  player={player}
                  editPlayer={editPlayer}
                  deletePlayer={deletePlayer}
                />
              ))}
            </View>
            <View style={styles.buttonContainer}>
              {notAvailableToContinue ? (
                <Button
                  text={t('Create game')}
                  onPress={handleCreateGame}
                  variants="disabled"
                />
              ) : (
                <Button text={t('Create game')} onPress={handleCreateGame} />
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  modalContainer: {
    maxHeight: 400,
  },
  modalHeaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'Ralway',
  },
  genderIconContainer: {
    position: 'absolute',
    left: 0,
  },
  imagesGrid: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  imageItem: {
    width: '48%',
    marginVertical: 3,
    alignItems: 'center',
  },
  headerContainer: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: 14,
    fontFamily: 'Raleway-Medium',
  },

  title: {
    fontFamily: 'Ralway',
    fontSize: 26,
    fontWeight: 'bold',
  },

  playersAddedContainer: {
    marginTop: 60,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
