import Character from "@/components/character";
import { GameContext } from "@/context/GameContext";
import { colors } from "@/styles/colors";
import { Player } from "@/types/Player";
import { useContext } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

type VotesByPlayerType = {
    player: Player,
    votes: number,
    playersThatVoted: Player[]
}

export default function VotesResults() {
    const { game } = useContext(GameContext)

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
    

    function PlayerCard(vote: VotesByPlayerType) {
        return(
            <View style={{ flexDirection: "row" }}>
                <Character mood={vote.player.character} />
                <View>
                    <Text>{vote.player.name}</Text>
                    <Text>Votes: {vote.votes}</Text>
                </View>
            </View>
        )
    }

    return(
        <SafeAreaView style={{backgroundColor: colors.background[100], overflow: "hidden", height: "100%"}}>
            <ScrollView>
                {
                    votesByPlayer.map(vote => {
                        return(
                            <PlayerCard {...vote} key={vote.player.id} />
                        )
                    })
                }
            </ScrollView>
        </SafeAreaView>
    )
}