import { Player } from './Player';

export interface Round {
  playerThatAsks: Player;
  playerThatAnswers: Player;
  question: string;
}
