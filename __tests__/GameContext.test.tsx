import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameContext, GameContextProvider } from '@/context/GameContext';
import { Player } from '@/types/Player';

// Mock the categories data
jest.mock('@/data/categories.json', () => ({
  testCategory: {
    en: {
        content: ['word1', 'word2', 'word3', 'word4', 'word5'],
        firstSetOfQuestions: [
          'Question 1?',
          'Question 2?',
          'Question 3?',
          'Question 4?',
        ],
        secondSetOfQuestions: [
          'Question 5?',
          'Question 6?',
          'Question 7?',
          'Question 8?',
        ],
      },
    },
  anotherCategory: {
    en: {
      content: ['apple', 'banana', 'orange'],
      firstSetOfQuestions: ['What fruit?', 'Which one?'],
      secondSetOfQuestions: ['How many?', 'What color?'],
    }
  },
}));

// Helper function to create test players
const createTestPlayers = (): Player[] => [
  {
    id: '1',
    name: 'Player 1',
    gender: 'male',
    character: 'character1',
    score: 0,
  },
  {
    id: '2',
    name: 'Player 2',
    gender: 'female',
    character: 'character2',
    score: 0,
  },
  {
    id: '3',
    name: 'Player 3',
    gender: 'male',
    character: 'character3',
    score: 0,
  },
];

// Helper function to render hook with provider
const renderGameContext = () => {
  return renderHook(() => React.useContext(GameContext), {
    wrapper: ({ children }) => (
      <GameContextProvider>{children}</GameContextProvider>
    ),
  });
};

describe('GameContext', () => {
  describe('Initial State', () => {
    it('should initialize with default game state', () => {
      const { result } = renderGameContext();

      expect(result.current.game).toEqual({
        players: [],
        currentRound: 1,
        rounds: [],
        lyingPlayer: { id: '', name: '', gender: '', character: '', score: 0 },
        category: undefined,
        word: undefined,
        selectedWord: undefined,
        showingWordToPlayer: 0,
        votes: [],
        maximumMatches: 2,
        currentMatch: 1,
      });
    });
  });

  describe('setMaximumMatches', () => {
    it('should update maximum matches', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setMaximumMatches(5);
      });

      expect(result.current.game.maximumMatches).toBe(5);
    });
  });

  describe('addNewMatch', () => {
    it('should increment current match by 1', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.addNewMatch();
      });

      expect(result.current.game.currentMatch).toBe(2);

      act(() => {
        result.current.addNewMatch();
      });

      expect(result.current.game.currentMatch).toBe(3);
    });
  });

  describe('getRandomWord', () => {
    it('should return a random word from the specified category', () => {
      const { result } = renderGameContext();
      const expectedWords = ['word1', 'word2', 'word3', 'word4', 'word5'];

      const word = result.current.getRandomWord('testCategory', 'en');

      expect(expectedWords).toContain(word);
    });

    it('should return different words from different categories', () => {
      const { result } = renderGameContext();

      const word1 = result.current.getRandomWord('testCategory', 'en');
      const word2 = result.current.getRandomWord('anotherCategory', 'en');

      expect(['word1', 'word2', 'word3', 'word4', 'word5']).toContain(word1);
      expect(['apple', 'banana', 'orange']).toContain(word2);
    });
  });

  describe('setSelectedWord', () => {
    it('should update selected word', () => {
      const { result } = renderGameContext();
      const testWord = 'test word';

      act(() => {
        result.current.setSelectedWord(testWord);
      });

      expect(result.current.game.selectedWord).toBe(testWord);
    });
  });

  describe('nextRound', () => {
    it('should increment current round by 1', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.game.currentRound).toBe(2);

      act(() => {
        result.current.nextRound();
      });

      expect(result.current.game.currentRound).toBe(3);
    });
  });

  describe('previousRound', () => {
    it('should decrement current round by 1', () => {
      const { result } = renderGameContext();

      // First set to round 3
      act(() => {
        result.current.nextRound();
      });
      act(() => {
        result.current.nextRound();
      });

      expect(result.current.game.currentRound).toBe(3);

      act(() => {
        result.current.previousRound();
      });

      expect(result.current.game.currentRound).toBe(2);
    });
  });

  describe('showWordToNextPlayer', () => {
    it('should increment showingWordToPlayer by 1', () => {
      const { result } = renderGameContext();

      expect(result.current.game.showingWordToPlayer).toBe(0);

      act(() => {
        result.current.showWordToNextPlayer();
      });

      expect(result.current.game.showingWordToPlayer).toBe(1);

      act(() => {
        result.current.showWordToNextPlayer();
      });

      expect(result.current.game.showingWordToPlayer).toBe(2);
    });
  });

  //todo edge case, last player

  describe('updatePlayers', () => {
    it('should update the players array', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.updatePlayers(testPlayers);
      });

      expect(result.current.game.players).toEqual(testPlayers);
    });
  });

  describe('updatePointsToPlayer', () => {
    it('should update points for specific player and return updated players array', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.updatePlayers(testPlayers);
      });

      const updatedPlayers = result.current.updatePointsToPlayer(
        testPlayers[0],
        25
      );

      expect(updatedPlayers[0].score).toBe(25); // 0 + 25
      expect(updatedPlayers[1].score).toBe(0); // unchanged
      expect(updatedPlayers[2].score).toBe(0); // unchanged
    });
  });

  describe('createNewGame', () => {
    it('should reset game state while preserving players with score 0', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      // Setup initial game state
      act(() => {
        result.current.updatePlayers(testPlayers);
        result.current.setSelectedWord('test word');
        result.current.nextRound();
        result.current.showWordToNextPlayer();
      });

      // Create new game
      act(() => {
        result.current.createNewGame();
      });

      expect(result.current.game.currentRound).toBe(1);
      expect(result.current.game.rounds).toEqual([]);
      expect(result.current.game.selectedWord).toBeUndefined();
      expect(result.current.game.showingWordToPlayer).toBe(0);
      expect(result.current.game.votes).toEqual([]);
      expect(result.current.game.players.every(p => p.score === 0)).toBe(true);
      expect(result.current.game.lyingPlayer).toEqual({
        id: '',
        name: '',
        gender: '',
        character: '',
        score: 0,
      });
    });
  });

  describe('createGame', () => {
    beforeEach(() => {
      // Mock Math.random to make tests predictable
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a new game with players and rounds', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      // First set a category and word
      act(() => {
        result.current.setGameWord('testCategory', 'en');
      });

      act(() => {
        result.current.createGame(testPlayers, 'en');
      });

      expect(result.current.game.players).toEqual(testPlayers);
      expect(result.current.game.rounds.length).toBeGreaterThan(0);
      expect(result.current.game.lyingPlayer).toBeDefined();
      expect(
        testPlayers.some(p => p.id === result.current.game.lyingPlayer.id)
      ).toBe(true);
    });

    it('should create correct number of rounds for players', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.setGameWord('testCategory', 'en');
      });

      act(() => {
        result.current.createGame(testPlayers, 'en');
      });

      // Should create 2 sets of rounds (first and second set)
      // Each set has numberOfPlayers rounds
      expect(result.current.game.rounds.length).toBe(testPlayers.length * 2);
    });
  });

  describe('addVote', () => {
    it('should add vote to votes array', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      const voter = testPlayers[0];
      const voted = testPlayers[1];

      act(() => {
        result.current.updatePlayers(testPlayers);
        result.current.addVote(voter, voted);
      });

      expect(result.current.game.votes).toHaveLength(1);
      expect(result.current.game.votes[0]).toEqual({
        playerThatVoted: voter,
        playerVoted: voted,
      });
    });

    it('should add 3 points when voting correctly for the lying player', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.setGameWord('testCategory', 'en');
      });

      // Set lying player manually by updating the game state
      act(() => {
        result.current.createGame(testPlayers, 'en');
      });

      // Get the current lying player and vote for them
      const currentLyingPlayer = result.current.game.lyingPlayer;
      const voter =
        testPlayers[0].id === currentLyingPlayer.id
          ? testPlayers[1]
          : testPlayers[0];

      act(() => {
        result.current.addVote(voter, currentLyingPlayer);
      });

      expect(result.current.game.votes).toHaveLength(1);

      // Find the voter in the updated players array
      const updatedVoter = result.current.game.players.find(
        p => p.id === voter.id
      );
      expect(updatedVoter?.score).toBe(3); // Original score (0) + 3 points
    });

    it('should add 2 points when voting correctly for the secret word', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.setGameWord('testCategory', 'en');
      });

      // Set lying player manually by updating the game state
      act(() => {
        result.current.createGame(testPlayers, 'en');
      });

      // Set vote for lying player to be the correct one
      const secretWord = result.current.game.word
      act(() => {
        result.current.setSelectedWord(secretWord!);
      });

      // Check the vote for secret word, if correct, lying player scores 2pts
      act(() => {
        result.current.checkVoteForSecretWord();
      });

      // Get the current lying player from both the lyingPlayer object and players array
      const currentLyingPlayer = result.current.game.lyingPlayer;
      const lyingPlayerFromArray = result.current.game.players.find(
        p => p.id === currentLyingPlayer.id
      );

      // Both should have the same score of 2
      expect(currentLyingPlayer.score).toBe(2); // Original score (0) + 2 points
      expect(lyingPlayerFromArray?.score).toBe(2); // Should also be updated in the array
    });

    it('should not add points when voting incorrectly', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.setGameWord('testCategory', 'en');
      });

      act(() => {
        result.current.updatePlayers(testPlayers);
        result.current.createGame(testPlayers, 'en');
      });

      // Vote for someone who is NOT the lying player
      const lyingPlayer = result.current.game.lyingPlayer;
      const voter =
        lyingPlayer.id === testPlayers[0].id ? testPlayers[1] : testPlayers[0];
      const nonLyingPlayer = testPlayers.find(p => p.id !== lyingPlayer.id);

      if (nonLyingPlayer) {
        act(() => {
          result.current.addVote(voter, nonLyingPlayer);
        });

        const updatedVoter = result.current.game.players.find(
          p => p.id === voter.id
        );
        expect(updatedVoter?.score).toBe(0); // No points added
      }
    });
  });

  describe('Context Provider', () => {
    it('should provide all context methods', () => {
      const { result } = renderGameContext();

      expect(typeof result.current.createGame).toBe('function');
      expect(typeof result.current.createNewGame).toBe('function');
      expect(typeof result.current.setMaximumMatches).toBe('function');
      expect(typeof result.current.addNewMatch).toBe('function');
      expect(typeof result.current.setGameWord).toBe('function');
      expect(typeof result.current.getRandomWord).toBe('function');
      expect(typeof result.current.setSelectedWord).toBe('function');
      expect(typeof result.current.nextRound).toBe('function');
      expect(typeof result.current.previousRound).toBe('function');
      expect(typeof result.current.showWordToNextPlayer).toBe('function');
      expect(typeof result.current.addVote).toBe('function');
      expect(typeof result.current.updatePlayers).toBe('function');
      expect(typeof result.current.updatePointsToPlayer).toBe('function');
      expect(typeof result.current.resetGameWithExistingPlayers).toBe(
        'function'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty players array in createGame', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setGameWord('testCategory', 'en');
        result.current.createGame([], 'en');
      });

      expect(result.current.game.players).toEqual([]);
      expect(result.current.game.rounds).toEqual([]);
    });

    it('should handle single player in createGame', () => {
      const { result } = renderGameContext();
      const singlePlayer = [createTestPlayers()[0]];

      act(() => {
        result.current.setGameWord('testCategory', 'en');
        result.current.createGame(singlePlayer, 'en');
      });

      expect(result.current.game.players).toEqual(singlePlayer);
      expect(result.current.game.rounds.length).toBe(2); // 2 sets of 1 round each
    });

    it('should handle updatePointsToPlayer with negative points', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.updatePlayers(testPlayers);
      });

      const updatedPlayers = result.current.updatePointsToPlayer(
        testPlayers[1],
        -5
      );

      expect(updatedPlayers[1].score).toBe(-5); // 0 + (-5)
    });
  });
});
