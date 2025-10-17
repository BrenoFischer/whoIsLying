import { GameContext } from '@/context/GameContext';
import React, { useContext } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { colors } from '@/styles/colors';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Player } from '@/types/Player';
import { useTranslation } from '@/translations';

interface SelectOneFromAllPlayersType {
  setPlayer: React.Dispatch<React.SetStateAction<Player | undefined>>
}

export default function SelectOneFromAllPlayers({setPlayer}: SelectOneFromAllPlayersType) {
    const { game } = useContext(GameContext);
    const { t } = useTranslation();

    const allPlayers = game.players

    return(
      <SafeAreaView
        style={[
          {
            backgroundColor: colors.background[100],
            overflow: 'hidden',
            height: '100%',
          },
        ]}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t('Select your name')}:</Text>
          <ScrollView>
            <View style={styles.allPlayersContainer}>
              {
                allPlayers.map(p => {
                return(
                  <TouchableOpacity key={p.id} style={styles.playerContainer} onPress={() => {setPlayer(p)}}>
                    <Text>{p.name}</Text>
                  </TouchableOpacity>
                )
              })
            }      
            </View>
          </ScrollView>
        </View>
    </SafeAreaView>
    )
  }

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(60)
  },
  allPlayersContainer: {
    alignItems: "center",
    gap: verticalScale(15)
  },
  title: {
    fontSize: moderateScale(23),
    fontFamily: 'Raleway-Medium',
    color: colors.orange[200],
    fontWeight: "bold",
    textAlign: 'center',
    marginBottom: verticalScale(30)
  },
  playerContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    borderWidth: scale(2),
    borderRadius: moderateScale(10),
    borderColor: colors.orange[200],
    paddingVertical: verticalScale(8),
    backgroundColor: colors.orange[200]
  },
});