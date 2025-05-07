import Button from "@/components/button";
import Character from "@/components/character";
import { GameContext } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import { Player } from "@/types/Player";
import { router } from "expo-router";
import { useContext } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type VotesByPlayerType = {
    player: Player,
    votes: number,
    playersThatVoted: Player[]
}

export default function VotesResults() {
    const { game, updatePointsToPlayer, updatePlayers } = useContext(GameContext)

    let votesByPlayer: VotesByPlayerType[] = game.players.map(p => {
        return({player: p, votes: 0, playersThatVoted: []})
    })

    game.votes.forEach(vote => {
        for(let i = 0; i < game.players.length; i++) {
            if(votesByPlayer[i].player.id === vote.playerVoted.id) {
                votesByPlayer[i].votes += 1
                votesByPlayer[i].playersThatVoted.push(vote.playerThatVoted)
            }
        }
    })

    
    function getMostVotedPlayer() {
        let highestVoted = [votesByPlayer[0]]

        for(let i = 1; i < votesByPlayer.length; i++) {
            if(votesByPlayer[i].votes > highestVoted[0].votes) {
                highestVoted = [votesByPlayer[i]]
            }
            else if(votesByPlayer[i].votes === highestVoted[0].votes) {
                highestVoted.push(votesByPlayer[i])
            }
        }

        return highestVoted
    }

    function PlayerCard(vote: VotesByPlayerType) {
        return(
            <View style={{ flexDirection: "row", gap: 30 }}>
                <Character mood={vote.player.character} />
                <View style={{ justifyContent: "center" }}>
                    <Text style={styles.allPlayersName}>{vote.player.name}</Text>
                    <Text style={styles.allPlayersInfo}>Votes: {vote.votes}</Text>
                    {vote.votes > 0 &&
                        <View style={{maxWidth: 140}}>
                            <Text style={styles.allPlayersInfoVotes}>(
                            {
                                vote.playersThatVoted.map((p, idx) => {
                                    if(idx >= vote.playersThatVoted.length - 1) {
                                        return <Text key={p.id}>{p.name}</Text>
                                    }
                                    return<Text key={p.id}>{p.name}, </Text>
                                })
                            }
                            )</Text>
                        </View>
                    }
                </View>
            </View>
        )
    }

    const highestVoted = getMostVotedPlayer()
    const isTied = highestVoted.length > 1

    const handleContinue = () => {
        //check if none players voted on the impostor, so impostor obtains 50 points
        let impostorWasVoted = false
        game.votes.forEach(v => {
            if(v.playerVoted.id === game.lyingPlayer.id) {
                impostorWasVoted = true
            }
        })

        if(!impostorWasVoted) {
            const updatedPlayers = updatePointsToPlayer(game.lyingPlayer, 50)
            updatePlayers(updatedPlayers)
        }

        router.navigate('/revealImpostor')
    }

    return(
        <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
            <ScrollView style={{ marginBottom: 20 }}>
                <View style={styles.mostVotedPlayerContainer}>
                    <Text style={styles.mostVotedPlayerText}>
                        {isTied ?  "It is a tie, the most voted players were:" : "The most voted player was:"}
                    </Text>
                        {
                            highestVoted.map(vote => {
                                return(
                                    <View key={vote.player.id} style={styles.playerCard}>
                                        <View style={styles.headerContainer}>
                                            <View style={{ alignItems: "center" }}>
                                                <Text style={styles.playerName}>{vote.player.name}</Text>
                                                <Character mood={vote.player.character} />
                                            </View>
                                            <View style={{ alignItems: "center", justifyContent: "center", flexWrap: "wrap", maxWidth: 150 }}>
                                                <Text style={styles.votesInfo}>With {vote.votes} votes!</Text>
                                                <Text style={styles.votesInfo}>( 
                                                    {
                                                        vote.playersThatVoted.map((player, idx) => {
                                                            if(idx >= vote.playersThatVoted.length - 1) {
                                                                return(
                                                                    <Text key={player.id} style={{color: colors.white[100]}}>{player.name}</Text>
                                                                )
                                                            }
                                                            return(
                                                                <Text key={player.id} style={{color: colors.white[100]}}>{player.name}, </Text>
                                                            )
                                                        })
                                                    }
                                                )</Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })
                        }
                </View>
                <Text style={styles.allPlayersText}>All players:</Text>
                    {
                        votesByPlayer.map(vote => {
                            return(
                                <PlayerCard {...vote} key={vote.player.id} />
                            )
                        })
                    }
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button text='Reveal impostor' onPress={handleContinue} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    mostVotedPlayerContainer: {
        marginTop: 40,
        marginBottom: 50,
    },
    playerCard: {
        backgroundColor: colors.orange[200],
        marginHorizontal: 13,
        borderRadius: 10,
        marginVertical: 20,
        paddingTop: 20,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    mostVotedPlayerText: {
        textAlign: "center",
        fontFamily: "Raleway",
        fontWeight: "bold",
        fontSize: 20,
        color: colors.orange[200]
    },
    playerName: {
        fontFamily: "Ralway",
        fontSize: 40,
        fontWeight: "bold",
        color: colors.white[100]
    },
    votesInfo: {
        fontFamily: "Raleway",
        fontWeight: "600",
        fontSize: 20,
        color: colors.black[200],
    },
    allPlayersText: {
        textAlign: "center",
        fontFamily: "Raleway",
        fontWeight: "bold",
        fontSize: 20,
        color: colors.orange[200],
        marginBottom: 50,
    },
    allPlayersName: {
        color: colors.orange[200],
        fontFamily: "Ralway",
        fontSize: 30,
        fontWeight: "bold",
    },
    allPlayersInfo: {
        color: colors.white[100],
        fontFamily: "Ralway",
        fontSize: 15,
        fontWeight: "bold"
    },
    allPlayersInfoVotes: {
        color: colors.orange[200],
        fontFamily: "Ralway",
        fontSize: 15,
        fontWeight: "bold"
    },
    buttonContainer: {
        justifyContent: 'center', 
        alignItems: 'center',
    },
})