import { Player } from "./Player";
import { Round } from "./Round";
import { Vote } from "./Vote";

export interface Game {
    players: Player[]
    rounds: Round[]
    currentRound: number
    lyingPlayer: Player
    category: undefined | string
    word: undefined | string
    showingWordToPlayer: number
    votes: Vote[]
}