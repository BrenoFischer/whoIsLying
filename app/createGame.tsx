import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { ToggleButton } from '@/components/toggleButton';

const MAX_PLAYERS = 10;

export default function CreateGame() {
  const { createGame, game, setCurrentScreen, setNumberOfImpostors, setRandomImpostors } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/createGame');
  }, []);

  const [players, setPlayers] = useState<Player[]>(game.players);
  const [modalOpen, setModalOpen] = useState(false);
  const [impostorConflictOpen, setImpostorConflictOpen] = useState(false);
  const [conflictImpostorCount, setConflictImpostorCount] = useState(1);
  const [conflictRandom, setConflictRandom] = useState(false);
  const [characterPickerFilter, setCharacterPickerFilter] = useState<
    CharacterTheme | 'all'
  >('all');

  const usedCharacters = players.map(p => p.character);
  const availableCharacters = characters.filter(
    c => !usedCharacters.includes(c.name)
  );

  const [currentImageName, setCurrentImageName] = useState<string>(() => {
    const used = game.players.map(p => p.character);
    return (
      characters.find(c => !used.includes(c.name))?.name ?? characters[0].name
    );
  });

  // If the current preview image was taken by a just-added player, pick the next free one from the same theme, or if not possible, the next free one available
  useEffect(() => {
    const filteredAvailable = availableCharacters.filter(
      c => characterPickerFilter === 'all' || c.theme === characterPickerFilter
    );

    if (!filteredAvailable.some(c => c.name === currentImageName)) {
      setCurrentImageName(
        filteredAvailable[0]?.name ??
          availableCharacters[0]?.name ??
          characters[0].name
      );
    }
  }, [players, characterPickerFilter]);

  const currentImageTheme =
    characters.find(c => c.name === currentImageName)?.theme ?? 'male';
  const notAvailableToContinue =
    players.length < 3 || players.length > MAX_PLAYERS;

  function setNewPlayer({ id, name, theme }: Player) {
    if (players.length >= MAX_PLAYERS) return;
    setPlayers(prev => [
      { id, name, theme, character: currentImageName, score: 0, matchScore: { scoreEvents: [], totalScore: 0 } },
      ...prev,
    ]);
  }

  function editPlayer(player: Player, newName: string) {
    setPlayers(prev =>
      prev.map(p => (p.id === player.id ? { ...p, name: newName } : p))
    );
  }

  function editCharacter(player: Player, newCharacter: string) {
    setPlayers(prev =>
      prev.map(p =>
        p.id === player.id ? { ...p, character: newCharacter } : p
      )
    );
  }

  function deletePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function handleCreateGame() {
    const maxImpostors = players.length - 2;
    if (!game.config.randomImpostors && game.config.numberOfImpostors > maxImpostors) {
      setConflictImpostorCount(maxImpostors);
      setImpostorConflictOpen(true);
      return;
    }
    createGame(players);
    router.replace('/showWordToAll');
  }

  function handleConflictCreateGame() {
    if (conflictRandom) {
      setRandomImpostors(true);
    } else {
      setNumberOfImpostors(conflictImpostorCount);
    }
    createGame(players);
    setImpostorConflictOpen(false);
    router.replace('/showWordToAll');
  }

  function handleSelectCharacter(name: string) {
    setCurrentImageName(name);
    setModalOpen(false);
  }

  return (
    <ScreenLayout
      scrollable
      style={impostorConflictOpen ? { opacity: 0.1 } : undefined}
      footer={
        notAvailableToContinue ? (
          <Button
            text={t('Create game')}
            onPress={handleCreateGame}
            variants="disabled"
          />
        ) : (
          <Button text={t('Create game')} onPress={handleCreateGame} />
        )
      }
      header={
        <View style={styles.headerContainer}>
          <Elipse top={-80} />
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: scale(5),
              flex: 1,
            }}
          >
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
                <Text style={styles.headerCategoryTitle}>
                  {t(game.category || '')}
                </Text>
              </View>
            </View>
          </View>
          <ConfigMenu />
          <SidebarMenu />
        </View>
      }
    >
      <CustomModal modalVisible={modalOpen} setModalVisible={setModalOpen}>
        <TouchableOpacity
          style={{ position: 'absolute', top: scale(15), right: scale(15) }}
          onPress={() => setModalOpen(false)}
        >
          <MaterialIcons
            name="close"
            size={moderateScale(24)}
            color={colors.orange[200]}
          />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{t('Choose your character')}</Text>

        <CharacterPicker
          availableCharacters={availableCharacters}
          onSelect={handleSelectCharacter}
          themeFilter={characterPickerFilter}
          onThemeFilterChange={setCharacterPickerFilter}
        />
      </CustomModal>

      <CustomModal
        modalVisible={impostorConflictOpen}
        setModalVisible={setImpostorConflictOpen}
      >
        <View style={styles.conflictModal}>
          <TouchableOpacity
            style={styles.conflictClose}
            onPress={() => setImpostorConflictOpen(false)}
          >
            <Ionicons name="close" size={moderateScale(22)} color={colors.orange[200]} />
          </TouchableOpacity>

          <Ionicons
            name="warning-outline"
            size={moderateScale(32)}
            color={colors.orange[200]}
            style={{ alignSelf: 'center' }}
          />
          <Text style={styles.conflictTitle}>{t('Too many impostors')}</Text>
          <Text style={styles.conflictMessage}>
            {t('With')} {players.length} {t('players, you can have at most')}{' '}
            <Text style={{ fontWeight: 'bold' }}>{players.length - 2}</Text>{' '}
            {players.length - 2 === 1 ? t('impostor') : t('impostors')}.
          </Text>

          <View
            style={[styles.conflictSettingRow, conflictRandom && styles.conflictSettingRowFaded]}
            pointerEvents={conflictRandom ? 'none' : 'auto'}
          >
            <View style={styles.conflictSettingLabel}>
              <Ionicons name="people" size={moderateScale(18)} color={colors.orange[200]} />
              <Text style={styles.conflictSettingLabelText}>{t('# of impostors')}</Text>
            </View>
            <View style={styles.conflictCounter}>
              <TouchableOpacity
                onPress={() => setConflictImpostorCount(c => Math.max(1, c - 1))}
                style={[styles.counterButton, conflictImpostorCount === 1 && styles.counterButtonDisabled]}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.counterValueContainer}>
                {conflictRandom ? (
                  <Ionicons name="shuffle" size={moderateScale(20)} color={colors.orange[200]} />
                ) : (
                  <Text style={styles.counterValue}>{conflictImpostorCount}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setConflictImpostorCount(c => Math.min(players.length - 2, c + 1))}
                style={[styles.counterButton, conflictImpostorCount === players.length - 2 && styles.counterButtonDisabled]}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.conflictSettingRow}>
            <View style={styles.conflictSettingLabel}>
              <Ionicons name="shuffle" size={moderateScale(18)} color={colors.orange[200]} />
              <Text style={styles.conflictSettingLabelText}>{t('Random & hidden')}</Text>
            </View>
            <ToggleButton value={conflictRandom} onValueChange={setConflictRandom} variant="secondary" />
          </View>

          <View style={{ paddingTop: verticalScale(spacing.xxl) }}>
            <Button text={t('Create game')} onPress={handleConflictCreateGame} />
          </View>
        </View>
      </CustomModal>

      <View>
        <View style={styles.topContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {t(`Add players (3 to ${MAX_PLAYERS})`)}
            </Text>
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
            <CustomText>
              {t('Players added')} - {players.length}
            </CustomText>
          </View>
          <View style={{ gap: verticalScale(spacing.xs) }}>
            {players.map(player => {
              const availableForPlayer = characters
                .filter(
                  c =>
                    !usedCharacters.includes(c.name) ||
                    c.name === player.character
                )
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
  conflictModal: {
    gap: verticalScale(spacing.xs),
  },
  conflictClose: {
    alignSelf: 'flex-end',
  },
  conflictTitle: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(18),
    color: colors.orange[200],
    textAlign: 'center',
  },
  conflictMessage: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(13),
    color: colors.black[100],
    textAlign: 'center',
    marginBottom: verticalScale(spacing.xs),
  },
  conflictSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300] + '40',
  },
  conflictSettingRowFaded: {
    opacity: 0.35,
  },
  conflictSettingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
    flexShrink: 1,
    marginRight: scale(spacing.md),
  },
  conflictSettingLabelText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: colors.black[100],
    flexShrink: 1,
  },
  conflictCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
  },
  counterButton: {
    width: scale(28),
    height: scale(28),
    borderRadius: moderateScale(radius.pill),
    backgroundColor: colors.orange[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  counterButtonText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: colors.white[100],
    lineHeight: moderateScale(18),
  },
  counterValueContainer: {
    width: scale(26),
    alignItems: 'center',
  },
  counterValue: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
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
