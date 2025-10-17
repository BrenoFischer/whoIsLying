import Button from "@/components/button";
import Character from "@/components/character";
import PlayerModal from "@/components/playerModal";
import { GameContext } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import { Player } from "@/types/Player";
import { t } from "i18next";
import { useContext, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface ShowWordToSinglePlayerProps {
    player: Player
    setPlayer: React.Dispatch<React.SetStateAction<Player | undefined>>
    setShowForgotWord: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ShowWordToSinglePlayer({ player, setPlayer, setShowForgotWord }: ShowWordToSinglePlayerProps) {
const { game, getCurrentWord } = useContext(GameContext);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [isLyingPlayer, setIsLyingPlayer] = useState(false);
  const [rawWord, setRawWord] = useState('');

    const displayWord = wordRevealed
    ? isLyingPlayer
      ? t('You are be the impostor this round!')
      : rawWord ? t(rawWord, { ns: 'categories' }) : ''
    : '';

  const displaySubtitle = wordRevealed
    ? isLyingPlayer
      ? t("Pretend you know the word and try to discover it based on people's answers.")
      : t('Answer the questions based on this word, but make sure to not make it easy for the impostor to discover it.')
    : '';

  function handleRevealWord() {
    if(player) {
      const playerIsLying = game.lyingPlayer.id === player.id;
      setIsLyingPlayer(playerIsLying);
      setRawWord(getCurrentWord());
      setWordRevealed(true);
    }
  }

  function handleCloseWindow() {
    setPlayer(undefined)
    setShowForgotWord(false)
  }

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
              <View style={styles.headerContainer}>
                <View>
                  <Text style={styles.titleInformation}>{t('Pass device to:')}</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
                <Character mood={player.character} size="medium" />
              </View>
              <View style={styles.secretWordContainer}>
                <Text style={styles.secretWord}>{displayWord}</Text>
                <Text style={styles.subtitle}>{displaySubtitle}</Text>
              </View>
              <View style={styles.buttonContainer}>
                {wordRevealed === false ? (
                  <Button
                    text={t('Tap to reveal')}
                    onPress={handleRevealWord}
                    variants='primary'
                  />
                ) : (
                  <Button text={t('Got it!')} onPress={handleCloseWindow} />
                )}
              </View>
            </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  headerContainer: {
    marginLeft: scale(30),
    marginTop: verticalScale(60),
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalPlayerName: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(25),
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
  },
  titleInformation: {
    fontSize: moderateScale(18),
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    color: colors.orange[200],
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: colors.white[100],
  },
  secretWordContainer: {
    marginTop: verticalScale(100),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  secretWord: {
    color: colors.white[100],
    fontSize: moderateScale(26),
    textAlign: 'center',
    paddingHorizontal: scale(15),
  },
  subtitle: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: colors.orange[200],
    paddingHorizontal: scale(15),
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: verticalScale(10),
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.background[100],
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
});