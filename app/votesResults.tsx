import Button from '@/components/button';
import Character from '@/components/character';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { router } from 'expo-router';
import { useContext, useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale } from 'react-native-size-matters';
import ScreenLayout from '@/components/screenLayout';
import SidebarMenu from '@/components/sideBarMenu';
import { spacing } from '@/styles/spacing';
import { fontSize } from '@/styles/fontSize';
import { radius } from '@/styles/radius';

type VotesByPlayerType = {
  player: Player;
  votes: number;
  playersThatVoted: Player[];
};

export default function VotesResults() {
  const { game, setCurrentScreen } = useContext(GameContext);
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const featuredCharacterSize = height * 0.2;
  const listCharacterSize = height * 0.14;

  useEffect(() => {
    setCurrentScreen('/votesResults');
  }, []);

  const votesByPlayer: VotesByPlayerType[] = game.players.map(p => ({
    player: p,
    votes: 0,
    playersThatVoted: [],
  }));

  game.votes.forEach(vote => {
    for (let i = 0; i < game.players.length; i++) {
      if (votesByPlayer[i].player.id === vote.playerVoted.id) {
        votesByPlayer[i].votes += 1;
        votesByPlayer[i].playersThatVoted.push(vote.playerThatVoted);
      }
    }
  });

  function getMostVotedPlayer() {
    let highestVoted = [votesByPlayer[0]];
    for (let i = 1; i < votesByPlayer.length; i++) {
      if (votesByPlayer[i].votes > highestVoted[0].votes) {
        highestVoted = [votesByPlayer[i]];
      } else if (votesByPlayer[i].votes === highestVoted[0].votes) {
        highestVoted.push(votesByPlayer[i]);
      }
    }
    return highestVoted;
  }

  function PlayerCard(vote: VotesByPlayerType) {
    return (
      <View style={styles.allPlayerRow}>
        <Character mood={vote.player.character} size={listCharacterSize} />
        <View style={styles.allPlayerInfo}>
          <Text style={styles.allPlayersName}>{vote.player.name}</Text>
          <Text style={styles.allPlayersInfo}>{t('Votes')}: {vote.votes}</Text>
          {vote.votes > 0 && (
            <Text style={styles.allPlayersInfoVotes}>
              (
              {vote.playersThatVoted.map((p, idx) =>
                idx >= vote.playersThatVoted.length - 1
                  ? <Text key={p.id}>{p.name}</Text>
                  : <Text key={p.id}>{p.name}, </Text>
              )}
              )
            </Text>
          )}
        </View>
      </View>
    );
  }

  const highestVoted = getMostVotedPlayer();
  const isTied = highestVoted.length > 1;

  return (
    <ScreenLayout
      scrollable
      header={
        <View style={styles.headerContainer}>
          <SidebarMenu />
        </View>
      }
      footer={
        <Button text={t('Reveal impostor')} onPress={() => router.replace('/revealImpostor')} />
      }
    >
      <View style={styles.mostVotedContainer}>
        <Text style={styles.mostVotedText}>
          {isTied ? t('It is a tie, the most voted players were:') : t('The most voted player was:')}
        </Text>
        {highestVoted.map(vote => {
          const votesLabel = vote.votes === 1
            ? `${t('With')} ${vote.votes} ${t('vote')}`
            : `${t('With')} ${vote.votes} ${t('Votes').toLowerCase()}`;
          return (
            <View key={vote.player.id} style={styles.playerCard}>
              <View style={styles.playerCardInner}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.playerName}>{vote.player.name}</Text>
                  <Character mood={vote.player.character} size={featuredCharacterSize} />
                </View>
                <View style={styles.votesInfoContainer}>
                  <Text style={styles.votesInfo}>{votesLabel}</Text>
                  <Text style={styles.votesInfo}>
                    (
                    {vote.playersThatVoted.map((player, idx) =>
                      idx >= vote.playersThatVoted.length - 1
                        ? <Text key={player.id} style={{ color: colors.white[100] }}>{player.name}</Text>
                        : <Text key={player.id} style={{ color: colors.white[100] }}>{player.name}, </Text>
                    )}
                    )
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.allPlayersText}>{t('All players')}:</Text>
      <View style={styles.allPlayersContainer}>
        {votesByPlayer.map(vote => <PlayerCard {...vote} key={vote.player.id} />)}
      </View>
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
  mostVotedContainer: {
    marginBottom: verticalScale(spacing.xxl),
    paddingHorizontal: scale(spacing.sm),
  },
  mostVotedText: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
    marginBottom: verticalScale(spacing.lg),
  },
  playerCard: {
    backgroundColor: colors.orange[200],
    marginHorizontal: scale(spacing.sm),
    paddingHorizontal: scale(spacing.md),
    paddingTop: verticalScale(spacing.md),
    borderRadius: radius.md,
  },
  playerCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerName: {
    fontFamily: 'Raleway',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white[100],
  },
  votesInfoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  votesInfo: {
    fontFamily: 'Raleway-Medium',
    fontSize: fontSize.md,
    color: colors.black[100],
    textAlign: 'center',
  },
  allPlayersText: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: fontSize.lg,
    color: colors.orange[200],
    marginBottom: verticalScale(spacing.xl),
  },
  allPlayersContainer: {
    gap: verticalScale(spacing.sm),
    paddingHorizontal: scale(spacing.md),
  },
  allPlayerRow: {
    flexDirection: 'row',
    gap: scale(spacing.xs),
    alignItems: 'center',
  },
  allPlayerInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  allPlayersName: {
    color: colors.orange[200],
    fontFamily: 'Raleway',
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  allPlayersInfo: {
    color: colors.white[100],
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
  allPlayersInfoVotes: {
    color: colors.orange[200],
    fontFamily: 'Raleway',
    fontSize: fontSize.sm,
    fontWeight: 'bold',
  },
});
