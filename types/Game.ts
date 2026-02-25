import { Player } from './Player';
import { Round } from './Round';
import { Vote } from './Vote';

export interface Game {
  players: Player[];
  rounds: Round[];
  currentRound: number;
  lyingPlayer: Player;
  category: undefined | string;
  word: undefined | string;
  wordIndex: undefined | number;
  selectedWord: undefined | string;
  showingWordToPlayer: number;
  votes: Vote[];
  currentMatch: number;
  currentScreen?: string;
  previousRankings?: { playerId: string; position: number; previousScore: number }[];
}
