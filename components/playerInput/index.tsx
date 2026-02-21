import { useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Text,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import CustomModal from '../modal';
import Button from '../button';
import { useTranslation } from '@/translations';
import Character from '../character';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import { characters, themes, CharacterTheme } from '@/data/imagesData';

interface PlayerInputProps {
  player: Player;
  editPlayer?: (player: Player, newName: string) => void;
  deletePlayer?: (id: string) => void;
  availableImages?: string[];
  editCharacter?: (player: Player, newCharacter: string) => void;
  notEditable?: boolean;
}

export default function PlayerInput({
  editPlayer,
  player,
  deletePlayer,
  availableImages = [],
  editCharacter,
  notEditable = false,
}: PlayerInputProps) {
  const [newName, setNewName] = useState(player.name);
  const [modalOpen, setModalOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [characterThemeFilter, setCharacterThemeFilter] = useState<CharacterTheme | 'all'>('all');
  const { t } = useTranslation();

  const screenHeight = useWindowDimensions().height;
  const characterSize = screenHeight * 0.1;

  // Map the available image names back to CharacterData to get themes
  const availableCharacterData = characters.filter(c => availableImages.includes(c.name));

  const filteredCharacters = characterThemeFilter === 'all'
    ? availableCharacterData
    : availableCharacterData.filter(c => c.theme === characterThemeFilter);

  function hasAvailableForTheme(theme: CharacterTheme) {
    return availableCharacterData.some(c => c.theme === theme);
  }

  function themeIconColor(theme: CharacterTheme): string {
    if (characterThemeFilter === theme) return colors.white[100];
    return colors.orange[200];
  }

  const handleSubmit = () => {
    if (editPlayer) editPlayer(player, newName);
  };

  const handleDeletePlayer = () => {
    if (deletePlayer) {
      deletePlayer(player.id);
      setModalOpen(false);
    }
  };

  const handleSelectCharacter = (char: string) => {
    if (editCharacter) {
      editCharacter(player, char);
      setCharacterModalOpen(false);
    }
  };

  return (
    <View style={[styles.container, { borderColor: colors.orange[200] }]}>
      <CustomModal modalVisible={modalOpen} setModalVisible={setModalOpen}>
        <View>
          <Text style={styles.modalTitle}>
            {t('Do you want to delete this player from the list?')}
          </Text>
          <Text style={styles.modalText}>
            {t('All points the player currently has will be lost.')}
          </Text>
          <View style={styles.modalButtonsContainer}>
            <Button onPress={handleDeletePlayer} text={t('Confirm')} />
            <Button
              onPress={() => setModalOpen(false)}
              text={t('Cancel')}
              variants="secondary"
            />
          </View>
        </View>
      </CustomModal>

      <CustomModal modalVisible={characterModalOpen} setModalVisible={setCharacterModalOpen}>
        <TouchableOpacity style={{ position: 'absolute', top: scale(15), right: scale(15) }} onPress={() => setCharacterModalOpen(false)}>
          <MaterialIcons name="close" size={moderateScale(24)} color={colors.orange[200]} />
        </TouchableOpacity>

        <Text style={styles.characterModalTitle}>{t('Choose your character')}</Text>

        <View style={styles.themeFilterRow}>
          <TouchableOpacity
            onPress={() => setCharacterThemeFilter('all')}
            style={[styles.themeButton, characterThemeFilter === 'all' && styles.themeButtonSelected]}
          >
            <Text style={[
              styles.themeAllText,
              characterThemeFilter === 'all' && styles.themeAllTextSelected,
            ]}>
              {t('All')}
            </Text>
          </TouchableOpacity>

          <View style={styles.themeSeparator} />

          {themes.map(theme => (
            <TouchableOpacity
              key={theme}
              onPress={() => setCharacterThemeFilter(theme)}
              style={[
                styles.themeButton,
                characterThemeFilter === theme && styles.themeButtonSelected,
                !hasAvailableForTheme(theme) && styles.themeButtonUnavailable,
              ]}
            >
              {theme === 'male' && (
                <MaterialIcons name="man" size={moderateScale(20)} color={themeIconColor(theme)} />
              )}
              {theme === 'female' && (
                <MaterialIcons name="woman" size={moderateScale(20)} color={themeIconColor(theme)} />
              )}
              {theme === 'halloween' && (
                <MaterialCommunityIcons name="ghost-outline" size={moderateScale(20)} color={themeIconColor(theme)} />
              )}
              {theme === 'music' && (
                <MaterialCommunityIcons name="music-note" size={moderateScale(20)} color={themeIconColor(theme)} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.characterModalContainer}>
          {filteredCharacters.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('No more available images for this theme')}</Text>
            </View>
          ) : (
            <View style={styles.imagesGrid}>
              {filteredCharacters.map(char => (
                <View key={char.name} style={styles.imageItem}>
                  <TouchableOpacity onPress={() => handleSelectCharacter(char.name)}>
                    <Character mood={char.name} size={80} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </CustomModal>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10), paddingTop: verticalScale(10) }}>
        <View style={{ alignItems: 'center', gap: verticalScale(5) }}>
          <Text style={styles.playerScore}><Text style={styles.playerScoreValue}>{player.score} pts</Text></Text>
          {notEditable ? (
            <Character mood={player.character} size={characterSize} />
          ) : (
            <TouchableOpacity onPress={() => setCharacterModalOpen(true)}>
              <Character mood={player.character} size={characterSize} />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {notEditable ? (
            <Text style={styles.playerName}>{player.name}</Text>
          ) : (
            <TextInput
              placeholder={t('Add a new name')}
              keyboardType="ascii-capable"
              inputMode="text"
              maxLength={15}
              style={styles.playerName}
              value={newName}
              onChangeText={text => setNewName(text)}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
            />
          )}
        </View>
        {!notEditable && (
          <TouchableOpacity onPress={() => setModalOpen(true)}>
            <EvilIcons name="trash" size={35} color="red" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    maxWidth: scale(280),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: scale(2),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(10),
    paddingHorizontal: scale(10),
    backgroundColor: colors.background[100],
  },
  playerName: {
    fontSize: fontSize.md,
    color: colors.white[100],
    flex: 1,
  },
  playerScore: {
    fontSize: fontSize.sm,
    color: colors.white[100],
  },
  playerScoreValue: {
    color: colors.orange[200],
    fontWeight: 'bold',
  },
  // Delete modal
  modalTitle: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(20),
  },
  modalText: {
    marginTop: verticalScale(20),
    textAlign: 'center',
  },
  modalButtonsContainer: {
    marginTop: verticalScale(50),
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: verticalScale(20),
  },
  // Character modal
  characterModalTitle: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
  },
  themeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    gap: scale(4),
  },
  themeButton: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  themeButtonSelected: {
    backgroundColor: colors.orange[200],
  },
  themeButtonUnavailable: {
    opacity: 0.3,
  },
  themeAllText: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  themeAllTextSelected: {
    color: colors.white[100],
  },
  themeSeparator: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.white[100],
    opacity: 0.4,
    marginHorizontal: scale(4),
  },
  characterModalContainer: {
    height: verticalScale(350),
  },
  emptyContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    color: colors.gray[100],
    textAlign: 'center',
  },
  imagesGrid: {
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
});
