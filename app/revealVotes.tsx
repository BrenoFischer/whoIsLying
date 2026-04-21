import React, { useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { GameContext } from '@/context/GameContext';
import { useTranslation } from '@/translations';
import { Vote } from '@/types/Vote';
import Character from '@/components/character';
import Button from '@/components/button';
import SidebarMenu from '@/components/sideBarMenu';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

// ─── Timing ──────────────────────────────────────────────────────────────────
const TITLE_HOLD_MS = 1500;
const TITLE_TRANSITION_MS = 400;
const CARD_FADE_IN_MS = 500;
const VOTER_SHOW_MS = 1000;
const LABEL_SHOW_MS = 700;
const VOTE_INTERVAL_MS = 900;
const CARD_HOLD_AFTER_MS = 2000;
const CARD_FADE_OUT_MS = 350;

type Phase = 'title' | 'revealing' | 'complete';

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// ─── FadeItem ─────────────────────────────────────────────────────────────────
// Always in the DOM (keeps layout stable). Fades opacity when `visible` changes.
function FadeItem({
  visible,
  style,
  children,
}: {
  visible: boolean;
  style?: object;
  children: React.ReactNode;
}) {
  const opacity = useSharedValue(visible ? 1 : 0);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 380 });
  }, [visible]);

  return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
}

// ─── VoteCard (reveal) ────────────────────────────────────────────────────────
// All slots are always rendered. Visibility is driven by showLabel / revealedCount
// so the card height never changes during the reveal → no layout jumping.
type RevealVoteCardProps = {
  vote: Vote;
  t: (key: string) => string;
  showLabel: boolean;
  revealedCount: number;
  cardKey: number; // forces FadeItem remount when card changes
};

function RevealVoteCard({
  vote,
  t,
  showLabel,
  revealedCount,
  cardKey,
}: RevealVoteCardProps) {
  return (
    <View style={styles.voteCard}>
      {/* ── Left: voter ── name top, character bottom */}
      <View style={styles.voterSection}>
        <Text style={styles.voterName} numberOfLines={2} adjustsFontSizeToFit>
          {vote.playerThatVoted.name}
        </Text>
        <View style={styles.voterCharacterWrapper}>
          <Character
            mood={vote.playerThatVoted.character}
            size={moderateScale(150)}
          />
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── Right: voted players ── always pre-rendered, opacity-controlled */}
      <View style={styles.votedSection}>
        <FadeItem key={`${cardKey}-label`} visible={showLabel} style={styles.labelSlot}>
          <Text style={styles.votedLabel}>{t('voted on')}</Text>
        </FadeItem>

        {vote.playersVoted.length === 0 ? (
          <FadeItem key={`${cardKey}-empty`} visible={showLabel} style={styles.votedPlayerRow}>
            <Text style={styles.noVoteText}>—</Text>
          </FadeItem>
        ) : (
          vote.playersVoted.map((p, j) => (
            <FadeItem
              key={`${cardKey}-${p.id}`}
              visible={j < revealedCount}
              style={styles.votedPlayerRow}
            >
              <Character mood={p.character} size={moderateScale(65)} />
              <Text style={styles.votedPlayerName} numberOfLines={1}>
                {p.name}
              </Text>
            </FadeItem>
          ))
        )}
      </View>
    </View>
  );
}

// ─── VoteCard (static) ───────────────────────────────────────────────────────
// Plain version used in the complete scrollable list.
function VoteCard({ vote, t }: { vote: Vote; t: (key: string) => string }) {
  return (
    <View style={styles.voteCard}>
      <View style={styles.voterSection}>
        <Text style={styles.voterName} numberOfLines={2} adjustsFontSizeToFit>
          {vote.playerThatVoted.name}
        </Text>
        <View style={styles.voterCharacterWrapper}>
          <Character
            mood={vote.playerThatVoted.character}
            size={moderateScale(110)}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.votedSection}>
        <View style={styles.labelSlot}>
          <Text style={styles.votedLabel}>{t('voted on')}</Text>
        </View>

        {vote.playersVoted.length === 0 ? (
          <View style={styles.votedPlayerRow}>
            <Text style={styles.noVoteText}>—</Text>
          </View>
        ) : (
          vote.playersVoted.map(p => (
            <View key={p.id} style={styles.votedPlayerRow}>
              <Character mood={p.character} size={moderateScale(55)} />
              <Text style={styles.votedPlayerName} numberOfLines={1}>
                {p.name}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function RevealVotes() {
  const { game, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

  const [phase, setPhase] = useState<Phase>('title');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [revealedLabel, setRevealedLabel] = useState(false);
  const [revealedVotesCount, setRevealedVotesCount] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  // LinearTransition is active only during the first title-slide window.
  // On replay the title is already at the top so we skip it.
  const [applyTitleLayout, setApplyTitleLayout] = useState(false);

  const cardOpacity = useSharedValue(0);
  const animationActiveRef = useRef(true);
  const votes = game.votes;

  useEffect(() => {
    setCurrentScreen('/revealVotes');
  }, []);

  // Auto-advance from title to revealing.
  // Both state updates are in the same callback so React batches them into one
  // render — LinearTransition is already active when the layout change paints.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!animationActiveRef.current) return;
      setApplyTitleLayout(true); // must be batched with setPhase below
      setPhase('revealing');
    }, TITLE_HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  // Turn LinearTransition off after the slide finishes
  useEffect(() => {
    if (!applyTitleLayout) return;
    const off = setTimeout(
      () => setApplyTitleLayout(false),
      TITLE_TRANSITION_MS + 50
    );
    return () => clearTimeout(off);
  }, [applyTitleLayout]);

  // Card-by-card tension reveal — re-runs on replay via replayKey
  useEffect(() => {
    if (phase !== 'revealing') return;
    animationActiveRef.current = true;

    const run = async () => {
      await delay(TITLE_TRANSITION_MS + 150);

      for (let i = 0; i < votes.length; i++) {
        if (!animationActiveRef.current) return;

        // Reset state for the new card (card is invisible while this happens)
        cardOpacity.value = 0;
        setCurrentCardIndex(i);
        setRevealedLabel(false);
        setRevealedVotesCount(0);

        await delay(60);
        if (!animationActiveRef.current) return;

        // ① Voter fades in — right side stays empty
        cardOpacity.value = withTiming(1, { duration: CARD_FADE_IN_MS });
        await delay(CARD_FADE_IN_MS + VOTER_SHOW_MS);
        if (!animationActiveRef.current) return;

        // ② "Voted on" label appears
        setRevealedLabel(true);
        await delay(LABEL_SHOW_MS);
        if (!animationActiveRef.current) return;

        // ③ Each voted player fades in one by one, with haptics
        for (let j = 0; j < votes[i].playersVoted.length; j++) {
          if (!animationActiveRef.current) return;
          setRevealedVotesCount(j + 1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (j < votes[i].playersVoted.length - 1) {
            await delay(VOTE_INTERVAL_MS);
          }
        }
        if (!animationActiveRef.current) return;

        await delay(CARD_HOLD_AFTER_MS);
        if (!animationActiveRef.current) return;

        if (i < votes.length - 1) {
          cardOpacity.value = withTiming(0, { duration: CARD_FADE_OUT_MS });
          await delay(CARD_FADE_OUT_MS);
        }
      }

      if (animationActiveRef.current) setPhase('complete');
    };

    run();

    return () => {
      animationActiveRef.current = false;
    };
  }, [phase, replayKey]);

  const handleSkip = () => {
    animationActiveRef.current = false;
    cardOpacity.value = 1;
    setPhase('complete');
  };

  const handleReplay = () => {
    animationActiveRef.current = false;
    cardOpacity.value = 0;
    setCurrentCardIndex(0);
    setRevealedLabel(false);
    setRevealedVotesCount(0);
    setPhase('revealing');
    setReplayKey(k => k + 1);
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const titleSizeAnimStyle = useAnimatedStyle(() => ({
    fontSize: withTiming(applyTitleLayout ? fontSize.lg : fontSize.xl, {
      duration: TITLE_TRANSITION_MS,
    }),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SidebarMenu />
      </View>

      <View style={[styles.content, phase !== 'title' && styles.contentTop]}>
        {/* Title: LinearTransition only active during the slide-to-top window */}
        <Animated.Text
          layout={applyTitleLayout ? LinearTransition.duration(TITLE_TRANSITION_MS) : undefined}
          style={[styles.title, titleSizeAnimStyle]}
        >
          {t('Who voted on who?')}
        </Animated.Text>

        {phase !== 'title' && (
          <View style={styles.cardArea}>
            {phase === 'revealing' && (
              <Animated.View style={[styles.revealCardWrapper, cardAnimStyle]}>
                <RevealVoteCard
                  vote={votes[currentCardIndex]}
                  t={t}
                  showLabel={revealedLabel}
                  revealedCount={revealedVotesCount}
                  cardKey={currentCardIndex}
                />
              </Animated.View>
            )}

            {phase === 'complete' && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.listWrapper}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                >
                  {votes.map((vote, i) => (
                    <VoteCard
                      key={vote.playerThatVoted.id + i}
                      vote={vote}
                      t={t}
                    />
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {phase === 'complete' ? (
          <View style={styles.footerActions}>
            <View style={styles.footerSide}>
              <TouchableOpacity style={styles.replayButton} onPress={handleReplay}>
                <Ionicons
                  name="refresh"
                  size={moderateScale(22)}
                  color={colors.orange[200]}
                />
              </TouchableOpacity>
            </View>
            <Button
              text={t('Continue')}
              onPress={() => router.replace('/votesResults')}
            />
            <View style={styles.footerSide} />
          </View>
        ) : (
          <Button text={t('Skip')} variants="secondary" onPress={handleSkip} />
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background[100],
  },
  header: {
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(spacing.lg),
    gap: verticalScale(spacing.lg),
    justifyContent: 'center',
  },
  contentTop: {
    justifyContent: 'flex-start',
    paddingTop: verticalScale(spacing.md),
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
  },
  cardArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  revealCardWrapper: {
    width: '100%',
  },
  listWrapper: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    gap: verticalScale(spacing.md),
    paddingBottom: verticalScale(spacing.xl),
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

  // ── VoteCard ────────────────────────────────────────────────────────────────
  voteCard: {
    backgroundColor: colors.orange[200],
    borderRadius: moderateScale(radius.md),
    flexDirection: 'row',
    minHeight: verticalScale(185),
    paddingTop: verticalScale(spacing.md),
    paddingBottom: 0,
    paddingHorizontal: scale(spacing.md),
    gap: scale(spacing.md),
  },
  voterSection: {
    flex: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voterName: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(25),
    color: colors.white[100],
    textAlign: 'center',
  },
  voterCharacterWrapper: {
    // sits flush at card bottom
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginVertical: verticalScale(spacing.sm),
  },
  votedSection: {
    flex: 3,
    justifyContent: 'center',
    paddingVertical: verticalScale(spacing.sm),
    gap: verticalScale(spacing.sm),
  },
  labelSlot: {
    // reserved height so label never shifts other items
    height: verticalScale(18),
    justifyContent: 'center',
  },
  votedLabel: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  votedPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(spacing.xs),
    height: verticalScale(48),  // fixed row height — card never grows during reveal
  },
  votedPlayerName: {
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
    color: colors.white[100],
    flex: 1,
  },
  noVoteText: {
    fontFamily: 'Raleway',
    fontSize: moderateScale(18),
    color: 'rgba(255,255,255,0.5)',
  },
});
