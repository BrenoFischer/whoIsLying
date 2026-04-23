import { GameContext } from '@/context/GameContext';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  AppState,
  Linking,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Button from '@/components/button';
import { colors } from '@/styles/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import Character from '@/components/character';
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
import ReactionModal from '@/components/reactionModal';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

const RING_SIZE = moderateScale(160);
const STROKE_WIDTH = moderateScale(10);
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function TimerRing({ timeLeft, roundDuration }: { timeLeft: number; roundDuration: number }) {
  const animOffset = useSharedValue(0);
  const urgent = timeLeft <= 5;

  // Single continuous drain — avoids per-second jumps and the first-second stall.
  useEffect(() => {
    animOffset.value = withTiming(CIRCUMFERENCE, {
      duration: roundDuration * 1000,
      easing: Easing.linear,
    });
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animOffset.value,
  }));

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={colors.gray[300]}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={urgent ? '#ef4444' : colors.orange[200]}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={styles.ringNumber}>{timeLeft}</Text>
    </View>
  );
}

type TimerPhase = 'idle' | 'prepare' | 'counting' | 'expired';

export default function RoundScreen() {
  const {
    game,
    nextRound,
    previousRound,
    getCurrentQuestion,
    saveRecordingToRound,
    getRoundAudio,
    setCurrentScreen,
    setRoundReaction,
  } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/round');
  }, []);

  const [isRecording, setIsRecording] = useState(false);
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(null);

  const timedRound = game.config.timedRound;
  const roundDuration = game.config.roundDuration;
  const [timerPhase, setTimerPhase] = useState<TimerPhase>('idle');
  const [prepareCount, setPrepareCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const pendingRecord = useRef(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 200);

  useEffect(() => {
    const currentAudio = getRoundAudio();
    setAudioUri(currentAudio ?? null);
    setTimerPhase('idle');
    setPrepareCount(3);
    setTimeLeft(roundDuration);
    pendingRecord.current = false;
  }, [game.currentRound]);

  // 3-2-1 prepare countdown
  useEffect(() => {
    if (timerPhase !== 'prepare' || prepareCount <= 0) return;
    const id = setTimeout(() => setPrepareCount(prev => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [timerPhase, prepareCount]);

  // prepare done → counting
  useEffect(() => {
    if (timerPhase !== 'prepare' || prepareCount > 0) return;
    (async () => {
      setTimerPhase('counting');
      if (pendingRecord.current) {
        pendingRecord.current = false;
        setIsRecording(true);
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record({ forDuration: 50 });
      }
    })();
  }, [timerPhase, prepareCount]);

  // main countdown — uses Date.now() to avoid setTimeout drift
  useEffect(() => {
    if (timerPhase !== 'counting') return;
    const startTime = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = roundDuration - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        setTimerPhase('expired');
      } else {
        setTimeLeft(remaining);
      }
    }, 200);
    return () => clearInterval(id);
  }, [timerPhase]);

  // stop recording on expire
  useEffect(() => {
    if (timerPhase === 'expired' && isRecording) handleStopRecording();
  }, [timerPhase]);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setMicPermissionGranted(status.granted);
      if (status.granted) {
        setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      }
    })();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      if (nextState === 'active' && micPermissionGranted === false) {
        const status = await AudioModule.getRecordingPermissionsAsync();
        if (status.granted) {
          setMicPermissionGranted(true);
          setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
        }
      }
    });
    return () => subscription.remove();
  }, [micPermissionGranted]);

  const totalRounds = game.players.length * game.config.setsOfQuestions;

  useEffect(() => {
    if (game.currentRound === totalRounds + 1) {
      router.replace('/discussion');
    }
  }, [game.currentRound, totalRounds]);

  const round = game.rounds[game.currentRound - 1];

  // --- Intro animation ---
  const [showIntro, setShowIntro] = useState(true);
  const word1Scale = useSharedValue(1);
  const word1Opacity = useSharedValue(0);
  const word2Scale = useSharedValue(1);
  const word2Opacity = useSharedValue(0);
  const word3Scale = useSharedValue(1);
  const word3Opacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  const OPACITY_DURATION = 100;
  const SCALE_DURATION = 250;
  const SCALE_BACK_DURATION = 200;
  const WORD_DELAY = OPACITY_DURATION + SCALE_DURATION + SCALE_BACK_DURATION;

  useEffect(() => {
    word1Opacity.value = withTiming(1, { duration: OPACITY_DURATION });
    word1Scale.value = withSequence(
      withTiming(1.3, { duration: SCALE_DURATION }),
      withTiming(1.0, { duration: SCALE_BACK_DURATION })
    );
    word2Opacity.value = withDelay(WORD_DELAY, withTiming(1, { duration: OPACITY_DURATION }));
    word2Scale.value = withDelay(
      WORD_DELAY,
      withSequence(
        withTiming(1.3, { duration: SCALE_DURATION }),
        withTiming(1.0, { duration: SCALE_BACK_DURATION })
      )
    );
    word3Opacity.value = withDelay(WORD_DELAY * 2, withTiming(1, { duration: OPACITY_DURATION }));
    word3Scale.value = withDelay(
      WORD_DELAY * 2,
      withSequence(
        withTiming(1.3, { duration: SCALE_DURATION }),
        withTiming(1.0, { duration: SCALE_BACK_DURATION })
      )
    );
    overlayOpacity.value = withDelay(
      WORD_DELAY * 3 + 600,
      withTiming(0, { duration: 400 }, finished => {
        if (finished) runOnJS(setShowIntro)(false);
      })
    );
  }, [game.currentRound]);

  const animatedWord1Style = useAnimatedStyle(() => ({
    opacity: word1Opacity.value,
    transform: [{ scale: word1Scale.value }],
  }));
  const animatedWord2Style = useAnimatedStyle(() => ({
    opacity: word2Opacity.value,
    transform: [{ scale: word2Scale.value }],
  }));
  const animatedWord3Style = useAnimatedStyle(() => ({
    opacity: word3Opacity.value,
    transform: [{ scale: word3Scale.value }],
  }));
  const introOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // --- Time's up animation ---
  const timesUpOpacity = useSharedValue(0);
  const timesUpTranslateY = useSharedValue(0);

  useEffect(() => {
    if (timerPhase !== 'expired') {
      timesUpOpacity.value = 0;
      timesUpTranslateY.value = 0;
      return;
    }
    timesUpOpacity.value = 1;
    timesUpTranslateY.value = 0;
    timesUpOpacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
    timesUpTranslateY.value = withDelay(2000, withTiming(-verticalScale(30), { duration: 500 }));
  }, [timerPhase]);

  const animatedTimesUpStyle = useAnimatedStyle(() => ({
    opacity: timesUpOpacity.value,
    transform: [{ translateY: timesUpTranslateY.value }],
  }));
  // --- End Time's up animation ---

  // --- End intro animation ---

  if (!round) return null;

  const playerThatAsks = round.playerThatAsks;
  const playerThatAnswers = round.playerThatAnswers;
  const question = t(getCurrentQuestion(), { ns: 'categories' });

  const startCountdown = () => {
    setTimeLeft(roundDuration);
    setPrepareCount(3);
    setTimerPhase('prepare');
  };

  const handleStopCountdown = async () => {
    if (isRecording) await handleStopRecording();
    pendingRecord.current = false;
    setPrepareCount(0); // prevent prepare→counting effect from firing
    setTimerPhase('expired');
  };

  const startRecording = async () => {
    if (!micPermissionGranted) return;
    if (timedRound && (timerPhase === 'idle' || timerPhase === 'expired')) {
      pendingRecord.current = true;
      startCountdown();
    } else {
      setIsRecording(true);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record({ forDuration: 50 });
    }
  };

  const handleStopRecording = async () => {
    if (!recorderState.isRecording) return;
    setIsRecording(false);
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        if (audioUri) {
          try { new FileSystem.File(audioUri).delete(); } catch (e) {
            console.warn('Failed to delete previous audio file:', e);
          }
        }
        const dest = new FileSystem.File(
          FileSystem.Paths.cache,
          `round_${round.id}_${Date.now()}.m4a`
        );
        new FileSystem.File(uri).copy(dest);
        saveRecordingToRound(dest.uri);
        setAudioUri(dest.uri);
      }
    } catch (e) {
      console.warn('Stop recording error:', e);
    }
  };

  const formatTime = (miliSeconds: number) => {
    const totalSeconds = Math.floor(miliSeconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimerState = () => {
    setTimerPhase('idle');
    setPrepareCount(3);
    setTimeLeft(roundDuration);
    pendingRecord.current = false;
    timesUpOpacity.value = 0;
    timesUpTranslateY.value = 0;
  };

  const handleNextRound = async () => {
    if (isRecording) await handleStopRecording();
    resetTimerState();
    overlayOpacity.value = 1;
    word1Opacity.value = 0;
    word2Opacity.value = 0;
    word3Opacity.value = 0;
    word1Scale.value = 1;
    word2Scale.value = 1;
    word3Scale.value = 1;
    setShowIntro(true);
    nextRound();
  };

  const handlePreviousRound = async () => {
    if (isRecording) await handleStopRecording();
    resetTimerState();
    previousRound();
  };

  const arrowDisabled =
    game.currentRound === 1 ||
    isRecording ||
    (timedRound && (timerPhase === 'prepare' || timerPhase === 'counting'));

  return (
    <>
      <ScreenLayout
        header={
          <View style={styles.headerContainer}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: scale(5), flex: 1 }}>
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
                disabled={arrowDisabled}
              >
                <AntDesign
                  name="left"
                  size={moderateScale(24)}
                  color={arrowDisabled ? colors.gray[300] : colors.orange[200]}
                />
              </TouchableOpacity>
            </View>

            <View>
              {timedRound ? (
                timerPhase === 'idle' ? (
                  <Button text={t('Start countdown')} onPress={startCountdown} variants="primary" />
                ) : timerPhase === 'prepare' || timerPhase === 'counting' ? (
                  <Button text={t('Stop countdown')} onPress={handleStopCountdown} variants="secondary" />
                ) : (
                  <Button text={t('Continue')} onPress={handleNextRound} variants="primary" />
                )
              ) : (
                <Button
                  text={isRecording ? t('Recording...') : t('Continue')}
                  onPress={handleNextRound}
                  variants={isRecording ? 'disabled' : 'primary'}
                />
              )}
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

          {/* Small Time's up badge — appears above characters without shifting layout */}
          {timedRound && timerPhase === 'expired' && (
            <View style={styles.timesUpBadge}>
              <FontAwesome6 name="hourglass-end" size={moderateScale(11)} color={colors.orange[200]} />
              <Text style={styles.timesUpBadgeText}>{t("Time's up!")}</Text>
            </View>
          )}

          {/* Action area — same slot, different content per phase */}
          <View style={{ position: 'relative' }}>
            {!timedRound || timerPhase === 'idle' || timerPhase === 'expired' ? (
              <View style={styles.charactersRow}>
                <Character mood={playerThatAsks.character} />
                <Character mood={playerThatAnswers.character} flip />
              </View>
            ) : timerPhase === 'prepare' ? (
              <View style={styles.timerCenterArea}>
                <Text style={styles.prepareCountText}>{prepareCount}</Text>
              </View>
            ) : (
              <View style={styles.timerCenterArea}>
                <TimerRing timeLeft={timeLeft} roundDuration={roundDuration} />
              </View>
            )}

            {/* Big "Time's up!" overlay — fades out after 2s revealing characters */}
            {timedRound && timerPhase === 'expired' && (
              <Animated.View
                pointerEvents="none"
                style={[StyleSheet.absoluteFillObject, styles.timesUpOverlay, animatedTimesUpStyle]}
              >
                <FontAwesome6 name="hourglass-end" size={moderateScale(40)} color={colors.orange[200]} />
                <Text style={styles.timesUpText}>{t("Time's up!")}</Text>
              </Animated.View>
            )}

            {/* Reaction button — bottom-left, near playerThatAsks */}
            {(!timedRound || timerPhase === 'idle' || timerPhase === 'expired') && (
              <TouchableOpacity
                style={styles.reactionTrigger}
                onPress={() => setReactionModalVisible(true)}
              >
                <Text style={styles.reactionTriggerText}>
                  {round.reaction ?? '😶 +'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Recording container */}
          <View style={styles.recordingContainer}>
              {isRecording ? (
                <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                  <TouchableOpacity onPress={handleStopRecording}>
                    <FontAwesome6 name="circle-stop" size={24} color={colors.orange[200]} />
                  </TouchableOpacity>
                  <Text style={styles.recordingText}>
                    {formatTime(recorderState.durationMillis)}
                  </Text>
                  <View />
                </View>
              ) : micPermissionGranted === false ? (
                <TouchableOpacity onPress={() => Linking.openSettings()}>
                  <View style={{ justifyContent: 'space-between', flexDirection: 'row', gap: scale(5) }}>
                    <FontAwesome6 name="microphone-slash" size={24} color={colors.gray[100]} />
                    <Text style={[styles.recordingText, styles.recordingTextDenied]}>
                      {t('No mic permission. Tap to open settings')}
                    </Text>
                    <View />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={startRecording}
                  disabled={timedRound && (timerPhase === 'prepare' || timerPhase === 'counting' && isRecording)}
                >
                  <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                    <FontAwesome6 name="microphone" size={24} color={colors.orange[200]} />
                    <Text style={styles.recordingText}>
                      {audioUri ? t('Record a new answer') : t('Record answer')}
                    </Text>
                    <View />
                  </View>
                </TouchableOpacity>
              )}
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.question}>{question}</Text>
        </View>
      </ScreenLayout>

      <ReactionModal
        visible={reactionModalVisible}
        currentReaction={round.reaction}
        onSelect={reaction => setRoundReaction(round.id, reaction)}
        onClose={() => setReactionModalVisible(false)}
      />

      {showIntro && (
        <Animated.View
          style={[StyleSheet.absoluteFillObject, styles.introOverlay, introOverlayAnimatedStyle]}
        >
          <Animated.Text style={[styles.introWord, animatedWord1Style]}>
            {playerThatAsks.name}
          </Animated.Text>
          <Animated.Text style={[styles.introWord, styles.introWordAsks, animatedWord2Style]}>
            {t('asks')}
          </Animated.Text>
          <Animated.Text style={[styles.introWord, animatedWord3Style]}>
            {playerThatAnswers.name}
          </Animated.Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(spacing.md),
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
    fontFamily: 'Raleway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
    textAlign: 'center',
  },
  playerThatAnswers: {
    color: colors.orange[200],
  },
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    maxHeight: moderateScale(180),
  },
  timerCenterArea: {
    height: moderateScale(180),
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(8),
  },
  recordingContainer: {
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
    fontFamily: 'Raleway',
    fontWeight: 'bold',
  },
  recordingTextDenied: {
    color: colors.gray[100],
    fontSize: fontSize.sm,
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
  },
  introOverlay: {
    backgroundColor: colors.background[100],
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(8),
  },
  introWord: {
    fontFamily: 'Raleway-Medium',
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.white[100],
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  introWordAsks: {
    color: colors.orange[200],
    fontSize: fontSize.xl,
  },
  timesUpOverlay: {
    backgroundColor: colors.background[100],
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(8),
  },
  timesUpText: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.xxl,
    color: colors.orange[200],
    textAlign: 'center',
  },
  timesUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    paddingVertical: verticalScale(4),
  },
  timesUpBadgeText: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.sm,
    color: colors.orange[200],
  },
  prepareCountText: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(100),
    color: colors.orange[200],
    textAlign: 'center',
    lineHeight: moderateScale(110),
  },
  reactionTrigger: {
    position: 'absolute',
    top: 0,
    left: scale(10),
    backgroundColor: colors.gray[300] + '55',
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  reactionTriggerText: {
    fontSize: fontSize.sm,
    fontFamily: 'Raleway-Medium',
    color: colors.white[100],
  },
  ringNumber: {
    position: 'absolute',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(52),
    color: colors.white[100],
    textAlign: 'center',
  },
});
