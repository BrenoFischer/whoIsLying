export interface SavedPlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  timesImpostor: number;
  timesDetectedAsImpostor: number;
  timesUndetectedAsImpostor: number;
  timesGuessedWord: number;
  civilianVotesCorrect: number;
  civilianVotesTotal: number;
  lifetimeScore: number;
}

export interface SavedPlayer {
  id: string;
  name: string;
  preferredCharacter: string;
  preferredTheme: string;
  createdAt: string;
  stats: SavedPlayerStats;
}
