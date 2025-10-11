import { useState } from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import CustomModal from '../modal';
import Button from '../button';
import { useTranslation } from '@/translations';

interface PlayerInputProps {
  player: Player;
  editPlayer: (player: Player, newName: string) => void;
  deletePlayer: (id: string) => void;
}

export default function PlayerInput({
  editPlayer,
  player,
  deletePlayer,
}: PlayerInputProps) {
  const [newName, setNewName] = useState(player.name);
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = () => {
    editPlayer(player, newName);
  };

  const clickDeletePlayer = () => {
    setModalOpen(true);
  };

  const handleDeletePlayer = () => {
    deletePlayer(player.id);
    setModalOpen(false);
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
      <TextInput
        placeholder={t('Add a new name')}
        keyboardType="ascii-capable"
        inputMode="text"
        maxLength={15}
        style={styles.textInput}
        value={newName}
        onChangeText={text => setNewName(text)}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />
      <TouchableOpacity
        style={[styles.iconContainer]}
        onPress={clickDeletePlayer}
      >
        <EvilIcons name="trash" size={40} color="red" />
      </TouchableOpacity>
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
  textInput: {
    flex: 1,
    paddingVertical: verticalScale(18),
    marginLeft: scale(15),
    marginRight: scale(50),
    fontSize: moderateScale(15),
    color: colors.white[100],
  },
  iconContainer: {
    position: 'absolute',
    right: scale(10),
  },
  errorContainer: {
    backgroundColor: 'red',
  },
});
