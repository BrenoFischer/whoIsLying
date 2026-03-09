import { useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { MaterialIcons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import CustomModal from '../modal';
import Button from '../button';
import { useTranslation } from '@/translations';
import Character from '../character';
import { fontSize } from '@/styles/fontSize';
import { characters } from '@/data/imagesData';
import CharacterPicker from '@/components/characterPicker';

interface PlayerInputProps {
  player: Player;
  editPlayer?: (player: Player, newName: string) => void;
  deletePlayer?: (id: string) => void;
  availableImages?: string[];
  editCharacter?: (player: Player, newCharacter: string) => void;
  notEditable?: boolean;
  showScore?: boolean;
  selected?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function PlayerInput({
  editPlayer,
  player,
  deletePlayer,
  availableImages = [],
  editCharacter,
  notEditable = false,
  showScore = true,
  selected = false,
  variant = 'primary',
}: PlayerInputProps) {
  const [newName, setNewName] = useState(player.name);
  const [modalOpen, setModalOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const { t } = useTranslation();

  const screenHeight = useWindowDimensions().height;
  const characterSize = screenHeight * 0.1;

  // Map the available image names back to CharacterData to get themes
  const availableCharacterData = characters.filter(c =>
    availableImages.includes(c.name)
  );

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

  const isSecondary = variant === 'secondary';

  return (
    <View
      style={[
        styles.container,
        isSecondary && styles.containerSecondary,
        selected && styles.containerSelected,
      ]}
    >
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

      <CustomModal
        modalVisible={characterModalOpen}
        setModalVisible={setCharacterModalOpen}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: scale(15), right: scale(15) }}
          onPress={() => setCharacterModalOpen(false)}
        >
          <MaterialIcons
            name="close"
            size={moderateScale(24)}
            color={colors.orange[200]}
          />
        </TouchableOpacity>

        <Text style={styles.characterModalTitle}>
          {t('Choose your character')}
        </Text>

        <CharacterPicker
          availableCharacters={availableCharacterData}
          onSelect={handleSelectCharacter}
        />
      </CustomModal>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(10),
          paddingTop: verticalScale(10),
        }}
      >
        <View style={{ alignItems: 'center', gap: verticalScale(5) }}>
          {showScore && (
            <Text style={styles.playerScore}>
              <Text style={styles.playerScoreValue}>{player.score} pts</Text>
            </Text>
          )}
          {notEditable ? (
            <Character mood={player.character} size={characterSize} />
          ) : (
            <TouchableOpacity onPress={() => setCharacterModalOpen(true)}>
              <Character mood={player.character} size={characterSize} />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={[
            { flex: 1 },
            notEditable && {
              alignSelf: 'stretch',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          {notEditable ? (
            <Text
              style={[
                styles.playerName,
                styles.playerNameCentered,
                isSecondary && styles.playerNameSecondary,
              ]}
            >
              {player.name}
            </Text>
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
    borderColor: colors.orange[200],
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    backgroundColor: colors.background[100],
  },
  containerSecondary: {
    width: '100%',
    maxWidth: undefined,
    backgroundColor: colors.white[100],
  },
  containerSelected: {
    backgroundColor: colors.orange[200],
  },
  playerName: {
    fontSize: fontSize.md,
    color: colors.white[100],
    flex: 1,
  },
  playerNameCentered: {
    textAlign: 'center',
    flex: 0,
  },
  playerNameSecondary: {
    color: colors.black[100],
    fontSize: fontSize.md,
    fontWeight: 'bold',
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
});
