import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { HistoryContext } from '@/context/HistoryContext';
import { MatchRecordPlayer } from '@/types/MatchRecord';
import { SavedPlayerStats } from '@/types/SavedPlayer';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import uuid from 'react-native-uuid';
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as Haptics from 'expo-haptics';
import {
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_DURATION_MS = 400;
const EVENT_FADE_IN_MS = 350;
const EVENT_HOLD_MS = 2000;
const EVENT_FADE_OUT_MS = 800;
const TICK_INTERVAL_MS = 120;

type RankedPlayer = {
  id: string;
  name: string;
  theme: string;
  character: string;
  score: number;
  currentPosition: number;
  positionDiff: number | null;
  previousScore: number;
  matchScore: number;
  events: { text: string; points: number }[];
  isImpostor: boolean;
};

type PlayerCardHandle = {
  startSlide: () => void;
  skipToEnd: () => void;
  reset: () => void;
  animateEvent: (text: string, points: number) => Promise<void>;
  tickScore: (target: number) => Promise<void>;
  hideEvent: () => void;
  showMatchScore: () => void;
};

type PlayerCardProps = {
  player: RankedPlayer;
  t: (key: string) => string;
  idx: number;
};

const PlayerCard = forwardRef<PlayerCardHandle, PlayerCardProps>(
  ({ player, idx, t }, ref) => {
    const slideX = useSharedValue(SCREEN_WIDTH);
    const eventOpacity = useSharedValue(0);

    const [currentEventText, setCurrentEventText] = useState('');
    const [currentEventPoints, setCurrentEventPoints] = useState(0);
    const [runningScore, setRunningScore] = useState(player.previousScore);
    const runningScoreRef = useRef(player.previousScore);
    const matchScoreOpacity = useSharedValue(0);

    const eventResolveRef = useRef<(() => void) | null>(null);
    const eventTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const tickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearEventTimers = () => {
      eventTimersRef.current.forEach(clearTimeout);
      eventTimersRef.current = [];
    };

    useImperativeHandle(
      ref,
      () => ({
        startSlide: () => {
          slideX.value = withTiming(0, { duration: SLIDE_DURATION_MS });
        },
        skipToEnd: () => {
          slideX.value = 0;
          eventOpacity.value = 0;
          clearEventTimers();
          const pending = eventResolveRef.current;
          eventResolveRef.current = null;
          pending?.();
          if (tickTimerRef.current !== null) {
            clearTimeout(tickTimerRef.current);
            tickTimerRef.current = null;
          }
          runningScoreRef.current = player.score;
          setRunningScore(player.score);
          matchScoreOpacity.value = 1;
        },
        reset: () => {
          clearEventTimers();
          const pending = eventResolveRef.current;
          eventResolveRef.current = null;
          pending?.();
          if (tickTimerRef.current !== null) {
            clearTimeout(tickTimerRef.current);
            tickTimerRef.current = null;
          }
          slideX.value = SCREEN_WIDTH;
          eventOpacity.value = 0;
          matchScoreOpacity.value = 0;
          setCurrentEventText('');
          setCurrentEventPoints(0);
          runningScoreRef.current = player.previousScore;
          setRunningScore(player.previousScore);
        },
        animateEvent: (text: string, points: number) =>
          new Promise<void>(resolve => {
            eventResolveRef.current = resolve;
            setCurrentEventText(text);
            setCurrentEventPoints(points);
            eventOpacity.value = 0;

            // Fade in
            eventOpacity.value = withTiming(1, { duration: EVENT_FADE_IN_MS });

            // After fade-in + hold: start fade-out and resolve simultaneously
            // so ticking begins right as the event starts fading out
            eventTimersRef.current.push(
              setTimeout(() => {
                clearEventTimers();
                eventOpacity.value = withTiming(0, {
                  duration: EVENT_FADE_OUT_MS,
                });
                const pending = eventResolveRef.current;
                eventResolveRef.current = null;
                pending?.();
              }, EVENT_FADE_IN_MS + EVENT_HOLD_MS)
            );
          }),
        tickScore: (target: number) =>
          new Promise<void>(resolve => {
            const diff = target - runningScoreRef.current;
            if (diff <= 0) {
              resolve();
              return;
            }
            let ticked = 0;
            const tick = () => {
              ticked++;
              runningScoreRef.current += 1;
              setRunningScore(s => s + 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (ticked < diff) {
                tickTimerRef.current = setTimeout(tick, TICK_INTERVAL_MS);
              } else {
                tickTimerRef.current = null;
                resolve();
              }
            };
            tickTimerRef.current = setTimeout(tick, TICK_INTERVAL_MS);
          }),
        hideEvent: () => {
          eventOpacity.value = withTiming(0, { duration: 200 });
        },
        showMatchScore: () => {
          matchScoreOpacity.value = withDelay(
            300,
            withTiming(1, { duration: 300 })
          );
        },
      }),
      []
    );

    const animatedSlideStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: slideX.value }],
    }));

    const eventAnimStyle = useAnimatedStyle(() => ({
      opacity: eventOpacity.value,
    }));

    const matchScoreAnimStyle = useAnimatedStyle(() => ({
      opacity: matchScoreOpacity.value,
    }));

    return (
      <Animated.View
        style={[
          styles.playerCard,
          player.isImpostor && styles.playerCardImpostor,
          animatedSlideStyle,
        ]}
      >
        {/* Header */}
        <View style={styles.playerCardHeader}>
          <Text
            style={[styles.index, player.isImpostor && styles.indexImpostor]}
          >
            {idx + 1}
          </Text>
          <Text style={styles.playerName}>{player.name}</Text>
          {player.isImpostor && (
            <Ionicons
              name="glasses-outline"
              size={moderateScale(20)}
              color={colors.white[100]}
              style={styles.impostorIcon}
            />
          )}
          <View style={styles.rankChangeContainer}>
            {player.positionDiff === null && (
              <Text style={styles.newPlayer}>New</Text>
            )}
            {player.positionDiff !== null && player.positionDiff > 0 && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
                <Text style={styles.rankUp}>+{player.positionDiff}</Text>
                <Ionicons name="arrow-up" size={20} color={colors.green[100]} />
              </View>
            )}
            {player.positionDiff !== null && player.positionDiff < 0 && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
                <Text style={styles.rankDown}>{player.positionDiff}</Text>
                <Ionicons name="arrow-down" size={20} color={colors.red[100]} />
              </View>
            )}
            {player.positionDiff === 0 && (
              <Text style={styles.rankSame}>-</Text>
            )}
          </View>
        </View>

        {/* Body: character left | score + event right */}
        <View style={styles.playerCardBody}>
          <Character mood={player.character} />
          <View style={styles.scoreColumn}>
            {/* Total label + score pinned to top */}
            <Text style={styles.scoreLabel}>{t('total')}</Text>
            <Text style={styles.playerScore}>
              {runningScore}{' '}
              <Text style={styles.playerPointsText}>{t('pts')}</Text>
            </Text>

            {/* Match score — fades in after all events */}
            <Animated.View
              style={[styles.matchScoreContainer, matchScoreAnimStyle]}
            >
              <Text style={styles.matchScoreValue}>
                +{player.matchScore}{' '}
                <Text style={styles.matchScorepts}>{t('pts')}</Text>
              </Text>
              <Text style={styles.scoreLabel}>{t('this match')}</Text>
            </Animated.View>

            {/* Event text — centered in remaining space below score */}
            <Animated.View style={[styles.eventTextArea, eventAnimStyle]}>
              <Text
                style={[
                  styles.eventPoints,
                  currentEventPoints >= 5 && styles.eventTextBig,
                  currentEventPoints >= 3 &&
                    currentEventPoints < 5 &&
                    styles.eventTextMedium,
                ]}
              >
                +{currentEventPoints} {t('pts')}
              </Text>
              <Text style={styles.eventText}>{currentEventText}</Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    );
  }
);

PlayerCard.displayName = 'PlayerCard';

export default function EndGame() {
  const { game, setCurrentScreen, getSortedPlayers } = useContext(GameContext);
  const { savedPlayers, recordMatch, updateSavedPlayerStats } = useContext(HistoryContext);
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    setCurrentScreen('/endGame');
  }, []);

  useEffect(() => {
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    const maxScore = Math.max(...game.players.map(p => p.score));
    const recordedPlayers: MatchRecordPlayer[] = [];

    game.players.forEach(player => {
      const saved = savedPlayers.find(s => s.id === player.id);
      if (!saved) return;

      const isImpostor = game.lyingPlayers.some(lp => lp.id === player.id);
      const scoreEarned = player.matchScore?.totalScore ?? 0;
      const isMatchWinner = player.score === maxScore;

      const playerVote = game.votes.find(v => v.playerThatVoted.id === player.id);
      const civilianVotesTotal = playerVote?.playersVoted.length ?? 0;
      const civilianVotesCorrect = playerVote
        ? playerVote.playersVoted.filter(voted =>
            game.lyingPlayers.some(lp => lp.id === voted.id)
          ).length
        : 0;

      let wasDetected: boolean | null = null;
      let guessedWord: boolean | null = null;

      if (isImpostor) {
        wasDetected = game.votes.some(vote =>
          vote.playersVoted.some(voted => voted.id === player.id)
        );
        const impostorVote = game.impostorVotes.find(v => v.player.id === player.id);
        guessedWord = impostorVote ? impostorVote.word === game.word : null;
      }

      recordedPlayers.push({
        savedPlayerId: saved.id,
        name: player.name,
        role: isImpostor ? 'impostor' : 'civilian',
        scoreEarned,
        isMatchWinner,
        civilianVotesCorrect,
        civilianVotesTotal,
        wasDetected,
        guessedWord,
      });

      const statsDelta: Partial<SavedPlayerStats> = {
        matchesPlayed: saved.stats.matchesPlayed + 1,
        matchesWon: saved.stats.matchesWon + (isMatchWinner ? 1 : 0),
        lifetimeScore: saved.stats.lifetimeScore + scoreEarned,
        timesImpostor: saved.stats.timesImpostor + (isImpostor ? 1 : 0),
      };

      if (isImpostor) {
        if (wasDetected) {
          statsDelta.timesDetectedAsImpostor = saved.stats.timesDetectedAsImpostor + 1;
        } else {
          statsDelta.timesUndetectedAsImpostor = saved.stats.timesUndetectedAsImpostor + 1;
        }
        if (guessedWord) {
          statsDelta.timesGuessedWord = saved.stats.timesGuessedWord + 1;
        }
      } else {
        statsDelta.civilianVotesCorrect = saved.stats.civilianVotesCorrect + civilianVotesCorrect;
        statsDelta.civilianVotesTotal = saved.stats.civilianVotesTotal + civilianVotesTotal;
      }

      updateSavedPlayerStats(saved.id, statsDelta);
    });

    if (recordedPlayers.length > 0) {
      recordMatch({
        id: uuid.v4().toString(),
        date: new Date().toISOString(),
        category: game.category ?? '',
        players: recordedPlayers,
      });
    }
  }, []);

  const sortedPlayers = useMemo(() => getSortedPlayers(), [game.players]);

  const rankingWithDiff = useMemo(
    () =>
      sortedPlayers.map((player, index) => {
        const currentPosition = index + 1;
        const prevRanking = game.previousRankings?.find(
          r => r.playerId === player.id
        );
        const previousPosition = prevRanking?.position;
        const previousScore = prevRanking?.previousScore ?? 0;
        const positionDiff =
          previousPosition !== undefined
            ? previousPosition - currentPosition
            : null;
        const matchScore = Math.max(0, player.score - previousScore);
        const events = player.matchScore?.scoreEvents ?? [];
        const isImpostor = game.lyingPlayers.some(lp => lp.id === player.id);
        return {
          ...player,
          currentPosition,
          positionDiff,
          previousScore,
          matchScore,
          events,
          isImpostor,
        };
      }),
    [sortedPlayers, game.previousRankings, game.lyingPlayers]
  );

  const n = rankingWithDiff.length;

  const cardRefs = useRef<Array<PlayerCardHandle | null>>(Array(n).fill(null));
  const cardYPositions = useRef<number[]>(Array(n).fill(0));
  const animationActiveRef = useRef(true);

  const [replayKey, setReplayKey] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    animationActiveRef.current = true;

    const animateCard = async (idx: number): Promise<void> => {
      if (!animationActiveRef.current || idx < 0) return;

      // Slide card in from right
      cardRefs.current[idx]?.startSlide();
      await new Promise<void>(resolve =>
        setTimeout(resolve, SLIDE_DURATION_MS)
      );
      if (!animationActiveRef.current) return;

      // Animate each event, then tick score after each one
      const events = rankingWithDiff[idx].events;
      let runningTotal = rankingWithDiff[idx].previousScore;

      for (const event of events) {
        if (!animationActiveRef.current) return;
        await cardRefs.current[idx]?.animateEvent(event.text, event.points);
        if (!animationActiveRef.current) return;

        runningTotal += event.points;
        await cardRefs.current[idx]?.tickScore(runningTotal);
        if (!animationActiveRef.current) return;
      }

      cardRefs.current[idx]?.hideEvent();
      cardRefs.current[idx]?.showMatchScore();

      // Pause before scrolling to next card
      await new Promise<void>(resolve => setTimeout(resolve, 600));
      if (!animationActiveRef.current) return;

      // Scroll up to reveal the next card (higher ranking)
      if (idx > 0) {
        scrollRef.current?.scrollTo({
          y: cardYPositions.current[idx - 1],
          animated: true,
        });
        await new Promise<void>(resolve => setTimeout(resolve, 700));
        if (!animationActiveRef.current) return;
      }

      await animateCard(idx - 1);
    };

    // Wait for layout to settle, scroll to bottom, then start from the last player
    const timer = setTimeout(() => {
      if (!animationActiveRef.current) return;
      scrollRef.current?.scrollToEnd({ animated: false });
      setTimeout(async () => {
        if (!animationActiveRef.current) return;
        await animateCard(n - 1);
        if (animationActiveRef.current) setAnimationComplete(true);
      }, 150);
    }, 400);

    return () => {
      animationActiveRef.current = false;
      clearTimeout(timer);
    };
  }, [replayKey]);

  const handleContinue = () => {
    router.replace('/endOfMatches');
  };

  const handleReplay = () => {
    cardRefs.current.forEach(ref => ref?.reset());
    setAnimationComplete(false);
    setReplayKey(k => k + 1);
  };

  const handleSkip = () => {
    animationActiveRef.current = false;
    cardRefs.current.forEach(ref => ref?.skipToEnd());
    setAnimationComplete(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <SidebarMenu />
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>{t('Scores')}:</Text>
        {rankingWithDiff.map((p, idx) => (
          <View
            key={p.id}
            style={styles.cardWrapper}
            onLayout={(e: LayoutChangeEvent) => {
              cardYPositions.current[idx] = e.nativeEvent.layout.y;
            }}
          >
            <PlayerCard
              ref={el => {
                cardRefs.current[idx] = el;
              }}
              player={p}
              idx={idx}
              t={t}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        {animationComplete ? (
          <View style={styles.footerActions}>
            <View style={styles.footerSide}>
              <TouchableOpacity
                style={styles.replayButton}
                onPress={handleReplay}
              >
                <Ionicons
                  name="refresh"
                  size={moderateScale(22)}
                  color={colors.orange[200]}
                />
              </TouchableOpacity>
            </View>
            <Button text={t('Continue')} onPress={handleContinue} />
            <View style={styles.footerSide} />
          </View>
        ) : (
          <Button text={t('Skip')} variants="secondary" onPress={handleSkip} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background[100],
  },
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(spacing.xl),
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
    marginBottom: verticalScale(spacing.sm),
  },
  cardWrapper: {
    overflow: 'hidden',
    marginHorizontal: scale(spacing.sm),
    borderRadius: radius.md,
    marginVertical: verticalScale(spacing.md),
  },
  playerCard: {
    backgroundColor: colors.orange[200],
    borderRadius: radius.md,
    paddingTop: verticalScale(spacing.md),
    paddingHorizontal: scale(spacing.sm),
  },
  playerCardImpostor: {
    backgroundColor: colors.purple[100],
  },
  playerCardHeader: {
    flexDirection: 'row',
    gap: scale(spacing.sm),
    marginBottom: verticalScale(spacing.xs),
    alignItems: 'center',
  },
  rankChangeContainer: {
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPlayer: {
    color: colors.white[100],
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  rankUp: {
    color: colors.green[100],
    fontWeight: 'bold',
  },
  rankDown: {
    color: colors.red[100],
    fontWeight: 'bold',
  },
  rankSame: {
    color: colors.white[100],
    fontWeight: 'bold',
    fontSize: fontSize.xl,
  },
  index: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.black[100],
  },
  indexImpostor: {
    color: colors.white[100],
  },
  impostorIcon: {
    marginLeft: scale(-spacing.xs),
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.white[100],
  },
  scoreLabel: {
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.white[100],
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: moderateScale(1),
  },
  playerScore: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: colors.white[100],
  },
  playerPointsText: {
    fontSize: fontSize.lg,
    fontWeight: 'normal',
  },
  matchScoreContainer: {
    position: 'absolute',
    bottom: verticalScale(spacing.sm),
    left: 0,
    right: 0,
    alignItems: 'center',
    flex: 1,
  },
  matchScoreValue: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: colors.white[100],
    flex: 1,
  },
  matchScorepts: {
    fontSize: fontSize.md,
    fontWeight: 'normal',
  },
  playerCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreColumn: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingTop: verticalScale(spacing.xs),
  },
  eventTextArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(2),
  },
  eventPoints: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontSize: moderateScale(17),
    fontWeight: 'bold',
    color: colors.white[100],
  },
  eventText: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontSize: moderateScale(13),
    fontWeight: 'bold',
    color: colors.white[100],
    opacity: 0.8,
  },
  eventTextMedium: {
    color: colors.red[200],
    fontSize: moderateScale(16),
  },
  eventTextBig: {
    color: colors.red[300],
    fontSize: moderateScale(17),
  },
  footer: {
    alignItems: 'center',
    paddingVertical: scale(spacing.md),
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(spacing.sm),
  },
  footerSide: {
    flex: 1,
    alignItems: 'center',
  },
  replayButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    borderWidth: 2,
    borderColor: colors.orange[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
