export interface GameConfig {
  numberOfImpostors: number;
  setsOfQuestions: number;
  randomImpostors: boolean;
  timedRound: boolean;
  roundDuration: number; // seconds: 3 | 5 | 10 | 15
}
