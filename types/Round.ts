import { Player } from './Player';

export type ExposureLevel = 'low' | 'medium' | 'high';

export interface Round {
  id: string;
  playerThatAsks: Player;
  playerThatAnswers: Player;
  question: string;
  questionIndex: number;
  questionSet: 1 | 2 | 3;
  exposure: ExposureLevel;
  audio: undefined | string;
}
