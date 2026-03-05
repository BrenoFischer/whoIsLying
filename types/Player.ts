export interface Player {
  id: string;
  name: string;
  theme: string;
  character: string;
  score: number;
  matchScore: { scoreEvents: string[]; totalScore: number };
}
