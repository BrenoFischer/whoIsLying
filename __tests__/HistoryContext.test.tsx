/**
 * HistoryContext Tests
 *
 * QA GUIDE — WHY THIS FILE EXISTS
 * ---------------------------------
 * HistoryContext is responsible for all player history and match recording
 * logic: auto-saving new players, enforcing the 30-player cap, tracking
 * per-player stats, and maintaining the rolling 20-match history.
 * If its logic breaks, the saved-players list, player stats screen, and
 * match history screen all break silently (no crash — just wrong data).
 *
 * Rule of thumb: test BEHAVIOUR, not implementation. We don't care HOW the
 * context stores data internally; we care that the public contract it
 * exposes to the rest of the app is correct.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryContext, HistoryContextProvider } from '@/context/HistoryContext';
import { SavedPlayer, SavedPlayerStats } from '@/types/SavedPlayer';
import { MatchRecord } from '@/types/MatchRecord';

// ─── Module mocks ──────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// ─── Test helpers ──────────────────────────────────────────────────────────

const INITIAL_STATS: SavedPlayerStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  timesImpostor: 0,
  timesDetectedAsImpostor: 0,
  timesUndetectedAsImpostor: 0,
  timesGuessedWord: 0,
  civilianVotesCorrect: 0,
  civilianVotesTotal: 0,
  lifetimeScore: 0,
};

/**
 * Always use factory functions for test data — never shared object literals.
 * Calling the factory in each test gives a fresh, independent copy every time,
 * preventing state from leaking between tests.
 */
const createSavedPlayer = (overrides: Partial<SavedPlayer> = {}): SavedPlayer => ({
  id: 'player-1',
  name: 'Alice',
  preferredCharacter: 'breno',
  preferredTheme: 'male',
  createdAt: '2026-01-01T00:00:00.000Z',
  stats: { ...INITIAL_STATS },
  ...overrides,
});

const createMatchRecord = (overrides: Partial<MatchRecord> = {}): MatchRecord => ({
  id: 'match-1',
  date: new Date().toISOString(),
  category: 'testCategory',
  players: [
    {
      savedPlayerId: 'player-1',
      name: 'Alice',
      role: 'civilian',
      scoreEarned: 5,
      isMatchWinner: true,
      civilianVotesCorrect: 1,
      civilianVotesTotal: 1,
      wasDetected: null,
      guessedWord: null,
    },
  ],
  ...overrides,
});

/**
 * Renders the hook wrapped in the real HistoryContextProvider.
 * AsyncStorage is mocked in-memory, so no actual I/O occurs.
 */
const renderHistoryContext = () =>
  renderHook(() => React.useContext(HistoryContext), {
    wrapper: ({ children }) => (
      <HistoryContextProvider>{children}</HistoryContextProvider>
    ),
  });

/**
 * Seeds AsyncStorage so the provider hydrates with pre-existing state.
 * Call this BEFORE renderHistoryContext().
 */
const seedStorage = (
  savedPlayers: SavedPlayer[] = [],
  matchHistory: MatchRecord[] = []
) => {
  mockAsyncStorage.getItem.mockImplementation((key: string) => {
    if (key === 'saved_players') return Promise.resolve(JSON.stringify(savedPlayers));
    if (key === 'match_history') return Promise.resolve(JSON.stringify(matchHistory));
    return Promise.resolve(null);
  });
};

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('HistoryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  // ── Hydration ─────────────────────────────────────────────────────────────

  describe('Hydration', () => {
    it('starts with isHydrated = false and sets it to true after loading', async () => {
      const { result } = renderHistoryContext();

      expect(result.current.isHydrated).toBe(false);

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });
    });

    it('loads savedPlayers and matchHistory from AsyncStorage on mount', async () => {
      const players = [createSavedPlayer()];
      const history = [createMatchRecord()];
      seedStorage(players, history);

      const { result } = renderHistoryContext();

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(result.current.savedPlayers).toHaveLength(1);
      expect(result.current.savedPlayers[0].name).toBe('Alice');
      expect(result.current.matchHistory).toHaveLength(1);
      expect(result.current.matchHistory[0].category).toBe('testCategory');
    });

    it('starts with empty arrays when AsyncStorage has no data', async () => {
      const { result } = renderHistoryContext();

      await waitFor(() => {
        expect(result.current.isHydrated).toBe(true);
      });

      expect(result.current.savedPlayers).toEqual([]);
      expect(result.current.matchHistory).toEqual([]);
    });
  });

  // ── Persistence ───────────────────────────────────────────────────────────

  describe('Persistence', () => {
    it('persists savedPlayers to AsyncStorage when they change', async () => {
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.commitAutoSave(
          [{ id: 'p1', name: 'Bob', preferredCharacter: 'breno', preferredTheme: 'male' }],
          []
        );
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'saved_players',
          expect.stringContaining('Bob')
        );
      });
    });

    it('persists matchHistory to AsyncStorage when a match is recorded', async () => {
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.recordMatch(createMatchRecord({ id: 'match-xyz' }));
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'match_history',
          expect.stringContaining('match-xyz')
        );
      });
    });

    it('does not write to AsyncStorage before hydration completes', () => {
      renderHistoryContext();

      // setItem should not be called synchronously during the render
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  // ── getSavedPlayerByName ──────────────────────────────────────────────────

  describe('getSavedPlayerByName', () => {
    it('returns the player when the name matches', async () => {
      seedStorage([createSavedPlayer({ name: 'Alice' })]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      const found = result.current.getSavedPlayerByName('Alice');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Alice');
    });

    it('returns undefined when no player has the given name', async () => {
      seedStorage([createSavedPlayer({ name: 'Alice' })]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      expect(result.current.getSavedPlayerByName('Bob')).toBeUndefined();
    });
  });

  // ── deleteSavedPlayer ─────────────────────────────────────────────────────

  describe('deleteSavedPlayer', () => {
    it('removes the player with the given id and leaves others intact', async () => {
      seedStorage([
        createSavedPlayer({ id: 'p1', name: 'Alice' }),
        createSavedPlayer({ id: 'p2', name: 'Bob' }),
      ]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.deleteSavedPlayer('p1');
      });

      expect(result.current.savedPlayers).toHaveLength(1);
      expect(result.current.savedPlayers[0].id).toBe('p2');
    });

    it('does nothing when the id does not exist', async () => {
      seedStorage([createSavedPlayer({ id: 'p1' })]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.deleteSavedPlayer('nonexistent');
      });

      expect(result.current.savedPlayers).toHaveLength(1);
    });
  });

  // ── getAutoDeleteCandidates ───────────────────────────────────────────────

  describe('getAutoDeleteCandidates', () => {
    it('returns an empty array when there is enough room', async () => {
      // 2 existing players, 30 capacity → room for 28 more
      seedStorage([
        createSavedPlayer({ id: 'p1' }),
        createSavedPlayer({ id: 'p2', name: 'Bob' }),
      ]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      expect(result.current.getAutoDeleteCandidates(5)).toEqual([]);
    });

    it('returns exactly the number of candidates needed to make room', async () => {
      // Fill to 29 out of 30
      const players = Array.from({ length: 29 }, (_, i) =>
        createSavedPlayer({ id: `p${i}`, name: `Player${i}` })
      );
      seedStorage(players);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      // Adding 3 new players needs 2 deletions (29 + 3 = 32 → need 2 freed slots)
      const candidates = result.current.getAutoDeleteCandidates(3);
      expect(candidates).toHaveLength(2);
    });

    it('selects players with the fewest matchesPlayed first', async () => {
      // Fill to 30 players with varying matchesPlayed
      const players = Array.from({ length: 30 }, (_, i) =>
        createSavedPlayer({
          id: `p${i}`,
          name: `Player${i}`,
          stats: { ...INITIAL_STATS, matchesPlayed: 30 - i }, // p29 has fewest (1)
        })
      );
      seedStorage(players);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      const candidates = result.current.getAutoDeleteCandidates(1);
      expect(candidates).toHaveLength(1);
      // p29 has matchesPlayed = 1, which is the lowest
      expect(candidates[0].id).toBe('p29');
    });

    it('uses createdAt as a tie-breaker — oldest first', async () => {
      // Fill to 30; last two have the same (lowest) matchesPlayed = 1
      const players = Array.from({ length: 28 }, (_, i) =>
        createSavedPlayer({ id: `p${i}`, name: `Player${i}`, stats: { ...INITIAL_STATS, matchesPlayed: 5 } })
      );
      players.push(
        createSavedPlayer({ id: 'new-a', name: 'NewA', createdAt: '2025-01-01T00:00:00.000Z', stats: { ...INITIAL_STATS, matchesPlayed: 1 } }),
        createSavedPlayer({ id: 'new-b', name: 'NewB', createdAt: '2025-06-01T00:00:00.000Z', stats: { ...INITIAL_STATS, matchesPlayed: 1 } })
      );
      seedStorage(players);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      // Adding 1 new player needs 1 deletion — the older of the two tied players
      const candidates = result.current.getAutoDeleteCandidates(1);
      expect(candidates).toHaveLength(1);
      expect(candidates[0].id).toBe('new-a');
    });
  });

  // ── commitAutoSave ────────────────────────────────────────────────────────

  describe('commitAutoSave', () => {
    it('creates new SavedPlayer entries with INITIAL_STATS and the provided id', async () => {
      const { result } = renderHistoryContext();
      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.commitAutoSave(
          [{ id: 'new-p1', name: 'Carol', preferredCharacter: 'sara', preferredTheme: 'female' }],
          []
        );
      });

      expect(result.current.savedPlayers).toHaveLength(1);
      const created = result.current.savedPlayers[0];
      expect(created.id).toBe('new-p1');
      expect(created.name).toBe('Carol');
      expect(created.stats).toEqual(INITIAL_STATS);
    });

    it('deletes playersToDelete before adding new ones', async () => {
      const toDelete = createSavedPlayer({ id: 'old-p1', name: 'OldPlayer' });
      seedStorage([toDelete]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.commitAutoSave(
          [{ id: 'new-p1', name: 'NewPlayer', preferredCharacter: 'breno', preferredTheme: 'male' }],
          [toDelete]
        );
      });

      expect(result.current.savedPlayers).toHaveLength(1);
      expect(result.current.savedPlayers[0].name).toBe('NewPlayer');
    });

    it('keeps players that are not in playersToDelete', async () => {
      const keepMe = createSavedPlayer({ id: 'keep', name: 'KeepMe' });
      const deleteMe = createSavedPlayer({ id: 'delete', name: 'DeleteMe' });
      seedStorage([keepMe, deleteMe]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.commitAutoSave([], [deleteMe]);
      });

      expect(result.current.savedPlayers).toHaveLength(1);
      expect(result.current.savedPlayers[0].id).toBe('keep');
    });

    it('does nothing if both arrays are empty', async () => {
      seedStorage([createSavedPlayer()]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.commitAutoSave([], []);
      });

      expect(result.current.savedPlayers).toHaveLength(1);
    });
  });

  // ── updateSavedPlayerStats ────────────────────────────────────────────────

  describe('updateSavedPlayerStats', () => {
    it('merges stat updates onto the targeted player', async () => {
      seedStorage([createSavedPlayer({ id: 'p1' })]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.updateSavedPlayerStats('p1', { matchesPlayed: 3, lifetimeScore: 10 });
      });

      const updated = result.current.savedPlayers.find(p => p.id === 'p1');
      expect(updated?.stats.matchesPlayed).toBe(3);
      expect(updated?.stats.lifetimeScore).toBe(10);
      // Unrelated stats remain at their initial values
      expect(updated?.stats.matchesWon).toBe(0);
    });

    it('does not affect other players in the list', async () => {
      seedStorage([
        createSavedPlayer({ id: 'p1', name: 'Alice' }),
        createSavedPlayer({ id: 'p2', name: 'Bob' }),
      ]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.updateSavedPlayerStats('p1', { matchesPlayed: 5 });
      });

      const bob = result.current.savedPlayers.find(p => p.id === 'p2');
      expect(bob?.stats.matchesPlayed).toBe(0);
    });

    it('does nothing when the playerId does not exist', async () => {
      seedStorage([createSavedPlayer({ id: 'p1' })]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.updateSavedPlayerStats('nonexistent', { matchesPlayed: 99 });
      });

      expect(result.current.savedPlayers[0].stats.matchesPlayed).toBe(0);
    });
  });

  // ── recordMatch ───────────────────────────────────────────────────────────

  describe('recordMatch', () => {
    it('prepends the new match to the front of matchHistory', async () => {
      seedStorage([], [createMatchRecord({ id: 'old-match' })]);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.recordMatch(createMatchRecord({ id: 'new-match' }));
      });

      expect(result.current.matchHistory[0].id).toBe('new-match');
      expect(result.current.matchHistory[1].id).toBe('old-match');
    });

    it('caps matchHistory at 20 entries, dropping the oldest', async () => {
      // Start with 20 existing matches
      const existing = Array.from({ length: 20 }, (_, i) =>
        createMatchRecord({ id: `match-${i}` })
      );
      seedStorage([], existing);
      const { result } = renderHistoryContext();

      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.recordMatch(createMatchRecord({ id: 'match-new' }));
      });

      expect(result.current.matchHistory).toHaveLength(20);
      expect(result.current.matchHistory[0].id).toBe('match-new');
      // The oldest entry (match-19, last in the original array) is dropped
      expect(result.current.matchHistory.find(m => m.id === 'match-19')).toBeUndefined();
    });

    it('can record multiple matches sequentially', async () => {
      const { result } = renderHistoryContext();
      await waitFor(() => expect(result.current.isHydrated).toBe(true));

      act(() => {
        result.current.recordMatch(createMatchRecord({ id: 'first' }));
      });
      act(() => {
        result.current.recordMatch(createMatchRecord({ id: 'second' }));
      });

      expect(result.current.matchHistory).toHaveLength(2);
      expect(result.current.matchHistory[0].id).toBe('second');
      expect(result.current.matchHistory[1].id).toBe('first');
    });
  });
});
