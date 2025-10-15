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
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Dot from '@/components/dot';

const MAX_PLAYERS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const maleImagesBase = ['breno', 'umpa', 'risada', 'fabricin', 'gabs', 'pedro', 'bday', 'rock', 'ber'];
const femaleImagesBase = ['paola', 'sara', 'luh', 'pri', 'gio', 'ginger', 'eighties', 'highlight', 'surfer'];

export default function CreateGame() {
  const { createGame, game } = useContext(GameContext);
  const { t } = useTranslation();
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
    createGame(players);
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
        <Elipse top={-80} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <View>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginBottom: verticalScale(20),
                    gap: scale(5),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      router.back();
                    }}
                  >
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                  <View>
                    <Text style={styles.headerCategoryTitle}>
                      {t('Game')} {game.currentMatch} {t('of')}{' '}
                      {game.maximumMatches}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.headerCategoryTitle}>{t('Category')}</Text>
                      <Dot color={colors.white[100]} />
                      <Text style={styles.headerCategoryTitle}>{t(game.category || '')}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ marginTop: verticalScale(10) }}>
                  <Text style={styles.title}>{t('Add')}</Text>
                  <Text style={styles.title}>{t('players')}</Text>
                  <Text style={styles.title}>
                    (3 {t('to')} {MAX_PLAYERS})
                  </Text>
                </View>
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
                    alignItems: 'center',
                    gap: verticalScale(8),
                  }}
                >
                  <TouchableOpacity
                    onPress={handleChangeImage}
                    style={styles.changeCharacterButton}
                  >
                    <MaterialCommunityIcons
                      name="shuffle-variant"
                      size={moderateScale(24)}
                      color={colors.background[100]}
                    />
                    <Text style={styles.changeCharacterText}>
                      {t('Change')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleChangeImage}>
                    <Character
                      mood={
                        availableImages.length > 0
                          ? availableImages[currentImageIndex]
                          : imagesArray[0]
                      }
                    />
                  </TouchableOpacity>
                </View>
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
          </View>
        </ScrollView>
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
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  container: {
    marginTop: verticalScale(20),
  },
  modalContainer: {
    maxHeight: verticalScale(400),
  },
  modalHeaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    marginTop: verticalScale(10),
  },
  modalTitle: {
    fontSize: moderateScale(14),
    fontFamily: 'Ralway',
  },
  genderIconContainer: {
    position: 'absolute',
    left: 0,
  },
  imagesGrid: {
    marginTop: verticalScale(15),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scale(5),
  },
  imageItem: {
    width: '48%',
    marginVertical: verticalScale(3),
    alignItems: 'center',
  },
  headerContainer: {
    marginLeft: scale(20),
    marginRight: scale(20),
    marginTop: verticalScale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
  },

  title: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(26),
    fontWeight: 'bold',
  },

  playersAddedContainer: {
    marginTop: verticalScale(60),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.background[100],
  },
  changeCharacterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    backgroundColor: colors.orange[200],
    borderRadius: moderateScale(20),
    borderWidth: scale(2),
    borderColor: colors.background[100],
  },
  changeCharacterText: {
    fontSize: moderateScale(12),
    fontFamily: 'Raleway',
    fontWeight: "bold",
    color: colors.background[100],
  },
});
