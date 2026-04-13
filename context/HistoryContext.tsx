import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedPlayer, SavedPlayerStats } from '@/types/SavedPlayer';
import { MatchRecord } from '@/types/MatchRecord';

const SAVED_PLAYERS_KEY = 'saved_players';
const MATCH_HISTORY_KEY = 'match_history';

const MAX_SAVED_PLAYERS = 30;
const MAX_MATCH_HISTORY = 30;

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

interface HistoryContextType {
  savedPlayers: SavedPlayer[];
  matchHistory: MatchRecord[];
  isHydrated: boolean;
  getSavedPlayerByName: (name: string) => SavedPlayer | undefined;
  deleteSavedPlayer: (id: string) => void;
  // Returns the saved players that would be auto-deleted to make room for
  // newPlayerCount new profiles, ordered by fewest matches (oldest first on tie).
  // Returns an empty array if there is enough room.
  getAutoDeleteCandidates: (newPlayerCount: number) => SavedPlayer[];
  // Deletes playersToDelete, then creates new saved profiles for newPlayers.
  // Each entry must include the pre-generated id that matches the Player.id in the game.
  commitAutoSave: (
    newPlayers: (Pick<SavedPlayer, 'name' | 'preferredCharacter' | 'preferredTheme'> & { id: string })[],
    playersToDelete: SavedPlayer[]
  ) => void;
  updateSavedPlayerStats: (
    playerId: string,
    statUpdates: Partial<SavedPlayerStats>
  ) => void;
  recordMatch: (record: MatchRecord) => void;
}

export const HistoryContext = createContext({} as HistoryContextType);

export const HistoryContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayer[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // ─── Hydration ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [storedPlayers, storedHistory] = await Promise.all([
          AsyncStorage.getItem(SAVED_PLAYERS_KEY),
          AsyncStorage.getItem(MATCH_HISTORY_KEY),
        ]);
        if (storedPlayers) setSavedPlayers(JSON.parse(storedPlayers));
        if (storedHistory) setMatchHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.warn('Failed to hydrate history state:', e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  // ─── Persistence ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(SAVED_PLAYERS_KEY, JSON.stringify(savedPlayers)).catch(
      e => console.warn('Failed to persist saved players:', e)
    );
  }, [savedPlayers, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(matchHistory)).catch(
      e => console.warn('Failed to persist match history:', e)
    );
  }, [matchHistory, isHydrated]);

  // ─── Saved players ────────────────────────────────────────────────────────
  const getSavedPlayerByName = (name: string) =>
    savedPlayers.find(p => p.name === name);

  const deleteSavedPlayer = (id: string) => {
    setSavedPlayers(prev => prev.filter(p => p.id !== id));
  };

  const getAutoDeleteCandidates = (newPlayerCount: number): SavedPlayer[] => {
    const available = MAX_SAVED_PLAYERS - savedPlayers.length;
    const needed = newPlayerCount - available;
    if (needed <= 0) return [];

    const sorted = [...savedPlayers].sort((a, b) => {
      if (a.stats.matchesPlayed !== b.stats.matchesPlayed)
        return a.stats.matchesPlayed - b.stats.matchesPlayed;
      // Tie-break: oldest createdAt first
      return a.createdAt.localeCompare(b.createdAt);
    });

    return sorted.slice(0, needed);
  };

  const commitAutoSave = (
    newPlayers: (Pick<SavedPlayer, 'name' | 'preferredCharacter' | 'preferredTheme'> & { id: string })[],
    playersToDelete: SavedPlayer[]
  ) => {
    setSavedPlayers(prev => {
      const deleteIds = new Set(playersToDelete.map(p => p.id));
      const kept = prev.filter(p => !deleteIds.has(p.id));
      const created: SavedPlayer[] = newPlayers.map(p => ({
        id: p.id,
        name: p.name,
        preferredCharacter: p.preferredCharacter,
        preferredTheme: p.preferredTheme,
        createdAt: new Date().toISOString(),
        stats: { ...INITIAL_STATS },
      }));
      return [...kept, ...created];
    });
  };

  const updateSavedPlayerStats = (
    playerId: string,
    statUpdates: Partial<SavedPlayerStats>
  ) => {
    setSavedPlayers(prev =>
      prev.map(p =>
        p.id !== playerId
          ? p
          : { ...p, stats: { ...p.stats, ...statUpdates } }
      )
    );
  };

  // ─── Match history ────────────────────────────────────────────────────────
  const recordMatch = (record: MatchRecord) => {
    setMatchHistory(prev => {
      const updated = [record, ...prev];
      return updated.length > MAX_MATCH_HISTORY
        ? updated.slice(0, MAX_MATCH_HISTORY)
        : updated;
    });
  };

  return (
    <HistoryContext.Provider
      value={{
        savedPlayers,
        matchHistory,
        isHydrated,
        getSavedPlayerByName,
        deleteSavedPlayer,
        getAutoDeleteCandidates,
        commitAutoSave,
        updateSavedPlayerStats,
        recordMatch,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};
