# Who Is Lying — Automated Test Documentation

## Overview

The automated test suite covers the entire business logic layer of the application through `GameContext` — the single source of truth for all game state. Every function exposed by the context has dedicated tests that validate its behaviour in isolation.

**Test file:** `__tests__/GameContext.test.tsx`
**Framework:** Jest 29 + React Native Testing Library
**Execution:** `npm test`

---

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       56 passed, 56 total
Snapshots:   0 total
Pass rate:   100%
```

---

## Why We Test the Context Layer

The `GameContext` is the most critical file in the application. It drives:

- Which player is the impostor and how many there are
- How many rounds exist and what questions are assigned
- How votes are recorded and who they target
- How all scoring branches resolve
- Whether previous match rankings are captured for the end-game animation
- Whether the app can resume from the correct screen after being backgrounded

A bug here affects every screen simultaneously. Testing this layer in isolation means we catch logic errors in milliseconds, without launching a device or navigating the UI.

---

## Mock Strategy

Three external dependencies are mocked so tests run entirely in-memory, without device APIs, file system access, or random variance:

| Module | Why mocked |
|---|---|
| `@react-native-async-storage/async-storage` | The context reads/writes on every state change. Mocked to resolve instantly with `null` (no saved game). |
| `expo-file-system` | The context cleans up orphaned audio files on launch. Mocked to return an empty directory. |
| `@/utils/gameTranslations` | `setGameWord` calls `getRandomWordIndex` to pick a word. Mocked to always return `{ index: 0, word: 'word1' }` so word-dependent tests are deterministic. |
| `@/data/categories.json` | Static data; mocked to a minimal two-category fixture with all required question pools. |
| `react-native-uuid` (global) | Mocked in `jest-setup.js` to return a fixed UUID string. |

`Math.random` is mocked with `jest.spyOn` inside individual `beforeEach` blocks only for tests where shuffling must be deterministic (impostor selection, round assignment). It is restored after each test.

---

## Test Suite Breakdown

### Suite 1 — Initial State (2 tests)

Validates the exact shape of a fresh `GameContext` before any action is taken. This is effectively a contract test: if a new field is added to `INITIAL_GAME` without a corresponding update here, the test fails and the oversight is caught immediately.

```
✓ should initialise with the correct default game state
✓ should set isHydrated to true after AsyncStorage resolves
```

**Why `isHydrated` matters:** Screens guard their resume logic behind `isHydrated`. If this flag never becomes `true`, the app will never auto-navigate to a saved session. Testing it explicitly confirms that the async hydration `useEffect` resolves correctly under test conditions.

---

### Suite 2 — Game Configuration (5 tests)

Tests the three config setters (`setNumberOfImpostors`, `setSetsOfQuestions`, `setRandomImpostors`) and verifies that changing one setting does not corrupt another.

```
✓ setNumberOfImpostors — should update config.numberOfImpostors
✓ setNumberOfImpostors — should not affect other config fields
✓ setSetsOfQuestions — should update config.setsOfQuestions
✓ setRandomImpostors — should update config.randomImpostors to true
✓ setRandomImpostors — should toggle back to false
```

---

### Suite 3 — Word Management (6 tests)

Covers the two word-related functions and their derived query.

```
✓ getRandomWord — should return a word that belongs to the given category
✓ getRandomWord — should return words from different categories independently
✓ getRandomWord — should return empty string for unknown category
✓ setGameWord — should update category, word and wordIndex in game state
✓ getCurrentWord — should return the word at the stored wordIndex for the stored category
✓ getCurrentWord — should return empty string when no category is set
```

`getRandomWord` is a pure query (no side effects). `setGameWord` is a command that writes `category`, `word`, and `wordIndex` to state. Testing them separately makes it clear which is broken when a word-related bug appears.

---

### Suite 4 — Round Navigation (3 tests)

```
✓ nextRound — should increment currentRound by 1 each call
✓ previousRound — should decrement currentRound by 1
✓ showWordToNextPlayer — should increment showingWordToPlayer each call
```

These look trivial but `currentRound` gates `getCurrentQuestion`, `getRoundAudio`, and `saveRecordingToRound`. An off-by-one error here means players see the wrong question or the wrong audio.

---

### Suite 5 — Player Management (3 tests)

```
✓ updatePlayers — should replace the players array
✓ getSortedPlayers — should return players sorted by score descending
✓ getSortedPlayers — should break ties by player id (ascending)
```

`getSortedPlayers` feeds the end-game ranking screen. The tie-break test is important because a non-deterministic tie-break would cause ranking cards to jump order between renders.

---

### Suite 6 — createGame (7 tests)

```
✓ should set players and create rounds
✓ should create (players × setsOfQuestions) rounds with default config
✓ should create (players × 3) rounds when setsOfQuestions is 3
✓ should choose lyingPlayers from the player list
✓ should reset round counter and votes when a new game starts
✓ edge case — empty player list produces no rounds and no impostors
✓ edge case — single player creates setsOfQuestions rounds
```

`createGame` is the most complex setup function. It builds the entire `rounds` array with exposure-distributed questions and selects impostors. The formula `rounds.length = players × setsOfQuestions` is tested explicitly for both the default (2 sets) and configured (3 sets) cases.

---

### Suite 7 — Impostor Identification (3 tests)

```
✓ checkIfPlayerIsLiar — should return true for a lying player
✓ checkIfPlayerIsLiar — should return false for a civilian
✓ getLyingPlayers — should return the same array as game.lyingPlayers
```

`checkIfPlayerIsLiar` is called by every screen that needs to branch UI between impostors and civilians (word reveal, end-game card badge, etc.). A wrong return value here would show civilians the impostor screen or vice versa — a game-breaking bug.

---

### Suite 8 — Voting (4 tests)

```
✓ addVote — should append a vote entry to the votes array
✓ addVote — should support voting for multiple players at once
✓ addVote — should accumulate multiple votes from different players
✓ setImpostorVotes — should update impostorVotes in game state
```

The voting API changed significantly: `playersVoted` is now an array to support multi-impostor voting. These tests confirm the new signature is handled correctly by `addVote` and that `setImpostorVotes` stores the impostor word guesses independently.

---

### Suite 9 — Round Questions (3 tests)

```
✓ getCurrentQuestion — should return the question for the active round
✓ getCurrentQuestion — should return empty string when no rounds exist
✓ getCurrentQuestion — should return the correct question after nextRound
```

---

### Suite 10 — Audio Recordings (4 tests)

```
✓ saveRecordingToRound — should attach an audio URI to the current round
✓ getRoundAudio — should return the audio URI for the current round
✓ getRoundAudio — should return undefined when no recording saved yet
✓ saveRecordingToRound — should only update the current round, not others
```

These test the save-and-retrieve contract as a pair. The "only update current round" test is particularly important: a bug that overwrites all rounds instead of just the active one would silently corrupt the discussion screen.

---

### Suite 11 — Screen Tracking (2 tests)

```
✓ setCurrentScreen — should update currentScreen in game state
✓ setCurrentScreen — should overwrite previous screen value
```

`currentScreen` is what enables the session-resume feature. If `setCurrentScreen` does not overwrite on each navigation, the app would always resume at the first screen it visited, not the last.

---

### Suite 12 — resolveScoreOfTheMatch (7 tests)

This is the most complex suite. It tests every branch of the scoring engine in isolation.

```
✓ civilian who correctly identifies the impostor earns 2 points
✓ civilian who votes for a non-impostor earns 0 points
✓ impostor who is never detected earns 3 points (1 impostor scenario)
✓ impostor detected by at least one player earns 0 flat bonus
✓ impostor who guesses the secret word correctly earns +3 bonus
✓ impostor who guesses the wrong word earns no bonus for word guess
✓ cumulative — scores stack correctly across two matches
```

Each test calls `createGame` first (getting a real impostor), then constructs votes accordingly, then calls `resolveScoreOfTheMatch`, then asserts on the resulting `player.score`. This approach tests the full scoring path including the state update without mocking any internal function.

The cumulative test verifies that `matchScore.totalScore` is correctly merged into `score` at the end of each match, which is required for the score count-up animation to show the correct delta.

---

### Suite 13 — Game Reset Functions (5 tests)

```
✓ createNewGame — should reset all game state including player scores
✓ resetGameWithExistingPlayers — should preserve player scores
✓ resetGameWithExistingPlayers — should increment currentMatch
✓ resetGameWithExistingPlayers — should capture previousRankings with position and score
✓ resetGameWithExistingPlayers — should clear rounds, votes, and word
```

There are two reset functions with very different semantics:

- `createNewGame`: full tournament reset — scores go to 0, `currentMatch` resets to 1.
- `resetGameWithExistingPlayers`: next match in the same tournament — scores are preserved, `currentMatch` increments, `previousRankings` is captured.

The `previousRankings` test is critical for the end-game animation: it confirms that each player's pre-match position and score are saved correctly, which is what drives the "rank change" arrows on the next match's end-game screen.

---

### Suite 14 — Context Provider Contract (2 tests)

```
✓ should expose all expected functions
✓ should expose game state and isHydrated
```

This is an API-surface smoke test. It enumerates every function the context is expected to export and asserts each one is a function. If a function is renamed or accidentally removed, this test fails immediately — without needing to run any user journey.

---

## Running the Tests

```bash
# Run the full suite once
npm test

# Run in watch mode (re-runs on file save)
npm run test:watch

# Generate a coverage report
npm run test:coverage

# CI mode (no watch, with coverage, pass with no tests)
npm run test:ci
```

Coverage thresholds are enforced in `jest` config at 70% globally across branches, functions, lines, and statements.

---

## Test Infrastructure

### jest-setup.js

Global setup file registered via `setupFilesAfterFramework`:

- Extends `expect` with `@testing-library/jest-native` matchers.
- Mocks `react-native-uuid` globally (`v4` returns a fixed string).
- Sets a 10-second global timeout.

### jest configuration (package.json)

- **Preset**: `jest-expo` (handles React Native transforms and module resolution)
- **Test match**: `**/__tests__/**/*.(ts|tsx)` and `**/*.test.(ts|tsx)`
- **Transform ignore patterns**: allows `react-native`, `expo`, and related packages to be transformed
- **Module name mapping**: `@/` resolves to `<rootDir>/` (matching `tsconfig.json` path alias)
