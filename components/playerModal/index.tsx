import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Character from '../character';
import Button from '../button';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { useTranslation } from '@/translations';

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
  const { language, t } = useTranslation();
  const buttonText =
    t("I'm") +
    (language === 'en' ? ' ' : player.gender === 'woman' ? ' a ' : ' o ') +
    player.name;

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
              <Text style={styles.titleInformation}>
                {t('Pass device to:')}
              </Text>
              <Text style={styles.modalPlayerName}>{player.name}</Text>
            </View>
            <Character mood={player.character} />
          </View>
          <Button
            text={buttonText}
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
    fontSize: moderateScale(25),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  modalView: {
    margin: scale(20),
    backgroundColor: 'white',
    borderRadius: moderateScale(20),
    padding: scale(35),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(4),
    elevation: 5,
  },
  titleInformation: {
    fontSize: moderateScale(20),
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.black[100],
  },
});
