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
import PlayerInput from '@/components/playerInput';
import ScreenLayout from '@/components/screenLayout';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';

interface SelectOneFromAllPlayersType {
  setPlayer: React.Dispatch<React.SetStateAction<Player | undefined>>
}

export default function SelectOneFromAllPlayers({setPlayer}: SelectOneFromAllPlayersType) {
    const { game } = useContext(GameContext);
    const { t } = useTranslation();

    const allPlayers = game.players

    return(
      <ScreenLayout>
        <View style={styles.container}>
          <Text style={styles.title}>{t('Forgot your word?')}</Text>
          <Text style={styles.subtitle}>{t('Select your name')}:</Text>
          <ScrollView>
            <View style={styles.allPlayersContainer}>
              {
                allPlayers.map(p => {
                return(
                  <TouchableOpacity key={p.id} onPress={() => {setPlayer(p)}}>
                    <PlayerInput
                      player={p}
                      notEditable
                    />
                  </TouchableOpacity>
                )
              })
            }      
            </View>
          </ScrollView>
        </View>
    </ScreenLayout>
    )
  }

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(spacing.md),
    marginBottom: verticalScale(spacing.lg),
  },

  allPlayersContainer: {
    alignItems: "center",
    gap: verticalScale(5)
  },

  title: {
    fontSize: fontSize.xl,
    fontFamily: 'Raleway-Medium',
    color: colors.orange[200],
    fontWeight: "bold",
    textAlign: 'center',
    paddingBottom: verticalScale(spacing.sm)
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Raleway-Medium',
    color: colors.white[100],
    textAlign: 'center',
    marginBottom: verticalScale(spacing.sm)
  }
});