import { Game } from '@/types/Game';
import { Player } from '@/types/Player';
import { Round } from '@/types/Round';
// import questions from '@/data/questions.json';
import allCategories from '@/data/categories.json';
import { createContext, useState, useContext } from 'react';
import { useTranslation, Language } from '@/translations';
import {
  getRandomWordIndex,
  getQuestionByIndex,
} from '@/utils/gameTranslations';

interface GameContextType {
  game: Game;
  createGame: (players: Player[]) => void;
  createNewGame: () => void;
  setMaximumMatches: (maxQtd: number) => void;
  setLyingPlayer: (players: Player[]) => Player;
  addNewMatch: () => void;
  setGameWord: (category: string) => void;
  getRandomWord: (category: string) => string;
  setSelectedWord: (newWord: string) => void;
  nextRound: () => void;
  previousRound: () => void;
  showWordToNextPlayer: () => void;
  addVote: (playerThatVoted: Player, playerVoted: Player) => void;
  updatePlayers: (players: Player[]) => void;
  updatePointsToPlayer: (player: Player, points: number) => Player[];
  resetGameWithExistingPlayers: () => void;
  getCurrentWord: () => string;
  checkVoteForSecretWord: () => void;
  getCurrentQuestion: () => string;
}

export const GameContext = createContext({} as GameContextType);

export const GameContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const newGame: Game = {
    players: [],
    currentRound: 1,
    rounds: [],
    lyingPlayer: { id: '', name: '', gender: '', character: '', score: 0 },
    category: undefined,
    word: undefined,
    wordIndex: undefined,
    selectedWord: undefined,
    showingWordToPlayer: 0,
    votes: [],
    maximumMatches: 2,
    currentMatch: 1,
  };

  const [game, setGame] = useState<Game>(newGame);

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
        playerThatAsks,
        playerThatAnswers,
        question: questionData.question,
        questionIndex: questionData.questionIndex,
        questionSet: 'first',
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
        playerThatAsks,
        playerThatAnswers,
        question: questionData.question,
        questionIndex: questionData.questionIndex,
        questionSet: 'second',
      };

      auxRoundsArray.push(round);
    }

    auxRoundsArray = shuffleRounds(auxRoundsArray);
    rounds = rounds.concat(auxRoundsArray);

    return rounds;
  };

  const setMaximumMatches = (maxQtd: number) => {
    setGame({ ...game, maximumMatches: maxQtd });
  };

  const addNewMatch = () => {
    const newMatch = game.currentMatch + 1;
    setGame({ ...game, currentMatch: newMatch });
  };

  const getRandomWord = (category: string) => {
    const categories: any = allCategories;
    const categoryWords: string[] = categories[category].content;
    return categoryWords[Math.floor(Math.random() * categoryWords.length)];
  };

  const checkVoteForSecretWord = () => {
    if (game.word === game.selectedWord) {
      // Get the current lying player from the players array to ensure we have the latest score
      const currentLyingPlayer = game.players.find(
        p => p.id === game.lyingPlayer.id
      );
      if (currentLyingPlayer) {
        const updatedPlayers = updatePointsToPlayer(currentLyingPlayer, 2);
        // Also update the lyingPlayer object with the new score
        const updatedLyingPlayer = updatedPlayers.find(
          p => p.id === game.lyingPlayer.id
        );
        setGame({
          ...game,
          players: updatedPlayers,
          lyingPlayer: updatedLyingPlayer || game.lyingPlayer,
        });
      }
    }
  };

  const setGameWord = (category: string) => {
    const { index, word } = getRandomWordIndex(category);
    setGame({ ...game, word, wordIndex: index, category });
  };

  const setSelectedWord = (newWord: string) => {
    setGame({ ...game, selectedWord: newWord });
  };

  const resetGameWithExistingPlayers = () => {
    const newGame = {
      ...game,
      currentRound: 1,
      rounds: [],
      lyingPlayer: { id: '', name: '', gender: '', character: '', score: 0 },
      category: game.category ? game.category : '',
      word: game.word ? game.word : '',
      wordIndex: game.wordIndex,
      selectedWord: undefined,
      showingWordToPlayer: 0,
      votes: [],
    };

    return newGame;
  };

  const createNewGame = () => {
    const players = game.players.map(p => {
      return { ...p, score: 0 };
    });

    setGame({
      ...game,
      players,
      currentRound: 1,
      rounds: [],
      lyingPlayer: { id: '', name: '', gender: '', character: '', score: 0 },
      category: undefined,
      word: undefined,
      wordIndex: undefined,
      selectedWord: undefined,
      showingWordToPlayer: 0,
      votes: [],
    });
  };

  const setLyingPlayer = (players: Player[]) => {
    const lyingPlayer: Player =
      players[Math.floor(Math.random() * players.length)]; //get a random player to be out of the round

    setGame({ ...newGame, lyingPlayer });
    return lyingPlayer;
  };

  const createGame = (newPlayers: Player[]) => {
    const newGame = resetGameWithExistingPlayers();
    const category = game.category ? game.category : '';
    const rounds = setAllRounds(newPlayers, category);
    const lyingPlayer = setLyingPlayer(newPlayers);

    setGame({ ...newGame, players: newPlayers, rounds, lyingPlayer });
  };

  const nextRound = () => {
    const newRound = game.currentRound + 1;
    setGame({ ...game, currentRound: newRound });
  };

  const previousRound = () => {
    const newRound = game.currentRound - 1;
    setGame({ ...game, currentRound: newRound });
  };

  const showWordToNextPlayer = () => {
    const nextPlayer = game.showingWordToPlayer + 1;
    setGame({ ...game, showingWordToPlayer: nextPlayer });
  };

  const updatePlayers = (players: Player[]) => {
    setGame({ ...game, players });
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

  const addVote = (playerThatVoted: Player, playerVoted: Player) => {
    const newVotes = [...game.votes, { playerThatVoted, playerVoted }];

    if (playerThatVoted.id === game.lyingPlayer.id) {
      //the impostor does not compute points with his vote
      setGame({ ...game, votes: newVotes });
      return;
    }

    //add 3 points if player voted correctly on the impostor
    if (playerVoted.id === game.lyingPlayer.id) {
      const updatedPlayers = updatePointsToPlayer(playerThatVoted, 3);
      setGame({ ...game, votes: newVotes, players: updatedPlayers });
    } else {
      //add 1 point to the impostor
      const updatedPlayers = updatePointsToPlayer(game.lyingPlayer, 1);
      setGame({ ...game, votes: newVotes, players: updatedPlayers });
    }
  };

  const getCurrentWord = () => {
    if (!game.category || game.wordIndex === undefined) return '';
    const categories: any = allCategories;
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

  return (
    <GameContext.Provider
      value={{
        game,
        setMaximumMatches,
        addNewMatch,
        createGame,
        createNewGame,
        setLyingPlayer,
        setGameWord,
        getRandomWord,
        setSelectedWord,
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
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
