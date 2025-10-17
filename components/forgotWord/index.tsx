import { GameContext } from '@/context/GameContext';
import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  Modal,
  StatusBar,
} from 'react-native';
import { colors } from '@/styles/colors';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Player } from '@/types/Player';
import ShowWordToSinglePlayer from './showWordToSinglePlayer';
import SelectOneFromAllPlayers from './selectOneFromAllPlayers';
import { Ionicons } from '@expo/vector-icons';


interface ForgotWordProps {
  showForgotWord: boolean;
  setShowForgotWord: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ForgotWord({showForgotWord, setShowForgotWord}: ForgotWordProps) {
  const [player, setPlayer] = useState<Player | undefined>(undefined)

  const handleCloseModal = () => {
    setShowForgotWord(false);
    setPlayer(undefined);
  }

  return (
      <Modal
        transparent={false}
        visible={showForgotWord}
        animationType="slide"
        statusBarTranslucent
      >
      <StatusBar backgroundColor={colors.background[100]} barStyle="light-content" />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCloseModal}>
          <Ionicons name="close" size={28} color={colors.orange[200]} />
        </TouchableOpacity>
      </View>
      {
        player ?
          <ShowWordToSinglePlayer player={player} setPlayer={setPlayer} setShowForgotWord={setShowForgotWord} />
        :
          <SelectOneFromAllPlayers setPlayer={setPlayer} />
      }
    </Modal>
    
  );
}


const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: verticalScale(50),
    right: scale(10),
    zIndex: 100,
    backgroundColor: colors.background[100],
    borderRadius: moderateScale(20),
    padding: scale(5),
  },
});
