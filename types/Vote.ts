import { Player } from './Player';

export interface Vote {
  playerThatVoted: Player;
  playersVoted: Player[];
}
