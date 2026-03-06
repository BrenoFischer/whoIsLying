import { GameContext } from '@/context/GameContext';
import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [player, setPlayer] = useState<Player | undefined>(undefined);
  const insets = useSafeAreaInsets();

  const handleCloseModal = () => {
    setShowForgotWord(false);
    setPlayer(undefined);
  }

  return (
      <Modal
        transparent={false}
        visible={showForgotWord}
        animationType="slide"
      >
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Ionicons name="close" size={scale(28)} color={colors.orange[200]} />
            </TouchableOpacity>
          </View>
          {
            player ?
              <ShowWordToSinglePlayer player={player} setPlayer={setPlayer} setShowForgotWord={setShowForgotWord} />
            :
              <SelectOneFromAllPlayers setPlayer={setPlayer} />
          }
        </View>
      </Modal>
    
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background[100],
  },
  buttonContainer: {
    zIndex: 100,
    backgroundColor: colors.background[100],
    borderRadius: moderateScale(20),
    padding: scale(5),
    alignSelf: 'flex-end',
  },
});
