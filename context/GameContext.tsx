import { Game } from '@/types/Game';
import { Player } from '@/types/Player';
import { Round } from '@/types/Round';
// import questions from '@/data/questions.json';
import allCategories from '@/data/categories.json';
import { createContext, useState, useContext, useEffect } from 'react';
import uuid from 'react-native-uuid';
import * as FileSystem from 'expo-file-system';
import { useTranslation, Language } from '@/translations';
import {
  getRandomWordIndex,
  getQuestionByIndex,
} from '@/utils/gameTranslations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_STORAGE_KEY = 'game_state';

const INITIAL_GAME: Game = {
  players: [],
  currentRound: 1,
  rounds: [],
  lyingPlayers: [],
  config: { numberOfImpostors: 1 },
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
  setGameWord: (category: string) => void;
  getRandomWord: (category: string) => string;
  setImpostorVotes: (votes: { player: Player; word: string }[]) => void;
  nextRound: () => void;
  previousRound: () => void;
  showWordToNextPlayer: () => void;
  addVote: (playerThatVoted: Player, playersVoted: Player[]) => void;
  updatePlayers: (players: Player[]) => void;
  updatePointsToPlayer: (player: Player, points: number) => Player[];
  resetGameWithExistingPlayers: () => void;
  getCurrentWord: () => string;
  checkVoteForSecretWord: () => void;
  getCurrentQuestion: () => string;
  saveRecordingToRound: (recording: string) => void;
  getRoundAudio: () => string | undefined;
  setCurrentScreen: (screen: string) => void;
  getSortedPlayers: () => Player[];
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

  const getRandomQuestionFromSet = (
    setOfQuestions: string[],
    usedIndices: Set<number>
  ) => {
    const availableIndices = Array.from(
      { length: setOfQuestions.length },
      (_, i) => i
    ).filter(i => !usedIndices.has(i));

    if (availableIndices.length === 0) {
      usedIndices.clear();
      return getRandomQuestionFromSet(setOfQuestions, usedIndices);
    }

    const randomIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const randomQuestion = setOfQuestions[randomIndex];
    usedIndices.add(randomIndex);

    return { question: randomQuestion, questionIndex: randomIndex };
  };

  const setAllRounds = (
    newPlayers: Player[],
    category: string,
  ): Round[] => {
    //the order of questions will always follow the crescent order of Players on the array
    //a 3 player game will have 1 round of questions: A->B, B->C, C->A
    //the next round of questions will be: A->C, C->B, B->A
    //after that, all rounds order will be randomized.
    const numberOfPlayers = newPlayers.length;
    let rounds: Round[] = [];
    let auxRoundsArray: Round[] = [];

    const categories: any = allCategories;
    const firstSetOfQuestions: string[] =
      categories[category].firstSetOfQuestions;
    const secondSetOfQuestions: string[] =
      categories[category].secondSetOfQuestions;

    const usedFirstIndices = new Set<number>();
    const usedSecondIndices = new Set<number>();

    //insert first set of rounds and shuffle
    for (let i = 0; i < numberOfPlayers; i++) {
      const playerThatAsks = newPlayers[i];
      const playerThatAnswers =
        i === numberOfPlayers - 1 ? newPlayers[0] : newPlayers[i + 1];
      const questionData = getRandomQuestionFromSet(
        firstSetOfQuestions,
        usedFirstIndices
      );

      const round: Round = {
        id: uuid.v4().toString(),
        playerThatAsks,
        playerThatAnswers,
        question: questionData.question,
        questionIndex: questionData.questionIndex,
        questionSet: 'first',
        audio: undefined
      };

      rounds.push(round);
    }

    rounds = shuffleRounds(rounds);

    //insert second set of rounds
    for (let i = numberOfPlayers - 1; i >= 0; i--) {
      const playerThatAsks = newPlayers[i];
      const playerThatAnswers =
        i === 0 ? newPlayers[numberOfPlayers - 1] : newPlayers[i - 1];
      const questionData = getRandomQuestionFromSet(
        secondSetOfQuestions,
        usedSecondIndices
      );

      const round: Round = {
        id: uuid.v4().toString(),
        playerThatAsks,
        playerThatAnswers,
        question: questionData.question,
        questionIndex: questionData.questionIndex,
        questionSet: 'second',
        audio: undefined
      };

      auxRoundsArray.push(round);
    }

    auxRoundsArray = shuffleRounds(auxRoundsArray);
    rounds = rounds.concat(auxRoundsArray);

    return rounds;
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

  const checkVoteForSecretWord = () => {
    setGame(prev => {
      if (prev.impostorVotes.length === 0) return prev;

      let updatedPlayers = [...prev.players];
      for (const vote of prev.impostorVotes) {
        if (vote.word === prev.word) {
          updatedPlayers = updatedPlayers.map(p =>
            p.id === vote.player.id ? { ...p, score: p.score + 2 } : p
          );
        }
      }
      return { ...prev, players: updatedPlayers };
    });
  };

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
        lyingPlayers: [{ id: '', name: '', theme: '', character: '', score: 0 }],
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
      lyingPlayers: [{ id: '', name: '', theme: '', character: '', score: 0 }],
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
      const rounds = setAllRounds(newPlayers, category);
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

  const updatePointsToPlayer = (player: Player, points: number) => {
    const updatedPlayers = game.players.map(p => {
      if (player.id === p.id) {
        return { ...p, score: p.score + points };
      } else {
        return p;
      }
    });

    return updatedPlayers;
  };

  const addVote = (playerThatVoted: Player, playersVoted: Player[]) => {
    setGame(prev => {
      const newVotes = [...prev.votes, { playerThatVoted, playersVoted }];

      if (playerThatVoted.id === prev.lyingPlayers[0].id) {
        //the impostor does not compute points with his vote
        return { ...prev, votes: newVotes };
      }

      //add 3 points if player voted correctly on the impostor
      if (playersVoted.some(p => p.id === prev.lyingPlayers[0].id)) {
        const updatedPlayers = prev.players.map(p =>
          p.id === playerThatVoted.id ? { ...p, score: p.score + 3 } : p
        );
        return { ...prev, votes: newVotes, players: updatedPlayers };
      } else {
        //add 1 point to the impostor
        const updatedPlayers = prev.players.map(p =>
          p.id === prev.lyingPlayers[0].id ? { ...p, score: p.score + 1 } : p
        );
        return { ...prev, votes: newVotes, players: updatedPlayers };
      }
    });
  };

  const getCurrentWord = () => {
    if (!game.category || game.wordIndex === undefined) return '';
    const categories: any = allCategories;
    if (!categories[game.category]?.content) return '';
    return categories[game.category].content[game.wordIndex];
  };

  const getCurrentQuestion = (): string => {
    if (!game.category || game.rounds.length === 0) return '';
    const currentRound = game.rounds[game.currentRound - 1];
    if (!currentRound) return '';

    const categories: any = allCategories;
    const questionSet =
      currentRound.questionSet === 'first'
        ? 'firstSetOfQuestions'
        : 'secondSetOfQuestions';
    return categories[game.category][questionSet][
      currentRound.questionIndex
    ];
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
        setImpostorVotes,
        nextRound,
        previousRound,
        showWordToNextPlayer,
        addVote,
        updatePointsToPlayer,
        updatePlayers,
        resetGameWithExistingPlayers,
        getCurrentWord,
        checkVoteForSecretWord,
        getCurrentQuestion,
        saveRecordingToRound,
        getRoundAudio,
        setCurrentScreen,
        getSortedPlayers,
        isHydrated,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
