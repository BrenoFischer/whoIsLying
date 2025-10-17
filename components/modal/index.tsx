import { Alert, DimensionValue, Modal, StyleSheet, View } from 'react-native';
import { colors } from '@/styles/colors';
import { ReactNode } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface ModalProps {
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  children: ReactNode;
  fixedHeight?: DimensionValue;
}

export default function CustomModal({
  modalVisible,
  setModalVisible,
  children,
  fixedHeight,
}: ModalProps) {
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
        <View
          style={[
            styles.modalView,
            fixedHeight ? { height: fixedHeight } : undefined,
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
