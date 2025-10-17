import Button from '@/components/button';
import Character from '@/components/character';
import Elipse from '@/components/elipse';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useContext, useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function Discussion() {
  const { game } = useContext(GameContext);
  const { t } = useTranslation();
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioDurations, setAudioDurations] = useState<{
    [key: string]: number;
  }>({});

  const rounds = game.rounds;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load durations for all audio files
  useEffect(() => {
    const loadDurations = async () => {
      const durations: { [key: string]: number } = {};
      const agregated = agregateByPlayer();

      for (let index = 0; index < agregated.length; index++) {
        const round = agregated[index];
        if (round.audioUri) {
          try {
            const { sound: tempSound } = await Audio.Sound.createAsync({
              uri: round.audioUri,
            });
            const status = await tempSound.getStatusAsync();
            if (status.isLoaded && status.durationMillis) {
              const audioId = `${round.playerThatAnswers.id}-${index}`;
              durations[audioId] = Math.floor(status.durationMillis / 1000);
            }
            await tempSound.unloadAsync();
          } catch (err) {
            console.error('Failed to load audio duration', err);
          }
        }
      }

      setAudioDurations(durations);
    };

    loadDurations();
  }, [rounds]);

  const agregateByPlayer = () => {
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
  };

  const playAudio = async (audioUri: string, audioId: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Set audio mode to use speakers instead of earpiece
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingAudioId(audioId);

      // Get initial duration
      const status = await newSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setDuration(Math.floor(status.durationMillis / 1000));
      }

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          // Update current time
          setCurrentTime(Math.floor(status.positionMillis / 1000));

          if (status.didJustFinish) {
            setPlayingAudioId(null);
            setCurrentTime(0);
          }
        }
      });
    } catch (err) {
      console.error('Failed to play audio', err);
      alert('Failed to play audio');
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(undefined);
      setPlayingAudioId(null);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioToggle = async (audioUri: string, audioId: string) => {
    if (playingAudioId === audioId) {
      await stopAudio();
    } else {
      await playAudio(audioUri, audioId);
    }
  };

  const handleNextPage = () => {
    router.replace('/votes');
  };

  const agregatedArray = agregateByPlayer();

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <Elipse left={scale(-20)} />
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: verticalScale(60),
          }}
        >
          <View style={{ marginBottom: verticalScale(30) }}>
            <Text style={styles.title}>{t('Discussion time!')}</Text>
            <Text style={styles.subtitle}>
              {t(
                'Review all questions and analyse each detail that was answered'
              )}
            </Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.table}>
            {agregatedArray.map((round, index) => {
              const audioId = `${round.playerThatAnswers.id}-${index}`;
              const isPlaying = playingAudioId === audioId;

              return (
                <View key={audioId}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.playerName}>
                      {round.playerThatAnswers.name}
                    </Text>
                  </View>
                  <View style={styles.questionBody}>
                    <Text style={styles.question}>
                      {t(round.question, { ns: 'categories' })}
                    </Text>
                    {round.audioUri && (
                      <TouchableOpacity
                        style={[
                          styles.playButton,
                          isPlaying && styles.playButtonActive,
                        ]}
                        onPress={() =>
                          handleAudioToggle(round.audioUri!, audioId)
                        }
                      >
                        <View style={styles.playButtonContent}>
                          <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={moderateScale(18)}
                            color={colors.white[100]}
                          />
                          {isPlaying ? (
                            <Text style={styles.timerText}>
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </Text>
                          ) : audioDurations[audioId] !== undefined ? (
                            <Text style={styles.timerText}>
                              {formatTime(audioDurations[audioId])}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button text={t('Continue')} onPress={handleNextPage} />
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  title: {
    fontSize: moderateScale(30),
    maxWidth: scale(250),
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    fontFamily: 'Raleway-Medium',
    maxWidth: scale(250),
    textAlign: 'center',
    marginTop: verticalScale(4),
  },
  table: {
    gap: verticalScale(18),
    padding: scale(20),
    marginHorizontal: scale(25),
    marginBottom: verticalScale(15),
    backgroundColor: colors.white[100],
    borderRadius: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionBody: {
    gap: verticalScale(3),
  },
  playerName: {
    fontSize: moderateScale(17),
    fontFamily: 'Sigmar',
    color: colors.orange[200],
  },
  playButton: {
    backgroundColor: colors.orange[200],
    borderRadius: moderateScale(14),
    padding: scale(8),
    width: '100%',
    alignSelf: 'center',
  },
  playButtonActive: {
    backgroundColor: colors.red[200],
  },
  playButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  timerText: {
    position: 'absolute',
    right: scale(8),
    color: colors.white[100],
    fontSize: moderateScale(12),
    fontFamily: 'Raleway-Medium',
  },
  question: {
    fontSize: moderateScale(15),
    fontFamily: 'Raleway-Medium',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.background[100],
  },
});
