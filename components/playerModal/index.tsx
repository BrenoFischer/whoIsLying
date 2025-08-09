import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import Character from '../character';
import Button from '../button';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';

interface PlayerModalProps {
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  player: Player;
}

export default function PlayerModal({
  modalVisible,
  setModalVisible,
  player,
}: PlayerModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.modalView}>
          <View>
            <View>
              <Text style={styles.titleInformation}>Pass device to:</Text>
              <Text style={styles.modalPlayerName}>{player.name}</Text>
            </View>
            <Character mood={player.character} />
          </View>
          <Button
            text={`I'm ${player.name}`}
            onPress={() => {
              setModalVisible(false);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalPlayerName: {
    fontFamily: 'Ralway',
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titleInformation: {
    fontSize: 20,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
});
