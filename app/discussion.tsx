import Button from '@/components/button';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Elipse from '@/components/elipse';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import ScreenLayout from '@/components/screenLayout';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import SidebarMenu from '@/components/sideBarMenu';
import { Round } from '@/types/Round';

export default function Discussion() {
  const { game, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/discussion');
  }, []);

  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);

  const rounds = game.rounds;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
      allowsRecording: false,
    });
  }, []);

  const agregateByPlayerRounds = useMemo(() => {
    if (!game.rounds?.length) return [];

    let agregatedArray = [game.rounds[0]];

    for (let i = 1; i < rounds.length; i++) {
      let hasPlayer = false;
      let playerPosition = 0;
      const player = rounds[i].playerThatAnswers;

      agregatedArray.forEach((r, idx) => {
        if (r.playerThatAnswers.id === player.id) {
          hasPlayer = true;
          playerPosition = idx;
        }
      });
      if (hasPlayer) {
        agregatedArray = agregatedArray
          .slice(0, playerPosition)
          .concat([rounds[i]])
          .concat(agregatedArray.slice(playerPosition, agregatedArray.length));
      } else {
        agregatedArray = [...agregatedArray, rounds[i]];
      }
    }

    return agregatedArray;
  }, [game.rounds]);

  const handleToggleAudio = async (round: Round) => {
    if (!round.audio) return;

    try {
      if (!player) return;

      if (currentRoundId === round.id) {
        if (playerStatus.playing) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }

      if (player.playing) {
        player.pause();
      }
      player.replace({ uri: round.audio });
      player.play();
      setCurrentRoundId(round.id);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  };

  useEffect(() => {
    if (playerStatus.didJustFinish) {
      player.seekTo(0);
    }
  }, [playerStatus]);

  const handleNextPage = () => {
    router.replace('/votes');
  };

  const formatTime = (seconds?: number) => {
    if (!seconds || seconds < 0) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <ScreenLayout
      footer={<Button text={t('Continue')} onPress={handleNextPage} />}
      header={
        <>
          <Elipse left={scale(-20)} />
          <SidebarMenu />
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: spacing.lg,
              paddingHorizontal: spacing.sm,
            }}
          >
            <View style={{ paddingBottom: verticalScale(30) }}>
              <Text style={styles.title}>{t('Discussion time!')}</Text>
              <Text style={styles.subtitle}>
                {t(
                  'Review all questions and analyse each detail that was answered'
                )}
              </Text>
            </View>
          </View>
        </>
      }
    >
      <View style={styles.table}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {agregateByPlayerRounds.map((round, index) => {
            return (
              <View key={`${round.playerThatAnswers.id}-${index}`}>
                <Text style={styles.playerName}>
                  {round.playerThatAnswers.name}
                </Text>
                <Text style={styles.question}>
                  {t(round.question, { ns: 'categories' })}
                </Text>
                {round.audio && (
                  <View style={styles.audioContainer}>
                    <TouchableOpacity onPress={() => handleToggleAudio(round)}>
                      <FontAwesome6
                        name={
                          round.id === currentRoundId && playerStatus.playing
                            ? 'pause'
                            : 'play'
                        }
                        size={20}
                        color={colors.orange[200]}
                      />
                    </TouchableOpacity>

                    {currentRoundId === round.id && (
                      <Text
                        style={{
                          fontSize: moderateScale(14),
                          color: colors.white[100],
                        }}
                      >
                        {formatTime(playerStatus.currentTime)} /{' '}
                        {formatTime(playerStatus.duration)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xl,
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Raleway-Medium',
    textAlign: 'center',
    marginTop: verticalScale(4),
  },
  table: {
    padding: scale(20),
    marginHorizontal: scale(15),
    backgroundColor: colors.white[100],
    borderRadius: radius.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(8),
    elevation: 5,
    flex: 1,
  },
  playerName: {
    fontSize: moderateScale(17),
    fontFamily: 'Sigmar',
    color: colors.orange[200],
  },
  question: {
    fontSize: moderateScale(15),
    fontFamily: 'Raleway-Medium',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
    backgroundColor: colors.background[100],
    paddingVertical: scale(10),
    paddingHorizontal: scale(15),
    borderRadius: scale(10),
  },
});
