import { GameContext } from '@/context/GameContext';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
} from 'react-native';
import Button from '@/components/button';
import { colors } from '@/styles/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import Character from '@/components/character';
import Discussion from './discussion';
import WithSidebar from '@/components/withSideBar';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Dot from '@/components/dot';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function RoundScreen() {
  const {
    game,
    nextRound,
    previousRound,
    getCurrentQuestion,
    updateRoundAudio,
  } = useContext(GameContext);
  const { t } = useTranslation();
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState<
    ReturnType<typeof setTimeout> | undefined
  >();
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState<
    ReturnType<typeof setInterval> | undefined
  >();
  const [audioDuration, setAudioDuration] = useState<number | undefined>();
  const isStoppingRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | undefined>(undefined);

  const MAX_RECORDING_TIME = 40; // seconds

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (recordingTimer) {
        clearTimeout(recordingTimer);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [recording, recordingTimer, countdownInterval]);

  const totalRounds = game.players.length * 2;
  const round = game.rounds[game.currentRound - 1];

  // Load audio duration when audio exists
  useEffect(() => {
    const loadAudioDuration = async () => {
      if (round && round.audioUri) {
        try {
          const { sound } = await Audio.Sound.createAsync({
            uri: round.audioUri,
          });
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            const duration = Math.floor(status.durationMillis / 1000);
            setAudioDuration(duration);
          }
          await sound.unloadAsync();
        } catch (err) {
          console.error('Failed to load audio duration', err);
        }
      } else {
        setAudioDuration(undefined);
      }
    };

    loadAudioDuration();
  }, [round?.audioUri]);

  if (game.currentRound === totalRounds + 1) {
    return <Discussion />;
  }

  if (!round) {
    return null;
  }

  const playerThatAsks = round.playerThatAsks;
  const playerThatAnswers = round.playerThatAnswers;
  const question = t(getCurrentQuestion(), { ns: 'categories' });
  const currentRoundIndex = game.currentRound - 1;
  const hasAudio = !!round.audioUri;

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start countdown interval to update seconds
      const interval = setInterval(() => {
        setRecordingSeconds(prev => {
          const newValue = prev + 1;
          // Stop interval if we reach max time
          if (newValue >= MAX_RECORDING_TIME) {
            clearInterval(interval);
          }
          return newValue;
        });
      }, 1000);
      setCountdownInterval(interval);

      // Set timer to automatically stop recording after MAX_RECORDING_TIME
      const timer = setTimeout(async () => {
        if (recordingRef.current && !isStoppingRef.current) {
          await stopRecording();
        }
      }, MAX_RECORDING_TIME * 1000);

      setRecordingTimer(timer);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Failed to start recording');
    }
  };

  const stopRecording = async (roundIndex?: number) => {
    const currentRecording = recordingRef.current;
    if (!currentRecording || isStoppingRef.current) return;

    // Prevent multiple simultaneous stops
    isStoppingRef.current = true;

    try {
      // Clear the timer and interval if they exist
      if (recordingTimer) {
        clearTimeout(recordingTimer);
        setRecordingTimer(undefined);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(undefined);
      }

      setIsRecording(false);

      let duration = 0;
      let uri: string | null = null;

      try {
        // Check if recording is still valid
        const status = await currentRecording.getStatusAsync();

        if (status.durationMillis) {
          duration = Math.floor(status.durationMillis / 1000);
        }

        // Try to stop and unload the recording
        await currentRecording.stopAndUnloadAsync();
        uri = currentRecording.getURI();
      } catch (recordingErr) {
        // If recording is already stopped or invalid, just get the URI
        console.log(
          'Recording already stopped or invalid, attempting to get URI'
        );
        try {
          uri = currentRecording.getURI();
        } catch (uriErr) {
          console.error('Failed to get URI', uriErr);
        }
      }

      if (uri) {
        // Use provided roundIndex or fall back to currentRoundIndex
        const indexToUse =
          roundIndex !== undefined ? roundIndex : currentRoundIndex;
        updateRoundAudio(indexToUse, uri);
        if (duration > 0) {
          setAudioDuration(duration);
        }
      }

      setRecording(undefined);
      recordingRef.current = undefined;
      setRecordingSeconds(0);
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      isStoppingRef.current = false;
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleDeleteAudio = () => {
    updateRoundAudio(currentRoundIndex, undefined);
  };

  const handleNextRound = async () => {
    if (isRecording) {
      // Capture the current round index before navigation
      const roundIndexToSave = currentRoundIndex;
      await stopRecording(roundIndexToSave);
    }
    nextRound();
  };

  const handlePreviousRound = () => {
    previousRound();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <WithSidebar>
      <SafeAreaView
        style={{
          backgroundColor: colors.background[100],
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <View
          style={{
            marginLeft: scale(15),
            marginRight: scale(15),
            marginTop: verticalScale(30),
          }}
        >
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginVertical: verticalScale(12),
            }}
          >
            <Text style={styles.headerCategoryTitle}>
              {t('Round')} {game.currentRound} {t('of')} {totalRounds}
            </Text>
            <Dot color={colors.orange[200]} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerCategoryTitle}>{t('Category')}</Text>
              <Dot color={colors.orange[200]} />
              <Text style={styles.headerCategoryTitle}>
                {t(game.category || '')}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <View>
            <Text style={styles.playerName}>
              {playerThatAsks.name}{' '}
              <Text style={styles.playerThatAnswers}>{t('asks')}</Text>{' '}
              {playerThatAnswers.name}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Character mood={playerThatAsks.character} />
              <Character mood={playerThatAnswers.character} flip />
            </View>
          </View>
        </View>

        <View style={styles.audioControlsContainer}>
          {!hasAudio && (
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={handleRecordToggle}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={moderateScale(24)}
                color={colors.white[100]}
              />
              <Text style={styles.recordButtonText}>
                {isRecording
                  ? `${t('Stop Recording')} ${formatTime(recordingSeconds)}`
                  : t('Record Answer')}
              </Text>
            </TouchableOpacity>
          )}

          {hasAudio && !isRecording && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAudio}
            >
              <Ionicons
                name="trash"
                size={moderateScale(20)}
                color={colors.orange[200]}
              />
              <Text style={styles.deleteButtonText}>
                {t('Delete Audio')}{' '}
                {audioDuration !== undefined ? formatTime(audioDuration) : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.question}>{question}</Text>

        <View style={styles.buttonContainer}>
          <Button text={t('Continue')} onPress={handleNextRound} />
          <View style={styles.arrowButtonContainer}>
            {game.currentRound !== 1 ? (
              <TouchableOpacity onPress={handlePreviousRound}>
                <AntDesign
                  name="left"
                  size={moderateScale(24)}
                  color={colors.orange[200]}
                />
              </TouchableOpacity>
            ) : (
              <View style={{ height: verticalScale(24) }} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
    color: colors.white[100],
    textAlign: 'center',
  },
  playerName: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
    paddingHorizontal: scale(15),
    fontFamily: 'Ralway',
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: colors.white[100],
    textAlign: 'center',
  },
  playerThatAnswers: {
    color: colors.orange[200],
  },
  question: {
    fontSize: moderateScale(20),
    color: colors.white[100],
    fontFamily: 'Sigmar',
    padding: scale(15),
    textAlign: 'center',
    marginTop: scale(20),
  },
  audioControlsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(20),
    gap: verticalScale(10),
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orange[200],
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    gap: scale(6),
  },
  recordButtonActive: {
    backgroundColor: colors.red[200],
  },
  recordButtonText: {
    color: colors.white[100],
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: scale(2),
    borderColor: colors.orange[200],
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    gap: scale(6),
  },
  deleteButtonText: {
    color: colors.orange[200],
    fontSize: moderateScale(14),
    fontFamily: 'Raleway-Medium',
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
  arrowButtonContainer: {
    position: 'absolute',
    left: scale(5),
  },
});
