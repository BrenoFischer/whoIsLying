import { GameContext } from '@/context/GameContext';
import React, { useContext, useEffect, useState } from 'react';
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
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Dot from '@/components/dot';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

export default function RoundScreen() {
  const { game, nextRound, previousRound, getCurrentQuestion } =
    useContext(GameContext);
  const [ isRecording, setIsRecording ] = useState(false);
  const { t } = useTranslation();

  const totalRounds = game.players.length * 2;

  if (game.currentRound === totalRounds + 1) {
    return <Discussion />;
  }

  const round = game.rounds[game.currentRound - 1];
  const playerThatAsks = round.playerThatAsks;
  const playerThatAnswers = round.playerThatAnswers;
  const question = t(getCurrentQuestion(), { ns: 'categories' });

  // Initialize the recorder with a preset
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  // This hook provides the real-time "timer" (currentTime)
  // The '100' is the update interval in milliseconds
  const recorderState = useAudioRecorderState(audioRecorder, 100);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        alert('Permission to access microphone was denied');
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    setIsRecording(true)
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    setIsRecording(false);
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
  }

  const formatTime = (miliSeconds: number) => {
    const totalSeconds = Math.floor(miliSeconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
  };

  const handleNextRound = () => {
    nextRound();
  };

  const handlePreviousRound = () => {
    previousRound();
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
        <View style={{ marginLeft: scale(15), marginRight: scale(15), marginTop: verticalScale(30) }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginVertical: verticalScale(30),
            }}
          >
            <Text style={styles.headerCategoryTitle}>
              {t('Round')} {game.currentRound} {t('of')} {totalRounds}
            </Text>
            <Dot color={colors.orange[200]} />
            <Text style={styles.headerCategoryTitle}>
              {t('Category')}
            </Text>
            <Dot color={colors.orange[200]} />
            <Text style={styles.headerCategoryTitle}>
              {t(game.category || '')}
            </Text>
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
            <View style={styles.recordingContainer}>
              {isRecording ?
                  <View style={{ justifyContent: "space-between", flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => {stopRecording()}}>
                      <FontAwesome6 name="circle-stop" size={24} color={colors.orange[200]} />
                    </TouchableOpacity>
                    <Text style={styles.recordingText}>
                      {formatTime(recorderState.durationMillis)}
                    </Text>
                    <View />
                  </View>
                :
                  <View style={{ justifyContent: "space-between", flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => {startRecording()}}>
                      <FontAwesome6 name="microphone" size={24} color={colors.orange[200]} />
                    </TouchableOpacity>
                    <Text style={styles.recordingText}>{audioRecorder.uri ? "Record a new answer" : "Record answer"}</Text>
                    <View />
                  </View>
              }
            </View>
          </View>
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
  recordingContainer: {
    marginTop: verticalScale(20),
    // alignItems: 'center',
    backgroundColor: colors.gray[300],
    paddingVertical: scale(15),
    paddingHorizontal: scale(15),
    width: scale(250),
    alignSelf: 'center',
    borderRadius: moderateScale(10),
  },
  recordingText: {
    fontSize: moderateScale(16),
    color: colors.orange[200],
    fontFamily: 'Ralway',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  question: {
    fontSize: moderateScale(18),
    color: colors.white[100],
    fontFamily: 'Sigmar',
    padding: scale(15),
    textAlign: 'center',
    marginTop: scale(50),
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
    left: scale(5)
  }
});
