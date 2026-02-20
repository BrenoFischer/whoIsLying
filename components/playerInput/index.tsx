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
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import CustomModal from '../modal';
import Button from '../button';
import { useTranslation } from '@/translations';
import Character from '../character';
import { fontSize } from '@/styles/fontSize';

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
  availableImages,
  editCharacter,
  notEditable = false,
}: PlayerInputProps) {
  const [newName, setNewName] = useState(player.name);
  const [modalOpen, setModalOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const { t } = useTranslation();

  const screenHeight = useWindowDimensions().height;
  const characterSize = screenHeight * 0.1;

  const handleSubmit = () => {
    if (editPlayer) {
      editPlayer(player, newName);
    }
  };

  const clickDeletePlayer = () => {
    setModalOpen(true);
  };

  const handleDeletePlayer = () => {
    if (deletePlayer){
      deletePlayer(player.id);
      setModalOpen(false);
    }
  };

  const handleSelectCharacter = (char: string) => {
    if(editCharacter) {
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
              onPress={() => {
                setModalOpen(false);
              }}
              text={t('Cancel')}
              variants="secondary"
            />
          </View>
        </View>
      </CustomModal>

      <CustomModal modalVisible={characterModalOpen} setModalVisible={setCharacterModalOpen}>
        <ScrollView style={styles.characterModalContainer}>
          <Text style={styles.characterModalTitle}>{t('Choose your character')}</Text>
          <View style={styles.imagesGrid}>
            {availableImages?.map((char) => (
              <View key={char} style={styles.imageItem}>
                <TouchableOpacity onPress={() => handleSelectCharacter(char)}>
                  <Character mood={char} size={80} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </CustomModal>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(10), paddingTop: verticalScale(10) }}>
        <View style={{ alignItems: 'center', gap: verticalScale(5) }}>
          <Text style={styles.playerScore}><Text style={styles.playerScoreValue}>{player.score} pts</Text></Text>
          { notEditable ?
            <Character mood={player.character} size={characterSize} />
          :
            <TouchableOpacity onPress={() => setCharacterModalOpen(true)}>
              <Character mood={player.character} size={characterSize} />
            </TouchableOpacity>
          }
        </View>
        <View style={{ flex: 1 }}>
          {notEditable ? 
              <View>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
            :
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
          }
        </View>
        { notEditable ? 
            <></>
          :
            <TouchableOpacity onPress={clickDeletePlayer}>
              <EvilIcons name="trash" size={35} color="red" />
            </TouchableOpacity>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  characterModalContainer: {
    maxHeight: verticalScale(400),
  },
  characterModalTitle: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
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
