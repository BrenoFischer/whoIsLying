import { Player } from "./Player";
import { Round } from "./Round";

export interface Game {
    players: Player[]
    rounds: Round[]
    currentRound: number
    lyingPlayer: Player
    word: undefined | string
    showingWordToPlayer: number
}