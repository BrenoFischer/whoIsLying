import { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { useTranslation } from '@/translations';
import CustomModal from '@/components/modal';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Dot from '@/components/dot';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { radius } from '@/styles/radius';
import { fontSize } from '@/styles/fontSize';
import { characters, CharacterTheme } from '@/data/imagesData';
import CharacterPicker from '@/components/characterPicker';
import ConfigMenu from '@/components/configMenu';

const MAX_PLAYERS = 10;

export default function CreateGame() {
  const { createGame, game, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/createGame');
  }, []);

  const [players, setPlayers] = useState<Player[]>(game.players);
  const [modalOpen, setModalOpen] = useState(false);
  const [characterPickerFilter, setCharacterPickerFilter] = useState<CharacterTheme | 'all'>('all');

  const usedCharacters = players.map(p => p.character);
  const availableCharacters = characters.filter(c => !usedCharacters.includes(c.name));

  const [currentImageName, setCurrentImageName] = useState<string>(() => {
    const used = game.players.map(p => p.character);
    return characters.find(c => !used.includes(c.name))?.name ?? characters[0].name;
  });

  // If the current preview image was taken by a just-added player, pick the next free one from the same theme, or if not possible, the next free one available
  useEffect(() => {
    const filteredAvailable = availableCharacters.filter(c => characterPickerFilter === 'all' || c.theme === characterPickerFilter);

    if (!filteredAvailable.some(c => c.name === currentImageName)) {
      setCurrentImageName(filteredAvailable[0]?.name ?? availableCharacters[0]?.name ?? characters[0].name);
    }
  }, [players, characterPickerFilter]);

  const currentImageTheme = characters.find(c => c.name === currentImageName)?.theme ?? 'male';
  const notAvailableToContinue = players.length < 3 || players.length > MAX_PLAYERS;

  function setNewPlayer({ id, name, theme }: Player) {
    if (players.length >= MAX_PLAYERS) return;
    setPlayers(prev => [
      { id, name, theme, character: currentImageName, score: 0 },
      ...prev,
    ]);
  }

  function editPlayer(player: Player, newName: string) {
    setPlayers(prev => prev.map(p =>
      p.id === player.id ? { ...p, name: newName } : p
    ));
  }

  function editCharacter(player: Player, newCharacter: string) {
    setPlayers(prev => prev.map(p =>
      p.id === player.id ? { ...p, character: newCharacter } : p
    ));
  }

  function deletePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function handleCreateGame() {
    createGame(players);
    router.replace('/showWordToAll');
  }

  function handleSelectCharacter(name: string) {
    setCurrentImageName(name);
    setModalOpen(false);
  }

  return (
    <ScreenLayout
      scrollable
      footer={
        notAvailableToContinue ? (
          <Button text={t('Create game')} onPress={handleCreateGame} variants="disabled" />
        ) : (
          <Button text={t('Create game')} onPress={handleCreateGame} />
        )
      }
      header={
        <View style={styles.headerContainer}>
          <Elipse top={-80} />
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: scale(5), flex: 1 }}>
            <TouchableOpacity onPress={() => router.replace('/selectCategory')}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerCategoryTitle}>
                {t('Game')} {game.currentMatch}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.headerCategoryTitle}>{t('Category')}</Text>
                <Dot color={colors.white[100]} />
                <Text style={styles.headerCategoryTitle}>{t(game.category || '')}</Text>
              </View>
            </View>
          </View>
          <ConfigMenu />
          <SidebarMenu />
        </View>
      }
    >
      <CustomModal modalVisible={modalOpen} setModalVisible={setModalOpen}>
        <TouchableOpacity style={{ position: 'absolute', top: scale(15), right: scale(15) }} onPress={() => setModalOpen(false)}>
          <MaterialIcons name="close" size={moderateScale(24)} color={colors.orange[200]} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{t('Choose your character')}</Text>

        <CharacterPicker
          availableCharacters={availableCharacters}
          onSelect={handleSelectCharacter}
          themeFilter={characterPickerFilter}
          onThemeFilterChange={setCharacterPickerFilter}
        />
      </CustomModal>
      <View>
        <View style={styles.topContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t(`Add players (3 to ${MAX_PLAYERS})`)}</Text>
          </View>
          <View style={styles.changeCharacterButtonContainer}>
            <TouchableOpacity
              onPress={() => setModalOpen(true)}
              style={styles.changeCharacterButton}
            >
              <MaterialCommunityIcons
                name="shuffle-variant"
                size={moderateScale(24)}
                color={colors.background[100]}
              />
              <Text style={styles.changeCharacterText}>{t('Change')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalOpen(true)}>
              <Character mood={currentImageName} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <NewPlayerInput
            disabled={players.length >= MAX_PLAYERS}
            setPlayer={players.length >= MAX_PLAYERS ? () => {} : setNewPlayer}
            currentPlayerTheme={currentImageTheme}
          />
          <View style={{ paddingTop: verticalScale(spacing.md) }}>
            <CustomText>{t('Players added')} - {players.length}</CustomText>
          </View>
          <View style={{ gap: verticalScale(spacing.xs) }}>
            {players.map(player => {
              const availableForPlayer = characters
                .filter(c => !usedCharacters.includes(c.name) || c.name === player.character)
                .map(c => c.name);
              return (
                <PlayerInput
                  key={player.id}
                  player={player}
                  editPlayer={editPlayer}
                  deletePlayer={deletePlayer}
                  availableImages={availableForPlayer}
                  editCharacter={editCharacter}
                />
              );
            })}
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: verticalScale(spacing.xs),
    paddingBottom: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
    flexDirection: 'row',
    alignItems: 'center',
  },
  topContainer: {
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.lg),
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(26),
    fontWeight: 'bold',
  },
  changeCharacterButtonContainer: {
    alignItems: 'center',
    gap: scale(8),
  },
  changeCharacterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    backgroundColor: colors.orange[200],
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.background[100],
  },
  changeCharacterText: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.background[100],
  },
  modalTitle: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
  },
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
  },
});
