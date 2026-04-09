/**
 * GameContext Tests
 *
 * QA GUIDE — WHY THIS FILE EXISTS
 * ---------------------------------
 * The GameContext is the single source of truth for all game state. If its
 * logic breaks, every screen breaks. We test it in isolation here (no real
 * UI, no navigation) so that we can validate pure business rules quickly and
 * cheaply — before any component ever touches this code in a real device run.
 *
 * Rule of thumb: test BEHAVIOUR, not implementation. We don't care HOW the
 * context stores its data internally; we care that the public contract it
 * exposes to the rest of the app is correct.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { GameContext, GameContextProvider } from '@/context/GameContext';
import { Player } from '@/types/Player';

// ─── Module mocks ──────────────────────────────────────────────────────────
//
// QA NOTE — Why mock external modules?
// Mocking AsyncStorage, expo-file-system, and the translation utility means
// our tests run completely in-memory. They are fast, deterministic, and never
// fail because a device API isn't available in the test runner (Node.js).
// If we DON'T mock these, every test that merely renders the provider would
// start async I/O and be unreliable.

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('expo-file-system', () => ({
  Directory: jest.fn().mockImplementation(() => ({
    list: jest.fn().mockReturnValue([]),
  })),
  File: class {},
  Paths: { cache: '/cache' },
}));

// We mock getRandomWordIndex so that setGameWord always resolves to a known,
// predictable word ('word1' at index 0). Without this, tests that depend on
// the word value would be flaky because the real utility picks randomly.
jest.mock('@/utils/gameTranslations', () => ({
  getRandomWordIndex: jest.fn().mockReturnValue({ index: 0, word: 'word1' }),
  getWordByIndex: jest
    .fn()
    .mockImplementation((category: string, index: number) => {
      const words: Record<string, string[]> = {
        testCategory: ['word1', 'word2', 'word3', 'word4', 'word5'],
        anotherCategory: ['apple', 'banana', 'orange'],
      };
      return words[category]?.[index] ?? '';
    }),
}));

// Keep the categories mock in sync with the structure the real file uses:
// every category needs both `content` (the word list) and `questions`
// (low / medium / high pools). If you add a new category to categories.json
// you should add a matching entry here so tests that call createGame still work.
jest.mock('@/data/categories.json', () => ({
  testCategory: {
    content: ['word1', 'word2', 'word3', 'word4', 'word5'],
    questions: {
      low: [
        'Low Q1?',
        'Low Q2?',
        'Low Q3?',
        'Low Q4?',
        'Low Q5?',
        'Low Q6?',
        'Low Q7?',
        'Low Q8?',
      ],
      medium: [
        'Med Q1?',
        'Med Q2?',
        'Med Q3?',
        'Med Q4?',
        'Med Q5?',
        'Med Q6?',
        'Med Q7?',
        'Med Q8?',
      ],
      high: [
        'High Q1?',
        'High Q2?',
        'High Q3?',
        'High Q4?',
        'High Q5?',
        'High Q6?',
        'High Q7?',
        'High Q8?',
      ],
    },
  },
  anotherCategory: {
    content: ['apple', 'banana', 'orange'],
    questions: {
      low: ['Low QA?', 'Low QB?', 'Low QC?', 'Low QD?'],
      medium: ['Med QA?', 'Med QB?', 'Med QC?', 'Med QD?'],
      high: ['High QA?', 'High QB?', 'High QC?', 'High QD?'],
    },
  },
}));

// ─── Test helpers ──────────────────────────────────────────────────────────

/**
 * QA NOTE — Helper factories
 * Always use a factory function for test data, never a raw object literal
 * at the top of the file. A top-level object is shared across tests and can
 * carry mutation from one test into the next (a "test bleed" bug that is
 * notoriously hard to debug). Calling the factory in each test gives you a
 * fresh, independent copy every time.
 */
const createMatchScore = () => ({ scoreEvents: [], totalScore: 0 });

const createTestPlayers = (): Player[] => [
  {
    id: '1',
    name: 'Player 1',
    theme: 'theme1',
    character: 'character1',
    score: 0,
    matchScore: createMatchScore(),
  },
  {
    id: '2',
    name: 'Player 2',
    theme: 'theme2',
    character: 'character2',
    score: 0,
    matchScore: createMatchScore(),
  },
  {
    id: '3',
    name: 'Player 3',
    theme: 'theme3',
    character: 'character3',
    score: 0,
    matchScore: createMatchScore(),
  },
];

/** Renders the hook and wraps it in the real provider. */
const renderGameContext = () =>
  renderHook(() => React.useContext(GameContext), {
    wrapper: ({ children }) => (
      <GameContextProvider>{children}</GameContextProvider>
    ),
  });

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('GameContext', () => {
  // ── 1. Initial State ────────────────────────────────────────────────────
  //
  // QA NOTE — Why test initial state?
  // Any screen that mounts before a game is started reads the initial state.
  // If a field is accidentally undefined when the code expects an empty array
  // (or vice versa), the app crashes on first run. This test acts as a
  // contract: "the shape of a fresh game is exactly this."
  describe('Initial State', () => {
    it('should initialise with the correct default game state', async () => {
      const { result } = renderGameContext();

      // Wait for the AsyncStorage hydration effect to finish so `isHydrated`
      // is true and the state has its final initial value.
      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      expect(result.current.game).toEqual({
        players: [],
        currentRound: 1,
        rounds: [],
        lyingPlayers: [],
        config: {
          numberOfImpostors: 1,
          setsOfQuestions: 2,
          randomImpostors: false,
        },
        category: undefined,
        word: undefined,
        wordIndex: undefined,
        impostorVotes: [],
        showingWordToPlayer: 0,
        votes: [],
        currentMatch: 1,
      });
    });

    it('should set isHydrated to true after AsyncStorage resolves', async () => {
      const { result } = renderGameContext();
      await waitFor(() => expect(result.current.isHydrated).toBe(true));
    });
  });

  // ── 2. Game Configuration ───────────────────────────────────────────────
  //
  // QA NOTE — Why test config setters individually?
  // The config object (numberOfImpostors, setsOfQuestions, randomImpostors)
  // drives a large part of the game setup logic. We test each setter in
  // isolation so that a bug in one doesn't mask a bug in another.
  describe('Game Configuration', () => {
    it('setNumberOfImpostors — should update config.numberOfImpostors', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setNumberOfImpostors(2);
      });

      expect(result.current.game.config.numberOfImpostors).toBe(2);
    });

    it('setNumberOfImpostors — should not affect other config fields', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setNumberOfImpostors(3);
      });

      expect(result.current.game.config.setsOfQuestions).toBe(2);
      expect(result.current.game.config.randomImpostors).toBe(false);
    });

    it('setSetsOfQuestions — should update config.setsOfQuestions', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setSetsOfQuestions(3);
      });

      expect(result.current.game.config.setsOfQuestions).toBe(3);
    });

    it('setRandomImpostors — should update config.randomImpostors to true', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setRandomImpostors(true);
      });

      expect(result.current.game.config.randomImpostors).toBe(true);
    });

    it('setRandomImpostors — should toggle back to false', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setRandomImpostors(true);
      });
      act(() => {
        result.current.setRandomImpostors(false);
      });

      expect(result.current.game.config.randomImpostors).toBe(false);
    });
  });

  // ── 3. Word Management ──────────────────────────────────────────────────
  //
  // QA NOTE — Why separate tests for getRandomWord and setGameWord?
  // `getRandomWord` is a pure query (no side effects). `setGameWord` is a
  // command that writes to game state. Testing them separately pinpoints
  // exactly which one is broken when a word-related bug appears.
  describe('Word Management', () => {
    it('getRandomWord — should return a word that belongs to the given category', () => {
      const { result } = renderGameContext();

      const word = result.current.getRandomWord('testCategory');

      expect(['word1', 'word2', 'word3', 'word4', 'word5']).toContain(word);
    });

    it('getRandomWord — should return words from different categories independently', () => {
      const { result } = renderGameContext();

      const word1 = result.current.getRandomWord('testCategory');
      const word2 = result.current.getRandomWord('anotherCategory');

      expect(['word1', 'word2', 'word3', 'word4', 'word5']).toContain(word1);
      expect(['apple', 'banana', 'orange']).toContain(word2);
    });

    it('getRandomWord — should return empty string for unknown category', () => {
      const { result } = renderGameContext();

      const word = result.current.getRandomWord('nonExistentCategory');

      expect(word).toBe('');
    });

    it('setGameWord — should update category, word and wordIndex in game state', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setGameWord('testCategory');
      });

      // The getRandomWordIndex mock returns { index: 0, word: 'word1' }
      expect(result.current.game.category).toBe('testCategory');
      expect(result.current.game.word).toBe('word1');
      expect(result.current.game.wordIndex).toBe(0);
    });

    it('getCurrentWord — should return the word at the stored wordIndex for the stored category', () => {
      const { result } = renderGameContext();

      act(() => {
        result.current.setGameWord('testCategory');
      });

      // getCurrentWord reads game.category + game.wordIndex from allCategories
      // The mock categories.json has 'word1' at index 0 of testCategory.content
      expect(result.current.getCurrentWord()).toBe('word1');
    });

    it('getCurrentWord — should return empty string when no category is set', () => {
      const { result } = renderGameContext();

      expect(result.current.getCurrentWord()).toBe('');
    });
  });

  // ── 4. Round Navigation ─────────────────────────────────────────────────
  //
  // QA NOTE — nextRound / previousRound look trivial but they gate the entire
  // question flow. An off-by-one here means players see the wrong question.
  describe('Round Navigation', () => {
    it('nextRound — should increment currentRound by 1 each call', () => {
      const { result } = renderGameContext();

      act(() => result.current.nextRound());
      expect(result.current.game.currentRound).toBe(2);

      act(() => result.current.nextRound());
      expect(result.current.game.currentRound).toBe(3);
    });

    it('previousRound — should decrement currentRound by 1', () => {
      const { result } = renderGameContext();

      act(() => result.current.nextRound());
      act(() => result.current.nextRound());
      expect(result.current.game.currentRound).toBe(3);

      act(() => result.current.previousRound());
      expect(result.current.game.currentRound).toBe(2);
    });

    it('showWordToNextPlayer — should increment showingWordToPlayer each call', () => {
      const { result } = renderGameContext();

      expect(result.current.game.showingWordToPlayer).toBe(0);

      act(() => result.current.showWordToNextPlayer());
      expect(result.current.game.showingWordToPlayer).toBe(1);

      act(() => result.current.showWordToNextPlayer());
      expect(result.current.game.showingWordToPlayer).toBe(2);
    });
  });

  // ── 5. Player Management ────────────────────────────────────────────────
  describe('Player Management', () => {
    it('updatePlayers — should replace the players array', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.updatePlayers(testPlayers));

      expect(result.current.game.players).toEqual(testPlayers);
    });

    it('getSortedPlayers — should return players sorted by score descending', () => {
      const { result } = renderGameContext();
      const players = createTestPlayers();
      players[0].score = 5;
      players[1].score = 10;
      players[2].score = 1;

      act(() => result.current.updatePlayers(players));

      const sorted = result.current.getSortedPlayers();
      expect(sorted[0].score).toBe(10);
      expect(sorted[1].score).toBe(5);
      expect(sorted[2].score).toBe(1);
    });

    it('getSortedPlayers — should break ties by player id (ascending)', () => {
      const { result } = renderGameContext();
      const players = createTestPlayers();
      // All tied at score 5; ids are '1', '2', '3'
      players.forEach(p => (p.score = 5));

      act(() => result.current.updatePlayers(players));

      const sorted = result.current.getSortedPlayers();
      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
      expect(sorted[2].id).toBe('3');
    });
  });

  // ── 6. Game Creation ────────────────────────────────────────────────────
  //
  // QA NOTE — createGame is the most complex setup function. We test:
  //   (a) that the right number of rounds is created,
  //   (b) that impostors are chosen from the player list,
  //   (c) edge cases (empty list, single player).
  describe('createGame', () => {
    beforeEach(() => {
      // Mock Math.random so that shuffle / random selection is deterministic.
      // Without this, tests that assert *which* player is the impostor would
      // be flaky (passing ~33% of the time by luck).
      jest.spyOn(Math, 'random').mockReturnValue(0);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should set players and create rounds', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      expect(result.current.game.players).toEqual(testPlayers);
      expect(result.current.game.rounds.length).toBeGreaterThan(0);
    });

    it('should create (players × setsOfQuestions) rounds with default config', () => {
      // With 3 players and the default setsOfQuestions=2, we expect 6 rounds.
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      expect(result.current.game.rounds.length).toBe(
        testPlayers.length * result.current.game.config.setsOfQuestions
      );
    });

    it('should create (players × 3) rounds when setsOfQuestions is 3', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setSetsOfQuestions(3));
      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      expect(result.current.game.rounds.length).toBe(testPlayers.length * 3);
    });

    it('should choose lyingPlayers from the player list', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      const { lyingPlayers } = result.current.game;
      expect(lyingPlayers.length).toBeGreaterThanOrEqual(1);
      lyingPlayers.forEach(lp => {
        expect(testPlayers.some(p => p.id === lp.id)).toBe(true);
      });
    });

    it('should reset round counter and votes when a new game starts', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      // Advance state to simulate mid-game
      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));
      act(() => result.current.nextRound());
      act(() => result.current.addVote(testPlayers[0], [testPlayers[1]]));

      // Start fresh
      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      expect(result.current.game.currentRound).toBe(1);
      expect(result.current.game.votes).toEqual([]);
    });

    it('edge case — empty player list produces no rounds and no impostors', () => {
      const { result } = renderGameContext();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame([]));

      expect(result.current.game.players).toEqual([]);
      expect(result.current.game.rounds).toEqual([]);
    });

    it('edge case — single player creates setsOfQuestions rounds', () => {
      const { result } = renderGameContext();
      const singlePlayer = [createTestPlayers()[0]];

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(singlePlayer));

      expect(result.current.game.rounds.length).toBe(
        1 * result.current.game.config.setsOfQuestions
      );
    });
  });

  // ── 7. Impostor Identification ──────────────────────────────────────────
  //
  // QA NOTE — checkIfPlayerIsLiar and getLyingPlayers are used by every screen
  // that needs to show different UI for impostors vs civilians. A wrong answer
  // here means impostors see the civilian UI (or vice versa).
  describe('Impostor Identification', () => {
    beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0));
    afterEach(() => jest.restoreAllMocks());

    it('checkIfPlayerIsLiar — should return true for a lying player', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      const impostor = result.current.game.lyingPlayers[0];
      expect(result.current.checkIfPlayerIsLiar(impostor.id)).toBe(true);
    });

    it('checkIfPlayerIsLiar — should return false for a civilian', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      const impostorIds = new Set(
        result.current.game.lyingPlayers.map(lp => lp.id)
      );
      const civilian = testPlayers.find(p => !impostorIds.has(p.id))!;
      expect(result.current.checkIfPlayerIsLiar(civilian.id)).toBe(false);
    });

    it('getLyingPlayers — should return the same array as game.lyingPlayers', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      expect(result.current.getLyingPlayers()).toEqual(
        result.current.game.lyingPlayers
      );
    });
  });

  // ── 8. Voting ───────────────────────────────────────────────────────────
  //
  // QA NOTE — Votes now accept an *array* of voted players (multi-select).
  // The old API took a single player. Tests must reflect the new signature.
  describe('Voting', () => {
    it('addVote — should append a vote entry to the votes array', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      const voter = testPlayers[0];
      const voted = [testPlayers[1]];

      act(() => {
        result.current.updatePlayers(testPlayers);
        result.current.addVote(voter, voted);
      });

      expect(result.current.game.votes).toHaveLength(1);
      expect(result.current.game.votes[0]).toEqual({
        playerThatVoted: voter,
        playersVoted: voted,
      });
    });

    it('addVote — should support voting for multiple players at once', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.updatePlayers(testPlayers);
        result.current.addVote(testPlayers[0], [testPlayers[1], testPlayers[2]]);
      });

      expect(result.current.game.votes[0].playersVoted).toHaveLength(2);
    });

    it('addVote — should accumulate multiple votes from different players', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => {
        result.current.updatePlayers(testPlayers);
        result.current.addVote(testPlayers[0], [testPlayers[2]]);
        result.current.addVote(testPlayers[1], [testPlayers[2]]);
      });

      expect(result.current.game.votes).toHaveLength(2);
    });

    it('setImpostorVotes — should update impostorVotes in game state', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      const impostorVotes = [{ player: testPlayers[0], word: 'word1' }];

      act(() => result.current.setImpostorVotes(impostorVotes));

      expect(result.current.game.impostorVotes).toEqual(impostorVotes);
    });
  });

  // ── 9. Round Questions ──────────────────────────────────────────────────
  describe('Round Questions', () => {
    beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0));
    afterEach(() => jest.restoreAllMocks());

    it('getCurrentQuestion — should return the question for the active round', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      const question = result.current.getCurrentQuestion();
      expect(typeof question).toBe('string');
      expect(question.length).toBeGreaterThan(0);
    });

    it('getCurrentQuestion — should return empty string when no rounds exist', () => {
      const { result } = renderGameContext();

      expect(result.current.getCurrentQuestion()).toBe('');
    });

    it('getCurrentQuestion — should return the correct question after nextRound', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      const firstQuestion = result.current.getCurrentQuestion();

      act(() => result.current.nextRound());

      const secondQuestion = result.current.getCurrentQuestion();

      // The questions should come from the same pool but may differ
      expect(typeof secondQuestion).toBe('string');
      // They are not required to be equal; this just confirms we moved forward
      expect(result.current.game.currentRound).toBe(2);
      // Both should be non-empty
      expect(firstQuestion.length).toBeGreaterThan(0);
      expect(secondQuestion.length).toBeGreaterThan(0);
    });
  });

  // ── 10. Audio Recordings ────────────────────────────────────────────────
  //
  // QA NOTE — Audio URIs are attached to rounds so the Discussion screen can
  // replay them. We test save + retrieve together because they are two halves
  // of the same contract.
  describe('Audio Recordings', () => {
    beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0));
    afterEach(() => jest.restoreAllMocks());

    it('saveRecordingToRound — should attach an audio URI to the current round', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      const fakeUri = 'file:///cache/round_1.m4a';

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));
      act(() => result.current.saveRecordingToRound(fakeUri));

      // currentRound is 1, so index 0
      expect(result.current.game.rounds[0].audio).toBe(fakeUri);
    });

    it('getRoundAudio — should return the audio URI for the current round', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      const fakeUri = 'file:///cache/round_2.m4a';

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));
      act(() => result.current.nextRound()); // currentRound = 2
      act(() => result.current.saveRecordingToRound(fakeUri));

      expect(result.current.getRoundAudio()).toBe(fakeUri);
    });

    it('getRoundAudio — should return undefined when no recording saved yet', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));

      expect(result.current.getRoundAudio()).toBeUndefined();
    });

    it('saveRecordingToRound — should only update the current round, not others', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();

      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(testPlayers));
      act(() => result.current.saveRecordingToRound('file:///round1.m4a'));

      // Round 0 has audio; round 1 should not
      expect(result.current.game.rounds[0].audio).toBe('file:///round1.m4a');
      expect(result.current.game.rounds[1].audio).toBeUndefined();
    });
  });

  // ── 11. Screen Tracking ─────────────────────────────────────────────────
  //
  // QA NOTE — setCurrentScreen is used for persisting the last active screen
  // in AsyncStorage so the app can resume after a backgrounding. Small utility
  // but important for the "resume game" feature.
  describe('Screen Tracking', () => {
    it('setCurrentScreen — should update currentScreen in game state', () => {
      const { result } = renderGameContext();

      act(() => result.current.setCurrentScreen('Discussion'));

      expect(result.current.game.currentScreen).toBe('Discussion');
    });

    it('setCurrentScreen — should overwrite previous screen value', () => {
      const { result } = renderGameContext();

      act(() => result.current.setCurrentScreen('Discussion'));
      act(() => result.current.setCurrentScreen('Voting'));

      expect(result.current.game.currentScreen).toBe('Voting');
    });
  });

  // ── 12. Score Resolution ────────────────────────────────────────────────
  //
  // QA NOTE — resolveScoreOfTheMatch is the scoring engine. It is the most
  // complex function in the app and has many branches. Each test below
  // targets a specific scoring rule in isolation so that when the scoring
  // logic changes we know *exactly* which rule broke.
  //
  // Strategy: we call createGame to get a real game going, then inspect
  // which player became the impostor, construct votes accordingly, and call
  // resolveScoreOfTheMatch.
  describe('resolveScoreOfTheMatch', () => {
    // Math.random = 0 makes chooseRandomLyingPlayers always pick the first
    // player in the shuffled (also index-0) list, giving us a deterministic
    // impostor for our scoring tests.
    beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0));
    afterEach(() => jest.restoreAllMocks());

    /**
     * Helper: sets up a 3-player game and returns players + impostor + civilians.
     */
    const setupGame = (ctx: ReturnType<typeof renderGameContext>['result']) => {
      const players = createTestPlayers();
      act(() => ctx.current.setGameWord('testCategory'));
      act(() => ctx.current.createGame(players));

      const impostor = ctx.current.game.lyingPlayers[0];
      const civilians = ctx.current.game.players.filter(
        p => p.id !== impostor.id
      );
      return { players: ctx.current.game.players, impostor, civilians };
    };

    it('civilian who correctly identifies the impostor earns 2 points', () => {
      const { result } = renderGameContext();
      const { impostor, civilians } = setupGame(result);

      act(() => result.current.addVote(civilians[0], [impostor]));
      act(() => result.current.resolveScoreOfTheMatch());

      const voter = result.current.game.players.find(
        p => p.id === civilians[0].id
      )!;
      expect(voter.score).toBe(2);
    });

    it('civilian who votes for a non-impostor earns 0 points', () => {
      const { result } = renderGameContext();
      const { civilians } = setupGame(result);

      // Vote for the other civilian — wrong guess
      act(() => result.current.addVote(civilians[0], [civilians[1]]));
      act(() => result.current.resolveScoreOfTheMatch());

      const voter = result.current.game.players.find(
        p => p.id === civilians[0].id
      )!;
      expect(voter.score).toBe(0);
    });

    it('impostor who is never detected earns 3 points (1 impostor scenario)', () => {
      // QA NOTE — This covers the "never detected" bonus.
      // All civilians vote for the wrong person → globalImpostorsUncovered is
      // empty for the impostor → flat bonus applies.
      const { result } = renderGameContext();
      const { impostor, civilians } = setupGame(result);

      // Both civilians vote for each other (not the impostor)
      act(() => result.current.addVote(civilians[0], [civilians[1]]));
      act(() => result.current.addVote(civilians[1], [civilians[0]]));
      act(() => result.current.resolveScoreOfTheMatch());

      const impostorResult = result.current.game.players.find(
        p => p.id === impostor.id
      )!;
      expect(impostorResult.score).toBe(3);
    });

    it('impostor detected by at least one player earns 0 flat bonus', () => {
      const { result } = renderGameContext();
      const { impostor, civilians } = setupGame(result);

      // One civilian correctly votes for the impostor
      act(() => result.current.addVote(civilians[0], [impostor]));
      act(() => result.current.resolveScoreOfTheMatch());

      const impostorResult = result.current.game.players.find(
        p => p.id === impostor.id
      )!;
      // Detected → no flat bonus, no +1 from this voter
      expect(impostorResult.score).toBe(0);
    });

    it('impostor who guesses the secret word correctly earns +3 bonus', () => {
      // QA NOTE — impostorVotes is a separate channel from the regular votes.
      // The impostor submits their word guess; resolveScoreOfTheMatch checks
      // if it matches game.word.
      const { result } = renderGameContext();
      const { impostor } = setupGame(result);

      // game.word is 'word1' (set by the mocked getRandomWordIndex)
      act(() =>
        result.current.setImpostorVotes([
          { player: impostor, word: 'word1' },
        ])
      );
      act(() => result.current.resolveScoreOfTheMatch());

      const impostorResult = result.current.game.players.find(
        p => p.id === impostor.id
      )!;
      // Impostor wasn't detected (no votes cast) → 3 flat + 3 word guess = 6
      expect(impostorResult.score).toBe(6);
    });

    it('impostor who guesses the wrong word earns no bonus for word guess', () => {
      const { result } = renderGameContext();
      const { impostor } = setupGame(result);

      act(() =>
        result.current.setImpostorVotes([
          { player: impostor, word: 'wrong_word' },
        ])
      );
      act(() => result.current.resolveScoreOfTheMatch());

      const impostorResult = result.current.game.players.find(
        p => p.id === impostor.id
      )!;
      // Undetected (no votes) → 3 pts, but wrong word guess → 0 bonus
      expect(impostorResult.score).toBe(3);
    });

    it('cumulative — scores stack correctly across two matches', () => {
      // QA NOTE — After resolveScoreOfTheMatch, score is updated.
      // If we then call resetGameWithExistingPlayers and play again, the
      // second match score should be added on top of the first.
      const { result } = renderGameContext();
      const { impostor, civilians } = setupGame(result);

      // Match 1: one civilian correctly identifies impostor
      act(() => result.current.addVote(civilians[0], [impostor]));
      act(() => result.current.resolveScoreOfTheMatch());

      const scoreAfterMatch1 = result.current.game.players.find(
        p => p.id === civilians[0].id
      )!.score;
      expect(scoreAfterMatch1).toBe(2);

      // Start match 2, same setup
      act(() => result.current.resetGameWithExistingPlayers());
      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(result.current.game.players));

      const impostorMatch2 = result.current.game.lyingPlayers[0];
      const civilianMatch2 = result.current.game.players.find(
        p => p.id !== impostorMatch2.id && p.id === civilians[0].id
      );

      if (civilianMatch2) {
        act(() =>
          result.current.addVote(civilianMatch2, [impostorMatch2])
        );
        act(() => result.current.resolveScoreOfTheMatch());

        const finalScore = result.current.game.players.find(
          p => p.id === civilians[0].id
        )!.score;
        expect(finalScore).toBe(scoreAfterMatch1 + 2);
      }
    });
  });

  // ── 13. Game Reset Functions ────────────────────────────────────────────
  //
  // QA NOTE — There are two distinct reset behaviours:
  //   • createNewGame  — full reset including scores (used for "new tournament")
  //   • resetGameWithExistingPlayers — keeps scores, advances match counter
  //     (used for "next match in the same tournament")
  // Getting these confused is a common source of subtle bugs.
  describe('Game Reset Functions', () => {
    it('createNewGame — should reset all game state including player scores', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      testPlayers[0].score = 10;

      act(() => result.current.updatePlayers(testPlayers));
      act(() => result.current.createNewGame());

      expect(result.current.game.currentRound).toBe(1);
      expect(result.current.game.rounds).toEqual([]);
      expect(result.current.game.votes).toEqual([]);
      expect(result.current.game.showingWordToPlayer).toBe(0);
      expect(result.current.game.category).toBeUndefined();
      expect(result.current.game.word).toBeUndefined();
      expect(result.current.game.previousRankings).toBeUndefined();
      expect(result.current.game.currentMatch).toBe(1);
      expect(result.current.game.players.every(p => p.score === 0)).toBe(true);
    });

    it('resetGameWithExistingPlayers — should preserve player scores', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      testPlayers[0].score = 7;
      testPlayers[1].score = 3;

      act(() => result.current.updatePlayers(testPlayers));
      act(() => result.current.resetGameWithExistingPlayers());

      expect(result.current.game.players[0].score).toBe(7);
      expect(result.current.game.players[1].score).toBe(3);
    });

    it('resetGameWithExistingPlayers — should increment currentMatch', () => {
      const { result } = renderGameContext();

      act(() => result.current.updatePlayers(createTestPlayers()));
      act(() => result.current.resetGameWithExistingPlayers());

      expect(result.current.game.currentMatch).toBe(2);
    });

    it('resetGameWithExistingPlayers — should capture previousRankings with position and score', () => {
      const { result } = renderGameContext();
      const testPlayers = createTestPlayers();
      testPlayers[0].score = 10; // rank 1
      testPlayers[1].score = 5;  // rank 2
      testPlayers[2].score = 1;  // rank 3

      act(() => result.current.updatePlayers(testPlayers));
      act(() => result.current.resetGameWithExistingPlayers());

      const rankings = result.current.game.previousRankings!;
      expect(rankings).toHaveLength(3);
      // Players are sorted descending by score before position is assigned
      expect(rankings[0].previousScore).toBe(10);
      expect(rankings[0].position).toBe(1);
      expect(rankings[1].previousScore).toBe(5);
      expect(rankings[1].position).toBe(2);
    });

    it('resetGameWithExistingPlayers — should clear rounds, votes, and word', () => {
      const { result } = renderGameContext();

      jest.spyOn(Math, 'random').mockReturnValue(0);
      act(() => result.current.setGameWord('testCategory'));
      act(() => result.current.createGame(createTestPlayers()));
      act(() =>
        result.current.addVote(createTestPlayers()[0], [createTestPlayers()[1]])
      );
      jest.restoreAllMocks();

      act(() => result.current.resetGameWithExistingPlayers());

      expect(result.current.game.rounds).toEqual([]);
      expect(result.current.game.votes).toEqual([]);
      expect(result.current.game.word).toBeUndefined();
      expect(result.current.game.category).toBeUndefined();
    });
  });

  // ── 14. Context Provider Contract ──────────────────────────────────────
  //
  // QA NOTE — This is a "smoke test" for the provider's public API surface.
  // If a function is renamed or removed, this test catches it immediately
  // without having to run the whole app. Think of it as a type-check at
  // runtime level.
  describe('Context Provider Contract', () => {
    it('should expose all expected functions', () => {
      const { result } = renderGameContext();

      const expectedFunctions: (keyof typeof result.current)[] = [
        'createGame',
        'createNewGame',
        'getLyingPlayers',
        'setNumberOfImpostors',
        'setRandomImpostors',
        'checkIfPlayerIsLiar',
        'setSetsOfQuestions',
        'setGameWord',
        'getRandomWord',
        'setImpostorVotes',
        'nextRound',
        'previousRound',
        'showWordToNextPlayer',
        'addVote',
        'updatePlayers',
        'resetGameWithExistingPlayers',
        'getCurrentWord',
        'getCurrentQuestion',
        'saveRecordingToRound',
        'getRoundAudio',
        'setCurrentScreen',
        'getSortedPlayers',
        'resolveScoreOfTheMatch',
      ];

      expectedFunctions.forEach(fn => {
        expect(typeof result.current[fn]).toBe('function');
      });
    });

    it('should expose game state and isHydrated', () => {
      const { result } = renderGameContext();

      expect(result.current.game).toBeDefined();
      expect(typeof result.current.isHydrated).toBe('boolean');
    });
  });
});
