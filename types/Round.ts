import { Player } from './Player';

export interface Round {
  id: string;
  playerThatAsks: Player;
  playerThatAnswers: Player;
  question: string;
  questionIndex: number;
  questionSet: 'first' | 'second';
  audio: undefined | string;
}
