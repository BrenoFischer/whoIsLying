import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { router } from 'expo-router';
import { useContext, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';
import { Ionicons } from '@expo/vector-icons';

export default function EndGame() {
  const { game, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/endGame');
  }, []);

  const sortedPlayers = [...game.players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Sort by score descending
    }
    return a.id.localeCompare(b.id); // If scores are equal, sort by ID (or any other consistent criteria)
  });

  const rankingWithDiff = sortedPlayers.map((player, index) => {
    const currentPosition = index + 1;

    const previousPosition = game.previousRankings?.find(r => r.playerId === player.id)?.position;

    if(!previousPosition) {
      return { ...player, currentPosition, positionDiff: null };
    }

    const diff = previousPosition - currentPosition; // Positive if player moved up, negative if moved down

    return { ...player, currentPosition, positionDiff: diff };
  });

  function PlayerWithScore({ player, index, positionDiff }: { player: Player; index: number; positionDiff: number | null }) {
    return (
      <View style={styles.playerCard}>
        <View style={styles.playerCardHeader}>
          <Text style={styles.index}>{index + 1}</Text>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.rankChangeContainer}>
            {positionDiff === null && (
              <Text style={styles.newPlayer}>New</Text>
            )}
            {positionDiff !== null && positionDiff > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={styles.rankUp}>+{positionDiff}</Text>
                <Ionicons name="arrow-up" size={20} color={colors.green[100]} />
              </View>
            )}
            {positionDiff !== null && positionDiff < 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={styles.rankDown}>{positionDiff}</Text>
                <Ionicons name="arrow-down" size={20} color={colors.red[100]} />
              </View>
            )}
            {positionDiff === 0 && (
              <Text style={styles.rankSame}>-</Text>
            )}
          </View>
        </View>
        <View style={styles.playerCardBody}>
          <Character mood={player.character} />
          <View style={styles.scoreContainer}>
            <Text style={styles.playerScore}>
              {player.score}{' '}
              <Text style={styles.playerPointsText}>{t('points')}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const handleContinue = () => {
    router.replace('/endOfMatches');
  };

  return (
    <ScreenLayout
      scrollable
      header={
        <View style={styles.headerContainer}>
          <SidebarMenu />
        </View>
      }
      footer={<Button text={t('Continue')} onPress={handleContinue} />}
    >
      <Text style={styles.title}>{t('Scores')}:</Text>
      {rankingWithDiff.map((p, idx) => (
        <PlayerWithScore key={p.id} player={p} index={idx} positionDiff={p.positionDiff} />
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.md),
    alignItems: 'flex-end',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
    marginBottom: verticalScale(spacing.sm),
  },
  playerCard: {
    backgroundColor: colors.orange[200],
    marginHorizontal: scale(spacing.sm),
    borderRadius: radius.md,
    marginVertical: verticalScale(spacing.md),
    paddingTop: verticalScale(spacing.md),
    paddingHorizontal: scale(spacing.sm),
  },
  playerCardHeader: {
    flexDirection: 'row',
    gap: scale(spacing.sm),
    marginBottom: verticalScale(spacing.xs),
  },
  rankChangeContainer: {
    marginLeft: "auto",
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
});
