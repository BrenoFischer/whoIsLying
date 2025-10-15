import Button from '@/components/button';
import Character from '@/components/character';
import WithSidebar from '@/components/withSideBar';
import { GameContext } from '@/context/GameContext';
import { colors } from '@/styles/colors';
import { Player } from '@/types/Player';
import { router } from 'expo-router';
import { useContext } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '@/translations';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

type VotesByPlayerType = {
  player: Player;
  votes: number;
  playersThatVoted: Player[];
};

export default function VotesResults() {
  const { game } = useContext(GameContext);
  const { t } = useTranslation();

  const votesByPlayer: VotesByPlayerType[] = game.players.map(p => {
    return { player: p, votes: 0, playersThatVoted: [] };
  });

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
      <View style={{ flexDirection: 'row', gap: scale(4) }}>
        <Character mood={vote.player.character} />
        <View style={{ justifyContent: 'center', maxWidth: "40%" }}>
          <Text style={styles.allPlayersName}>{vote.player.name}</Text>
          <Text style={styles.allPlayersInfo}>
            {t('Votes')}: {vote.votes}
          </Text>
          {vote.votes > 0 && (
            <View style={{ maxWidth: scale(140) }}>
              <Text style={styles.allPlayersInfoVotes}>
                (
                {vote.playersThatVoted.map((p, idx) => {
                  if (idx >= vote.playersThatVoted.length - 1) {
                    return <Text key={p.id}>{p.name}</Text>;
                  }
                  return <Text key={p.id}>{p.name}, </Text>;
                })}
                )
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  const highestVoted = getMostVotedPlayer();
  const isTied = highestVoted.length > 1;

  const handleContinue = () => {
    router.replace('/revealImpostor');
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.mostVotedPlayerContainer}>
            <Text style={styles.mostVotedPlayerText}>
              {isTied
                ? t('It is a tie, the most voted players were:')
                : t('The most voted player was:')}
            </Text>
            {highestVoted.map(vote => {
              const highestVotedText = vote.votes === 1 ?
                t('With') + ' ' + vote.votes + ' ' + t('vote')!
              :
                t('With') + ' ' + vote.votes + ' ' + t('Votes').toLowerCase()!

              return (
                <View key={vote.player.id} style={styles.playerCard}>
                  <View style={styles.headerContainer}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.playerName}>{vote.player.name}</Text>
                      <Character mood={vote.player.character} />
                    </View>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        maxWidth: scale(150),
                      }}
                    >
                      <Text style={styles.votesInfo}>
                        {highestVotedText}
                      </Text>
                      <Text style={styles.votesInfo}>
                        (
                        {vote.playersThatVoted.map((player, idx) => {
                          if (idx >= vote.playersThatVoted.length - 1) {
                            return (
                              <Text
                                key={player.id}
                                style={{ color: colors.white[100] }}
                              >
                                {player.name}
                              </Text>
                            );
                          }
                          return (
                            <Text
                              key={player.id}
                              style={{ color: colors.white[100] }}
                            >
                              {player.name},{' '}
                            </Text>
                          );
                        })}
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
            {votesByPlayer.map(vote => {
              return <PlayerCard {...vote} key={vote.player.id} />;
            })}
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button text={t('Reveal impostor')} onPress={handleContinue} />
        </View>
      </SafeAreaView>
    </WithSidebar>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  mostVotedPlayerContainer: {
    marginTop: verticalScale(40),
    marginBottom: verticalScale(50),
  },
  playerCard: {
    backgroundColor: colors.orange[200],
    marginHorizontal: scale(13),
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(20),
    paddingTop: verticalScale(20),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mostVotedPlayerText: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(20),
    color: colors.orange[200],
    marginHorizontal: scale(4),
  },
  playerName: {
    fontFamily: 'Ralway',
    fontSize: moderateScale(40),
    fontWeight: 'bold',
    color: colors.white[100],
  },
  votesInfo: {
    fontFamily: 'Raleway-Medium',
    fontSize: moderateScale(18),
    color: colors.black[200],
  },
  allPlayersContainer: {
    gap: verticalScale(10),
  },
  allPlayersText: {
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontWeight: 'bold',
    fontSize: moderateScale(20),
    color: colors.orange[200],
    marginBottom: verticalScale(50),
  },
  allPlayersName: {
    color: colors.orange[200],
    fontFamily: 'Ralway',
    fontSize: moderateScale(30),
    fontWeight: 'bold',
  },
  allPlayersInfo: {
    color: colors.white[100],
    fontFamily: 'Ralway',
    fontSize: moderateScale(15),
    fontWeight: 'bold',
  },
  allPlayersInfoVotes: {
    color: colors.orange[200],
    fontFamily: 'Ralway',
    fontSize: moderateScale(15),
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(30),
    backgroundColor: colors.background[100],
  },
});
