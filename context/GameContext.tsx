import { Game } from '@/types/Game';
import { Player } from '@/types/Player';
import { Round, ExposureLevel } from '@/types/Round';
import allCategories from '@/data/categories.json';
import { createContext, useState, useContext, useEffect } from 'react';
import uuid from 'react-native-uuid';
import * as FileSystem from 'expo-file-system';
import { useTranslation, Language } from '@/translations';
import { getRandomWordIndex } from '@/utils/gameTranslations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_STORAGE_KEY = 'game_state';

const INITIAL_GAME: Game = {
  players: [],
  currentRound: 1,
  rounds: [],
  lyingPlayers: [],
  config: { numberOfImpostors: 1, setsOfQuestions: 2 },
  category: undefined,
  word: undefined,
  wordIndex: undefined,
  impostorVotes: [],
  showingWordToPlayer: 0,
  votes: [],
  currentMatch: 1,
};

interface GameContextType {
  game: Game;
  createGame: (players: Player[]) => void;
  createNewGame: () => void;
  getLyingPlayers: () => Player[];
  setNumberOfImpostors: (count: number) => void;
  checkIfPlayerIsLiar: (playerId: string) => boolean;
  setSetsOfQuestions: (sets: number) => void;
  setGameWord: (category: string) => void;
  getRandomWord: (category: string) => string;
  setImpostorVotes: (votes: { player: Player; word: string }[]) => void;
  nextRound: () => void;
  previousRound: () => void;
  showWordToNextPlayer: () => void;
  addVote: (playerThatVoted: Player, playersVoted: Player[]) => void;
  updatePlayers: (players: Player[]) => void;
  resetGameWithExistingPlayers: () => void;
  getCurrentWord: () => string;
  getCurrentQuestion: () => string;
  saveRecordingToRound: (recording: string) => void;
  getRoundAudio: () => string | undefined;
  setCurrentScreen: (screen: string) => void;
  getSortedPlayers: () => Player[];
  resolveScoreOfTheMatch: () => void;
  isHydrated: boolean;
}

export const GameContext = createContext({} as GameContextType);

export const GameContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [game, setGame] = useState<Game>(INITIAL_GAME);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(GAME_STORAGE_KEY);
        if (stored) {
          // Saved game exists — restore it, keeping audio URIs intact for Discussion.
          // Merge with INITIAL_GAME so any new fields (e.g. config) always have defaults.
          const parsedGame: Game = JSON.parse(stored);
          setGame({
            ...INITIAL_GAME,
            ...parsedGame,
            config: { ...INITIAL_GAME.config, ...(parsedGame.config ?? {}) },
          });
        } else {
          // No saved game — safe to delete any orphaned audio files from a crashed session
          try {
            const cacheDir = new FileSystem.Directory(FileSystem.Paths.cache);
            const files = cacheDir.list();
            files.forEach(entry => {
              if (entry instanceof FileSystem.File && /^round_.*\.m4a$/.test(entry.name)) {
                try {
                  entry.delete();
                } catch (e) {
                  console.warn('Failed to delete leftover audio file:', entry.uri, e);
                }
              }
            });
          } catch (e) {
            console.warn('Audio cache cleanup failed:', e);
          }
        }
      } catch (e) {
        console.warn('Failed to hydrate game state:', e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game)).catch(e => {
      console.warn('Failed to persist game state:', e);
    });
  }, [game, isHydrated]);

  const sortPlayers = (players: Player[]) =>
    [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.id.localeCompare(b.id);
    });

  const getSortedPlayers = () => sortPlayers(game.players);

  const shuffleRounds = (rounds: Round[]) => {
    for (let i = rounds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rounds[i], rounds[j]] = [rounds[j], rounds[i]]; // Swap elements
    }
    return rounds;
  };

  // ─── Exposure-based question distribution ────────────────────────────────
  //
  // Questions are classified as low / medium / high exposure:
  //   LOW    — open-ended, creative. Impostor can use generic answers safely.
  //   MEDIUM — some specificity; a mix of opinion and factual questions.
  //   HIGH   — binary yes/no or very specific. Likely to expose an impostor.
  //
  // Distribution per set when the game is configured with 1 / 2 / 3 sets:
  //
  //   1 set:  50% low · 30% medium · 20% high   (balanced, but skewed easy)
  //
  //   2 sets: set 1 → 70% low · 30% medium ·  0% high  (early game, safe)
  //           set 2 → 10% low · 40% medium · 50% high  (pressure ramps up)
  //
  //   3 sets: set 1 → 100% low ·   0% medium ·  0% high  (all easy start)
  //           set 2 →  30% low ·  50% medium · 20% high  (mixed middle)
  //           set 3 →   0% low ·  30% medium · 70% high  (tough finale)
  //
  const SET_DISTRIBUTIONS: Record<number, { low: number; medium: number; high: number }[]> = {
    1: [{ low: 0.5, medium: 0.3, high: 0.2 }],
    2: [
      { low: 0.7, medium: 0.3, high: 0.0 },
      { low: 0.1, medium: 0.4, high: 0.5 },
    ],
    3: [
      { low: 1.0, medium: 0.0, high: 0.0 },
      { low: 0.3, medium: 0.5, high: 0.2 },
      { low: 0.0, medium: 0.3, high: 0.7 },
    ],
  };

  // Distribute `n` questions across exposure levels according to given ratios.
  // Uses largest-remainder rounding so the counts always sum to exactly n.
  const distributeByExposure = (
    n: number,
    ratios: { low: number; medium: number; high: number }
  ): Record<ExposureLevel, number> => {
    const entries: [ExposureLevel, number][] = [
      ['low', ratios.low],
      ['medium', ratios.medium],
      ['high', ratios.high],
    ];
    const floored = entries.map(([level, ratio]) => ({
      level,
      count: Math.floor(n * ratio),
      remainder: (n * ratio) % 1,
    }));
    let total = floored.reduce((sum, e) => sum + e.count, 0);
    const remaining = n - total;
    // Give the leftover slots to the levels with the largest remainders
    floored.sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < remaining; i++) floored[i].count++;
    return Object.fromEntries(floored.map(e => [e.level, e.count])) as Record<ExposureLevel, number>;
  };

  // Pick one random question from a pool, avoiding already-used indices.
  // Clears the used-index set and retries if every question has been used.
  const pickOneFromPool = (pool: string[], usedIndices: Set<number>) => {
    const available = Array.from({ length: pool.length }, (_, i) => i).filter(
      i => !usedIndices.has(i)
    );
    if (available.length === 0) {
      usedIndices.clear();
      return pickOneFromPool(pool, usedIndices);
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    usedIndices.add(idx);
    return { question: pool[idx], questionIndex: idx };
  };

  const setAllRounds = (
    newPlayers: Player[],
    category: string,
    setsOfQuestions: number,
  ): Round[] => {
    // Each set uses a different player-pair rotation so everyone interacts with
    // different partners across sets:
    //   set 1 — forward chain:   player[i] → player[i+1]
    //   set 2 — backward chain:  player[i] → player[i-1]
    //   set 3 — skip-one chain:  player[i] → player[i+2]
    // Every set is independently shuffled before being appended.
    const n = newPlayers.length;
    const categories: any = allCategories;
    const questionPool: { low: string[]; medium: string[]; high: string[] } =
      categories[category].questions;

    // Separate used-index trackers per exposure level (shared across all sets
    // so the same question is never repeated across different sets either).
    const usedIndices: Record<ExposureLevel, Set<number>> = {
      low: new Set(),
      medium: new Set(),
      high: new Set(),
    };

    const distributions = SET_DISTRIBUTIONS[setsOfQuestions] ?? SET_DISTRIBUTIONS[2];

    // Build the player-pair list for each set number (1-indexed)
    const getPairs = (setNumber: number): [Player, Player][] => {
      const pairs: [Player, Player][] = [];
      if (setNumber === 1) {
        for (let i = 0; i < n; i++)
          pairs.push([newPlayers[i], newPlayers[(i + 1) % n]]);
      } else if (setNumber === 2) {
        for (let i = 0; i < n; i++)
          pairs.push([newPlayers[i], newPlayers[(i - 1 + n) % n]]);
      } else {
        for (let i = 0; i < n; i++)
          pairs.push([newPlayers[i], newPlayers[(i + 2) % n]]);
      }
      return pairs;
    };

    let allRounds: Round[] = [];

    for (let s = 0; s < setsOfQuestions; s++) {
      const setNumber = (s + 1) as 1 | 2 | 3;
      const distribution = distributions[s];
      const counts = distributeByExposure(n, distribution);
      const pairs = getPairs(setNumber);

      // Build a list of (exposure, questionData) in the right proportions
      const questionsForSet: { exposure: ExposureLevel; question: string; questionIndex: number }[] = [];
      for (const level of ['low', 'medium', 'high'] as ExposureLevel[]) {
        for (let q = 0; q < counts[level]; q++) {
          const { question, questionIndex } = pickOneFromPool(questionPool[level], usedIndices[level]);
          questionsForSet.push({ exposure: level, question, questionIndex });
        }
      }
      // Shuffle the question assignments so exposure levels aren't clumped together
      for (let i = questionsForSet.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsForSet[i], questionsForSet[j]] = [questionsForSet[j], questionsForSet[i]];
      }

      // Pair each player-pair with a question
      let setRounds: Round[] = pairs.map((pair, idx) => ({
        id: uuid.v4().toString(),
        playerThatAsks: pair[0],
        playerThatAnswers: pair[1],
        question: questionsForSet[idx].question,
        questionIndex: questionsForSet[idx].questionIndex,
        questionSet: setNumber,
        exposure: questionsForSet[idx].exposure,
        audio: undefined,
      }));

      setRounds = shuffleRounds(setRounds);
      allRounds = allRounds.concat(setRounds);
    }

    return allRounds;
  };

  const getRandomWord = (category: string) => {
    const categories: any = allCategories;
    const categoryWords: string[] = categories[category]?.content ?? [];
    if (categoryWords.length === 0) return '';
    return categoryWords[Math.floor(Math.random() * categoryWords.length)];
  };

  const setNumberOfImpostors = (count: number) => {
    setGame(prev => ({
      ...prev,
      config: {
        ...prev.config,
        numberOfImpostors: count
      }
    }));
  };

  const checkIfPlayerIsLiar = (playerId: string) => {
    return game.lyingPlayers.some((lyingPlayer: Player) => lyingPlayer.id === playerId);
  };

  const setSetsOfQuestions = (sets: number) => {
    setGame(prev => ({ ...prev, config: {...prev.config, setsOfQuestions: sets}}));
  }

  const setGameWord = (category: string) => {
    const { index, word } = getRandomWordIndex(category);
    setGame(prev => ({ ...prev, word, wordIndex: index, category }));
  };

  const setImpostorVotes = (votes: { player: Player; word: string }[]) => {
    setGame(prev => ({ ...prev, impostorVotes: votes }));
  };

  const resetGameWithExistingPlayers = () => {
    // Keeps players with their current scores, resets everything else,
    // and increments both counters so the match display stays consistent (e.g. "Game 3 of 3")
    setGame(prev => {
      const sortedPlayers = sortPlayers(prev.players);

      const previousRankings = sortedPlayers.map((player, idx) => ({
        playerId: player.id,
        position: idx + 1,
        previousScore: player.score,
      }));

      return {
        ...prev,
        previousRankings,
        currentRound: 1,
        rounds: [],
        lyingPlayers: [{ id: '', name: '', theme: '', character: '', score: 0, matchScore: { scoreEvents: [], totalScore: 0 } }],
        category: undefined,
        word: undefined,
        wordIndex: undefined,
        impostorVotes: [],
        showingWordToPlayer: 0,
        votes: [],
        currentMatch: prev.currentMatch + 1,
      }
    });
    };

  const createNewGame = () => {
    // Keeps players but resets their scores and all game state
    setGame(prev => ({
      ...prev,
      players: prev.players.map(p => ({ ...p, score: 0 })),
      currentRound: 1,
      currentMatch: 1,
      rounds: [],
      lyingPlayers: [{ id: '', name: '', theme: '', character: '', score: 0, matchScore: { scoreEvents: [], totalScore: 0 } }],
      category: undefined,
      word: undefined,
      wordIndex: undefined,
      impostorVotes: [],
      showingWordToPlayer: 0,
      votes: [],
      currentScreen: undefined,
      previousRankings: undefined,
    }));
  };

  const chooseRandomLyingPlayers = (players: Player[]) => {
    const shuffled: Player[] = [...players].sort(() => 0.5 - Math.random());
    const lyingPlayers = shuffled.slice(0, game.config.numberOfImpostors);

    return lyingPlayers;
  };

  const getLyingPlayers = () => {
    return game.lyingPlayers;
  };

  const createGame = (newPlayers: Player[]) => {
    setGame(prev => {
      const category = prev.category ?? '';
      const setsOfQuestions = prev.config.setsOfQuestions;
      const rounds = setAllRounds(newPlayers, category, setsOfQuestions);
      const lyingPlayers = chooseRandomLyingPlayers(newPlayers);

      return {
        ...prev,
        players: newPlayers,
        currentRound: 1,
        rounds,
        lyingPlayers,
        impostorVotes: [],
        showingWordToPlayer: 0,
        votes: [],
      };
    });
  };

  const nextRound = () => {
    setGame(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
  };

  const previousRound = () => {
    setGame(prev => ({ ...prev, currentRound: prev.currentRound - 1 }));
  };

  const showWordToNextPlayer = () => {
    setGame(prev => ({ ...prev, showingWordToPlayer: prev.showingWordToPlayer + 1 }));
  };

  const updatePlayers = (players: Player[]) => {
    setGame(prev => ({ ...prev, players }));
  };

  const updateScoreOfTheMatchToPlayer = (players: Player[], player: Player, events: { text: string; points: number }[], total: number): Player[] => {
    return players.map(p =>
      p.id === player.id
        ? { ...p, matchScore: { scoreEvents: events, totalScore: total } }
        : p
    );
  }

  const addVote = (playerThatVoted: Player, playersVoted: Player[]) => {
    setGame(prev => {
      const newVotes = [...prev.votes, { playerThatVoted, playersVoted }];
      return { ...prev, votes: newVotes };
    });
  };

  const resolveScoreOfTheMatch = () => {
    //Compute points for all players, saving on MatchScore array
    setGame(prev => {
      let updatedPlayers = prev.players.map(p => ({
        ...p,
        matchScore: { scoreEvents: [] as { text: string; points: number }[], totalScore: 0 },
      }));
      let globalImpostorsUncovered: string[] = [];

      //scan votes array
      prev.votes.forEach(vote => {
        const playerThatVoted = vote.playerThatVoted;
        let impostorsUncovered: string[] = [];
        let eventsForPlayer: { text: string; points: number }[] = [];
        let totalPointsForPlayer = 0;

        const voterIsImpostor = prev.lyingPlayers.some(lp => lp.id === playerThatVoted.id);

        if(voterIsImpostor) {
          //impostors will not obtain +1pt because they cannot uncover themselves
          impostorsUncovered.push(playerThatVoted.id)
        }

        //scan all players voted
        vote.playersVoted.forEach(playerVoted => {
          const votedIsImpostor = prev.lyingPlayers.find(lp => lp.id === playerVoted.id);

          //if civilian
          if (!voterIsImpostor) {
            //civilian scores +2; +5; +10 points for each impostor voted
            if (votedIsImpostor) {
              //impostor uncovered
              impostorsUncovered.push(playerVoted.id);
              if (!globalImpostorsUncovered.find(imp => imp === playerVoted.id)) globalImpostorsUncovered.push(playerVoted.id);
              if (impostorsUncovered.length === 1) {
                eventsForPlayer.push({ text: `Detected 1 impostor`, points: 2 });
                totalPointsForPlayer += 2;
              } else if (impostorsUncovered.length === 2) {
                eventsForPlayer.push({ text: `Detected 2 impostors!`, points: 3 });
                totalPointsForPlayer += 3;
              } else if (impostorsUncovered.length === 3) {
                eventsForPlayer.push({ text: `Detected 3 impostors!!!`, points: 5 });
                totalPointsForPlayer += 5;
              }
            }
          } else {
            //if impostor, scores +2 points for each other impostor uncovered
            if (votedIsImpostor) {
              impostorsUncovered.push(playerVoted.id);
              if (!globalImpostorsUncovered.find(imp => imp === playerVoted.id)) globalImpostorsUncovered.push(playerVoted.id);
              eventsForPlayer.push({ text: `Detected ${playerVoted.name}`, points: 2 });
              totalPointsForPlayer += 2;
            }
          }
        });

        // +1 pt per impostor not uncovered by this voter — runs once per voter, not per voted suspect
        prev.lyingPlayers.forEach(lyingPlayer => {
          if (!impostorsUncovered.find(p => p === lyingPlayer.id)) {
            const current = updatedPlayers.find(p => p.id === lyingPlayer.id)!;
            const playerEvents = [...current.matchScore.scoreEvents, { text: 'Undetected by a player', points: 1 }];
            updatedPlayers = updateScoreOfTheMatchToPlayer(updatedPlayers, lyingPlayer, playerEvents, current.matchScore.totalScore + 1);
          }
        });

        //add matchScore for playerThatVoted
        updatedPlayers = updateScoreOfTheMatchToPlayer(updatedPlayers, playerThatVoted, eventsForPlayer, totalPointsForPlayer);
      });

      //all impostors that were not uncovered at all, +3/5/10pts - but it'll remove the +1 per player previously earned
      prev.lyingPlayers.forEach(lyingPlayer => {
        if (!globalImpostorsUncovered.find(p => p === lyingPlayer.id)) {
          const numberOfImpostors = prev.config.numberOfImpostors
          const pointsToAdd = numberOfImpostors === 1 ? 3 : numberOfImpostors === 2 ? 5 : 10
          const current = updatedPlayers.find(p => p.id === lyingPlayer.id)!;
          const undiscoveredCount = current.matchScore.scoreEvents.filter(e => e.text === 'Undetected by a player').length;
          const filteredEvents = current.matchScore.scoreEvents.filter(e => e.text !== 'Undetected by a player');
          // Replace accumulated +1 pts with the flat bonus; store points: pointsToAdd so the animation ticks correctly
          const playerEvents = [...filteredEvents, { text: `Never detected!!!`, points: pointsToAdd }];
          updatedPlayers = updateScoreOfTheMatchToPlayer(updatedPlayers, lyingPlayer, playerEvents, current.matchScore.totalScore - undiscoveredCount + pointsToAdd);
        }
      });

      //scan impostor votes for secret words
      prev.impostorVotes.forEach(vote => {
        //if impostor guessed right the secret word, +3pts
        if(vote.word === prev.word) {
          const current = updatedPlayers.find(p => p.id === vote.player.id)!;
          const playerEvents = [...current.matchScore.scoreEvents, { text: 'Right word guess', points: 3 }];
          updatedPlayers = updateScoreOfTheMatchToPlayer(updatedPlayers, vote.player, playerEvents, current.matchScore.totalScore + 3);
        }
      });

      return {
        ...prev,
        players: updatedPlayers.map(p => ({
          ...p,
          score: p.score + p.matchScore.totalScore,
        })),
      };
    });
  }

  const getCurrentWord = () => {
    if (!game.category || game.wordIndex === undefined) return '';
    const categories: any = allCategories;
    if (!categories[game.category]?.content) return '';
    return categories[game.category].content[game.wordIndex];
  };

  const getCurrentQuestion = (): string => {
    if (game.rounds.length === 0) return '';
    const currentRound = game.rounds[game.currentRound - 1];
    return currentRound?.question ?? '';
  };

  const saveRecordingToRound = (recording: string) => {
    setGame(prev => {
      const newRounds = prev.rounds.map((round, idx) => {
        if (idx === prev.currentRound - 1) {
          return { ...round, audio: recording };
        }
        return round;
      });
      return { ...prev, rounds: newRounds };
    });
  };

  const getRoundAudio = () => {
    return game.rounds[game.currentRound - 1]?.audio
  }

  const setCurrentScreen = (screen: string) => {
    setGame(prev => ({ ...prev, currentScreen: screen }));
  };

  return (
    <GameContext.Provider
      value={{
        game,
        createGame,
        createNewGame,
        setGameWord,
        getRandomWord,
        getLyingPlayers,
        setNumberOfImpostors,
        checkIfPlayerIsLiar,
        setSetsOfQuestions,
        setImpostorVotes,
        nextRound,
        previousRound,
        showWordToNextPlayer,
        addVote,
        updatePlayers,
        resetGameWithExistingPlayers,
        getCurrentWord,
        getCurrentQuestion,
        saveRecordingToRound,
        getRoundAudio,
        setCurrentScreen,
        getSortedPlayers,
        resolveScoreOfTheMatch,
        isHydrated,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
