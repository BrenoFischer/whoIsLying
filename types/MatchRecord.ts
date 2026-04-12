export interface MatchRecordPlayer {
  savedPlayerId: string;
  name: string;            // denormalized — survives profile deletion
  role: 'civilian' | 'impostor';
  scoreEarned: number;
  isMatchWinner: boolean;
  // civilian-specific
  civilianVotesCorrect: number;
  civilianVotesTotal: number;
  // impostor-specific
  wasDetected: boolean | null;
  guessedWord: boolean | null;
}

export interface MatchRecord {
  id: string;
  date: string;            // ISO timestamp
  category: string;
  players: MatchRecordPlayer[];
}
