import { useState } from 'react';
import { TouchableOpacity, View, TextInput, StyleSheet, Text } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import CustomModal from '../modal';
import Button from '../button';

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

  const handleSubmit = () => {
    editPlayer(player, newName);
  };

  const clickDeletePlayer = () => {
    setModalOpen(true)
  };

  const handleDeletePlayer = () => {
    deletePlayer(player.id)
    setModalOpen(false)
  };

  return (
    <View style={[styles.container, { borderColor: colors.orange[200] }]}>
      <CustomModal modalVisible={modalOpen} setModalVisible={setModalOpen}>
        <View>
          <Text style={styles.modalTitle}>Do you want to delete this player from the list?</Text>
          <Text style={styles.modalText}>All points the player currently has will be lost.</Text>
          <View style={styles.modalButtonsContainer}>
            <Button onPress={handleDeletePlayer} text='Confirm' />
            <Button onPress={() => { setModalOpen(false) }} text='Cancel' variants='secondary' />
          </View>
        </View>
      </CustomModal>
      <TextInput
        placeholder="Add a new name"
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
    fontSize: 20,
  },
  modalText: {
    marginTop: 20,
    textAlign: 'center',
  },
  modalButtonsContainer: {
    marginTop: 50,
    justifyContent: "space-around",
    alignItems: "center",
    gap: 20,
  },
  container: {
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.background[100],
  },
  textInput: {
    width: 200,
    paddingVertical: 20,
    marginLeft: 20,
    fontSize: 15,
    color: colors.white[100],
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
  },
  errorContainer: {
    backgroundColor: 'red',
  },
});
