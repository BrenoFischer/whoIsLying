export interface Player {
  id: string;
  name: string;
  theme: string;
  character: string;
  score: number;
  matchScore: {
    scoreEvents: { text: string; points: number }[];
    totalScore: number;
  };
}
