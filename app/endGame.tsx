import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
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
import { Dimensions, LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
const COUNT_INTERVAL_MS = 120;

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
};

type PlayerCardHandle = { startSlide: () => void; skipToEnd: () => void };

type PlayerCardProps = {
  player: RankedPlayer;
  idx: number;
  isMerged: boolean;
  displayedMatchScore: number;
  t: (key: string) => string;
};

const PlayerCard = forwardRef<PlayerCardHandle, PlayerCardProps>(
  ({ player, idx, isMerged, displayedMatchScore, t }, ref) => {
    const slideX = useSharedValue(SCREEN_WIDTH);

    useImperativeHandle(
      ref,
      () => ({
        startSlide: () => {
          slideX.value = withTiming(0, { duration: SLIDE_DURATION_MS });
        },
        skipToEnd: () => {
          slideX.value = 0;
        },
      }),
      [],
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: slideX.value }],
    }));

    return (
      <Animated.View style={[styles.playerCard, animatedStyle]}>
        <View style={styles.playerCardHeader}>
          <Text style={styles.index}>{idx + 1}</Text>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.rankChangeContainer}>
            {player.positionDiff === null && <Text style={styles.newPlayer}>New</Text>}
            {player.positionDiff !== null && player.positionDiff > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={styles.rankUp}>+{player.positionDiff}</Text>
                <Ionicons name="arrow-up" size={20} color={colors.green[100]} />
              </View>
            )}
            {player.positionDiff !== null && player.positionDiff < 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={styles.rankDown}>{player.positionDiff}</Text>
                <Ionicons name="arrow-down" size={20} color={colors.red[100]} />
              </View>
            )}
            {player.positionDiff === 0 && <Text style={styles.rankSame}>-</Text>}
          </View>
        </View>
        <View style={styles.playerCardBody}>
          <Character mood={player.character} />
          <View style={styles.scoreContainer}>
            {isMerged ? (
              <Text style={styles.playerScore}>
                {player.score}{' '}
                <Text style={styles.playerPointsText}>{t('points')}</Text>
              </Text>
            ) : (
              <View style={styles.scoreAnimContainer}>
                <Text style={styles.playerScore}>
                  {player.previousScore}{' '}
                  <Text style={styles.playerPointsText}>{t('points')}</Text>
                </Text>
                <Text style={styles.matchScoreText}>+{displayedMatchScore}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  },
);

export default function EndGame() {
  const { game, setCurrentScreen, getSortedPlayers } = useContext(GameContext);
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setCurrentScreen('/endGame');
  }, []);

  const sortedPlayers = useMemo(() => getSortedPlayers(), [game.players]);

  const rankingWithDiff = useMemo(
    () =>
      sortedPlayers.map((player, index) => {
        const currentPosition = index + 1;
        const prevRanking = game.previousRankings?.find(r => r.playerId === player.id);
        const previousPosition = prevRanking?.position;
        const previousScore = prevRanking?.previousScore ?? 0;
        const positionDiff =
          previousPosition !== undefined ? previousPosition - currentPosition : null;
        const matchScore = Math.max(0, player.score - previousScore);
        console.log(player.name, player.matchScore)
        return { ...player, currentPosition, positionDiff, previousScore, matchScore };
      }),
    [sortedPlayers, game.previousRankings],
  );

  const n = rankingWithDiff.length;

  const cardRefs = useRef<Array<PlayerCardHandle | null>>(Array(n).fill(null));
  const cardYPositions = useRef<number[]>(Array(n).fill(0));
  const animationActiveRef = useRef(true);

  const [animationComplete, setAnimationComplete] = useState(false);
  const [mergedCards, setMergedCards] = useState<boolean[]>(() => Array(n).fill(false));
  const [displayedMatchScores, setDisplayedMatchScores] = useState<number[]>(() =>
    Array(n).fill(0),
  );

  useEffect(() => {
    animationActiveRef.current = true;

    const animateCard = async (idx: number): Promise<void> => {
      if (!animationActiveRef.current || idx < 0) return;

      // Slide card in from right
      cardRefs.current[idx]?.startSlide();
      await new Promise<void>(resolve => setTimeout(resolve, SLIDE_DURATION_MS));

      if (!animationActiveRef.current) return;

      // Count up match score (+0 → +matchScore)
      const matchScore = rankingWithDiff[idx].matchScore;
      for (let i = 1; i <= matchScore; i++) {
        if (!animationActiveRef.current) return;
        await new Promise<void>(resolve => setTimeout(resolve, COUNT_INTERVAL_MS));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setDisplayedMatchScores(prev => {
          const next = [...prev];
          next[idx] = i;
          return next;
        });
      }

      await new Promise<void>(resolve => setTimeout(resolve, 400));
      if (!animationActiveRef.current) return;

      // Merge: replace "prevScore + +N" with the final total
      setMergedCards(prev => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });

      await new Promise<void>(resolve => setTimeout(resolve, 400));
      if (!animationActiveRef.current) return;

      // Scroll up to reveal the next card (higher ranking)
      if (idx > 0) {
        scrollRef.current?.scrollTo({ y: cardYPositions.current[idx - 1], animated: true });
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
  }, []);

  const handleContinue = () => {
    router.replace('/endOfMatches');
  };

  const handleSkip = () => {
    animationActiveRef.current = false;
    cardRefs.current.forEach(ref => ref?.skipToEnd());
    setDisplayedMatchScores(rankingWithDiff.map(p => p.matchScore));
    setMergedCards(Array(n).fill(true));
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
              isMerged={mergedCards[idx]}
              displayedMatchScore={displayedMatchScores[idx]}
              t={t}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        {animationComplete ? (
          <Button text={t('Continue')} onPress={handleContinue} />
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
  playerCardHeader: {
    flexDirection: 'row',
    gap: scale(spacing.sm),
    marginBottom: verticalScale(spacing.xs),
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
  playerCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  index: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.black[100],
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.white[100],
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  playerScore: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(30),
    fontWeight: 'bold',
    color: colors.white[100],
  },
  playerPointsText: {
    fontSize: fontSize.lg,
    fontWeight: 'normal',
  },
  scoreAnimContainer: {
    alignItems: 'center',
    gap: scale(spacing.xs),
  },
  matchScoreText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: colors.green[100],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: scale(spacing.md),
  },
});
