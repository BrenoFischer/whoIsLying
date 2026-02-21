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

export default function EndGame() {
  const { game, addNewMatch, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentScreen('/endGame');
  }, []);

  const sortedPlayers = game.players.slice().sort((p1, p2) => p2.score - p1.score);

  function PlayerWithScore({ player, index }: { player: Player; index: number }) {
    return (
      <View style={styles.playerCard}>
        <View style={styles.playerCardHeader}>
          <Text style={styles.index}>{index + 1}</Text>
          <Text style={styles.playerName}>{player.name}</Text>
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
    if (game.currentMatch >= game.maximumMatches) {
      router.replace('/endOfMatches');
    } else {
      addNewMatch();
      router.replace('/selectCategory');
    }
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
      {sortedPlayers.map((p, idx) => (
        <PlayerWithScore key={p.id} player={p} index={idx} />
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: verticalScale(spacing.md),
    paddingBottom: verticalScale(spacing.xs),
    paddingHorizontal: scale(spacing.sm),
    alignItems: 'flex-end',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
    marginTop: verticalScale(spacing.xl),
    marginBottom: verticalScale(spacing.sm),
  },
  playerCard: {
    backgroundColor: colors.orange[200],
    marginHorizontal: scale(spacing.sm),
    borderRadius: radius.md,
    marginVertical: verticalScale(spacing.md),
    paddingVertical: verticalScale(spacing.md),
    paddingHorizontal: scale(spacing.sm),
  },
  playerCardHeader: {
    flexDirection: 'row',
    gap: scale(spacing.sm),
    marginBottom: verticalScale(spacing.xs),
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
