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
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import Elipse from '@/components/elipse';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

export default function RoundScreen() {
  const { game, nextRound, previousRound, getCurrentQuestion, saveRecordingToRound, getRoundAudio, setCurrentScreen } =
    useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/round');
  }, []);

  const [ isRecording, setIsRecording ] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null >(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 900);

  useEffect(() => {
    const currentAudio = getRoundAudio();
    setAudioUri(currentAudio ?? null); 
  }, [game.currentRound]);

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

  const totalRounds = game.players.length * 2;

  useEffect(() => {
    if (game.currentRound === totalRounds + 1) {
      router.replace('/discussion');
    }
  }, [game.currentRound, totalRounds]);

  const round = game.rounds[game.currentRound - 1];

  if (!round) {
    return null; 
  }

  const playerThatAsks = round.playerThatAsks;
  const playerThatAnswers = round.playerThatAnswers;
  const question = t(getCurrentQuestion(), { ns: 'categories' });

  const startRecording = async () => {
    setIsRecording(true)
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record({ forDuration: 50 });
  };

  const handleStopRecording = async () => {
    if (!recorderState.isRecording) return;

    setIsRecording(false);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (uri) {
        // Delete the previous recording for this round if one exists (re-record case)
        if (audioUri) {
          try {
            new FileSystem.File(audioUri).delete();
          } catch (e) {
            console.warn('Failed to delete previous audio file:', e);
          }
        }
        // Copy to a unique file so subsequent recordings don't overwrite this one
        const dest = new FileSystem.File(FileSystem.Paths.cache, `round_${round.id}_${Date.now()}.m4a`);
        new FileSystem.File(uri).copy(dest);
        saveRecordingToRound(dest.uri);
        setAudioUri(dest.uri);
      }
    } catch (e) {
      console.warn("Stop recording error:", e);
    }
  };

  const formatTime = (miliSeconds: number) => {
    const totalSeconds = Math.floor(miliSeconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
  };

  const handleNextRound = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    nextRound();
  };

  const handlePreviousRound = async () => {
    if (isRecording) {
      await handleStopRecording();
    }
    previousRound();
  };

  return (
    <ScreenLayout
      header={
        <View style={styles.headerContainer}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: scale(5),
              flex: 1,
            }}
          >
            <Text style={styles.headerCategoryTitle}>
              {t('Round')} {game.currentRound} {t('of')} {totalRounds}
            </Text>
            <Dot color={colors.orange[200]} />
            <Text style={styles.headerCategoryTitle}>
              {t(game.category || '')}
            </Text>
          </View>
          <SidebarMenu />
        </View>
      }

      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(spacing.sm) }}>
          <View style={styles.leftFooterArea}>
            <TouchableOpacity
              onPress={handlePreviousRound}
              style={styles.arrowTouchable}
              disabled={game.currentRound === 1 || isRecording}
            >
              <AntDesign
                name="left"
                size={moderateScale(24)}
                color={(game.currentRound === 1 || isRecording) ? colors.gray[300] : colors.orange[200]}
              />
            </TouchableOpacity>
          </View>

          <View>
            <Button 
              text={isRecording ? t('Recording...') : t('Continue')}
              onPress={handleNextRound}
              variants={isRecording ? 'disabled' : 'primary'} />
          </View>

          <View style={styles.rightFooterArea} />
        </View>
      }
    >
      <View>
        <Text style={styles.playerName}>
          {playerThatAsks.name}{' '}
          <Text style={styles.playerThatAnswers}>{t('asks')}</Text>{' '}
          {playerThatAnswers.name}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Character mood={playerThatAsks.character} />
          <Character mood={playerThatAnswers.character} flip />
        </View>
        <View style={styles.recordingContainer}>
          {isRecording ?
            <View style={{ justifyContent: "space-between", flexDirection: 'row' }}>
              <TouchableOpacity onPress={handleStopRecording}>
                <FontAwesome6 name="circle-stop" size={24} color={colors.orange[200]} />
              </TouchableOpacity>
              <Text style={styles.recordingText}>
                {formatTime(recorderState.durationMillis)}
              </Text>
              <View />
            </View>
          :
            <TouchableOpacity onPress={() => {startRecording()}}>
              <View style={{ justifyContent: "space-between", flexDirection: 'row' }}>
                <FontAwesome6 name="microphone" size={24} color={colors.orange[200]} />
                <Text style={styles.recordingText}>{audioUri ? "Record a new answer" : "Record answer"}</Text>
                <View />
              </View>
            </TouchableOpacity>
          }
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.question}>{question}</Text>
        </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    flexDirection: "row", 
    alignItems: "center" ,
    paddingHorizontal: scale(spacing.md)
  },
  headerCategoryTitle: {
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    color: colors.white[100],
    textAlign: 'center',
  },
  playerName: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(5),
    fontFamily: 'Ralway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
    textAlign: 'center',
  },
  playerThatAnswers: {
    color: colors.orange[200],
  },
  recordingContainer: {
    marginTop: verticalScale(8),
    backgroundColor: colors.gray[300],
    paddingVertical: scale(15),
    paddingHorizontal: scale(15),
    width: scale(250),
    alignSelf: 'center',
    borderRadius: radius.md,
  },
  recordingText: {
    fontSize: fontSize.md,
    color: colors.orange[200],
    fontFamily: 'Ralway',
    fontWeight: 'bold',
  },
  question: {
    fontSize: fontSize.lg,
    color: colors.white[100],
    fontFamily: 'Sigmar',
    textAlign: 'center',
    paddingHorizontal: scale(10),
  },
  leftFooterArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightFooterArea: {
    flex: 1,
  },
  arrowTouchable: {
    padding: moderateScale(8),
  }
});
