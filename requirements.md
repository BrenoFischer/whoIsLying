# Who Is Lying — Requirements & Specifications

## Project Overview

**Who Is Lying** is a React Native local multiplayer social deduction game. Between 3 and 10 players share a single device. All players see the secret word before the game begins — except the impostor(s), who must bluff their way through structured Q&A rounds, avoid detection during voting, and guess the word to win.

The app targets Android (Google Play Store, released) and iOS (Apple App Store, in preparation). It runs fully offline with no server dependency.

---

## Functional Requirements

### FR-001: Player Management

| ID | Requirement |
|---|---|
| FR-001.1 | The system shall support between 3 and 10 players per game session. |
| FR-001.2 | Players shall enter a name (1–15 characters) before the game starts. |
| FR-001.3 | Players shall select a unique character illustration from a themed picker. |
| FR-001.4 | Players shall be deletable from the list before the game starts. |
| FR-001.5 | The add-player interface shall be disabled once 10 players are registered. |
| FR-001.6 | Player names and characters shall persist across matches within the same session. |

### FR-002: Game Configuration

| ID | Requirement |
|---|---|
| FR-002.1 | The system shall support 1, 2, or 3 impostors per game. |
| FR-002.2 | The system shall support 1, 2, or 3 sets of questions per game (default: 2). |
| FR-002.3 | The system shall offer a "Random & Hidden" impostor mode, in which the number of impostors is randomised and not shown to any player. |
| FR-002.4 | When the configured impostor count exceeds the player-count constraint (`players − 2`), the system shall present a conflict-resolution interface offering an adjusted count or random mode, without blocking game creation. |
| FR-002.5 | Configuration shall be accessible at any point before the game starts. |
| FR-002.6 | The system shall offer an optional "Timed rounds" mode, in which each round must be answered within a configurable duration (3–25 seconds, default 10, adjustable in steps of 5). |
| FR-002.7 | When timed rounds are enabled, the round screen shall show a 3-2-1 prepare countdown followed by a visual countdown ring; forward navigation shall be disabled while the countdown is running. |
| FR-002.8 | When a timed round expires, any in-progress audio recording shall stop automatically and the screen shall indicate "Time's up!" without blocking the player from continuing. |

### FR-003: Word and Category Management

| ID | Requirement |
|---|---|
| FR-003.1 | The system shall provide selectable word categories (e.g., Food, Animals, Halloween). |
| FR-003.2 | Categories shall display a flip-card preview with a name, illustration, and description. |
| FR-003.3 | Unavailable categories shall display a lock icon and be unselectable. |
| FR-003.4 | A random word shall be drawn from the selected category at game creation. |
| FR-003.5 | Civilians shall see the word; impostors shall not. |

### FR-004: Word Reveal Phase

| ID | Requirement |
|---|---|
| FR-004.1 | The system shall present the device pass-down flow, showing the word (or impostor role) to each player individually and privately. |
| FR-004.2 | The word shall be hidden behind a tap-to-reveal interaction. |
| FR-004.3 | Players shall not be able to navigate back from the reveal screen. |

### FR-005: Question Rounds

| ID | Requirement |
|---|---|
| FR-005.1 | The system shall assign one question per player per set. Total rounds = `players × sets`. |
| FR-005.2 | Questions shall be drawn from three exposure pools (low, medium, high) whose proportions escalate across sets according to the configured distribution schedule. |
| FR-005.3 | No question index shall repeat within a set unless all questions in that exposure pool have been exhausted. |
| FR-005.4 | Each round shall display the asking player, the answering player, and the question. |
| FR-005.5 | Each round shall offer an optional audio recording mechanism. |
| FR-005.6 | Audio recordings shall be stored per-round and be available for playback in the discussion phase. |
| FR-005.7 | A "Forgot Word" recovery flow shall be accessible during the round phase for civilians to re-read the secret word privately. |

### FR-006: Discussion Phase

| ID | Requirement |
|---|---|
| FR-006.1 | The system shall display a summary of all questions and their answering player, grouped by player. |
| FR-006.2 | Rounds with an audio recording shall display a playback control (play/pause) and a time display. |
| FR-006.3 | Audio shall play through the speaker (not earpiece) and respect silent-mode settings. |

### FR-007: Voting Phase

| ID | Requirement |
|---|---|
| FR-007.1 | Each player shall vote in turn using the device pass-down flow. |
| FR-007.2 | Each player's identity shall be confirmed via a modal before voting begins. |
| FR-007.3 | The number of votes each player may cast shall equal the number of impostors in the game. |
| FR-007.4 | If more votes are cast than slots allow, the oldest selection shall be replaced. |
| FR-007.5 | The voter shall not be allowed to vote for themselves. |
| FR-007.6 | The Continue button shall remain disabled until the correct number of suspects is selected. |

### FR-008: Vote Results and Impostor Reveal

| ID | Requirement |
|---|---|
| FR-008.1 | The system shall display a tally of votes received per player, sorted by vote count. |
| FR-008.2 | A tie case shall be explicitly communicated to players. |
| FR-008.3 | The impostor(s) shall be revealed with their character and name on a dedicated screen. |
| FR-008.4 | The impostor(s) shall be given the opportunity to guess the secret word. |

### FR-009: Scoring

| ID | Requirement |
|---|---|
| FR-009.1 | Scores shall be resolved at the end of voting in a single pass over all votes. |
| FR-009.2 | A civilian who votes for 1 impostor shall receive +2 points. |
| FR-009.3 | A civilian who votes for 2 impostors in the same vote shall receive +3 points. |
| FR-009.4 | A civilian who votes for all 3 impostors in the same vote shall receive +5 points. |
| FR-009.5 | An impostor shall receive +1 point for each player who fails to identify them. |
| FR-009.6 | An impostor who is never identified by any player shall receive a flat bonus instead of per-voter +1: +3 pts (1 impostor game), +5 pts (2 impostor game), +10 pts (3 impostor game). |
| FR-009.7 | An impostor who correctly guesses the secret word shall receive +3 points. |
| FR-009.8 | Per-match score events shall be stored separately in `matchScore` for display in the end-game animation, then merged into the cumulative `score`. |

### FR-010: End-Game Rankings

| ID | Requirement |
|---|---|
| FR-010.1 | The system shall display a ranked end-game screen after each match. |
| FR-010.2 | Player cards shall animate in (slide from right) in reverse rank order. |
| FR-010.3 | Each card shall show the player's previous score, animate a count-up of the match score, then merge to the new total. |
| FR-010.4 | The system shall display each player's rank change relative to the previous match (up/down arrows and position delta). |
| FR-010.5 | Impostors shall be visually distinguished on the ranking card. |
| FR-010.6 | Players shall be able to start a new match (same players, scores preserved) or start a new game (scores reset). |

### FR-011: Session Persistence and Resume

| ID | Requirement |
|---|---|
| FR-011.1 | The complete game state shall be persisted to AsyncStorage after every state change. |
| FR-011.2 | On app launch, if a saved game with players exists, the app shall navigate directly to the last active screen. |
| FR-011.3 | Orphaned audio files from crashed sessions shall be cleaned up on app launch if no saved game exists. |

### FR-012: Internationalisation

| ID | Requirement |
|---|---|
| FR-012.1 | All UI text shall be available in English and Brazilian Portuguese. |
| FR-012.2 | Category word lists and question pools shall have separate translation files. |
| FR-012.3 | Language selection shall be available from the home screen and persist for the session. |

### FR-013: Game Modes

| ID | Requirement |
|---|---|
| FR-013.1 | The system shall offer a dedicated Select Game Mode screen with 5 options: Party, Chaos, Classic, Mimic, and Custom. |
| FR-013.2 | Selecting a preset mode (Party, Chaos, Classic, Mimic) shall immediately apply its predefined configuration (impostor count, random impostors, sets of questions, timed rounds, round duration). |
| FR-013.3 | Selecting "Custom" shall skip preset configuration and open the configuration menu directly on the next screen. |
| FR-013.4 | The "Mimic" mode shall replace verbal questions with physical-acting prompts drawn from a dedicated per-category prompt pool (no low/medium/high exposure weighting). |
| FR-013.5 | The selected game mode shall be displayed as a label on the category and player-setup screens. |

### FR-014: Store and In-App Purchases

| ID | Requirement |
|---|---|
| FR-014.1 | Content shall be organised into packs, each bundling one or more word categories and/or character themes behind a single purchase. |
| FR-014.2 | One pack ("Base") shall always be free and available to all users without purchase. |
| FR-014.3 | Paid packs shall be purchasable as non-consumable in-app purchases via Google Play Billing (Android) or StoreKit (iOS). |
| FR-014.4 | A category belonging to a paid pack the user does not own shall be shown locked (lock icon, reduced opacity) and unselectable; tapping it shall navigate to the Store. |
| FR-014.5 | The Store screen shall display each paid pack's real, localised price when available from the platform store, falling back to a placeholder price otherwise. |
| FR-014.6 | Purchased-pack ownership shall be cached locally so it persists across app restarts without a network call. |
| FR-014.7 | The Store shall offer a "Restore purchases" action that re-syncs ownership from the platform's purchase history, for use after reinstalling or switching devices. |
| FR-014.8 | User cancellation of a purchase shall fail silently, with no error alert; other purchase failures shall show a retry-oriented alert and leave the pack locked. |
| FR-014.9 | The app shall run correctly in environments without native IAP support (e.g. Expo Go) by treating all paid packs as locked, without throwing. |

---

## Non-Functional Requirements

### NFR-001: Performance

| ID | Requirement |
|---|---|
| NFR-001.1 | The app shall launch within 3 seconds on target devices. |
| NFR-001.2 | Screen transitions shall complete within 500 ms. |
| NFR-001.3 | End-game animations shall maintain 60 fps on mid-range Android devices. |

### NFR-002: Usability

| ID | Requirement |
|---|---|
| NFR-002.1 | All interactive elements shall be large enough for use in a group setting (minimum 44 × 44 pt touch target). |
| NFR-002.2 | Text shall be readable from arm's length (minimum 14 sp base size). |
| NFR-002.3 | The application shall operate in portrait orientation only. |
| NFR-002.4 | The colour scheme shall maintain sufficient contrast for readability in varied lighting conditions. |

### NFR-003: Compatibility

| ID | Requirement |
|---|---|
| NFR-003.1 | The app shall support Android 7.0+ (API level 24+). |
| NFR-003.2 | The app shall function correctly on screen sizes from 4.5" to 10". |
| NFR-003.3 | The app shall function entirely offline — no network calls shall be required for gameplay. |

### NFR-004: Reliability

| ID | Requirement |
|---|---|
| NFR-004.1 | Game state shall not be lost if the user backgrounds the app during a session. |
| NFR-004.2 | Audio recording failures shall be handled gracefully without crashing the session. |

---

## Data Models

The following TypeScript interfaces define the complete shape of game data.

```typescript
interface Player {
  id: string;              // UUID
  name: string;
  theme: string;           // Character theme group (e.g., "halloween")
  character: string;       // Character illustration name
  score: number;           // Cumulative score across all matches
  matchScore: {
    scoreEvents: { text: string; points: number }[];  // Per-event breakdown
    totalScore: number;                               // Sum of events, this match
  };
}

interface GameConfig {
  numberOfImpostors: number;   // 1–3
  setsOfQuestions: number;     // 1–3
  randomImpostors: boolean;    // if true, count is randomised and hidden
  timedRound: boolean;         // if true, each round is answered against a countdown
  roundDuration: number;       // seconds per round when timedRound is true (3–25, default 10)
}

type ExposureLevel = 'low' | 'medium' | 'high';

interface Round {
  id: string;
  playerThatAsks: Player;
  playerThatAnswers: Player;
  question: string;
  questionIndex: number;
  questionSet: 1 | 2 | 3;
  exposure: ExposureLevel;
  audio: string | undefined;   // file URI of the recording, if any
}

interface Vote {
  playerThatVoted: Player;
  playersVoted: Player[];      // one entry per impostor slot
}

interface Game {
  players: Player[];
  rounds: Round[];
  currentRound: number;
  lyingPlayers: Player[];      // the impostors for this match
  config: GameConfig;
  category: string | undefined;
  word: string | undefined;
  wordIndex: number | undefined;
  impostorVotes: { player: Player; word: string }[];  // impostor word guesses
  showingWordToPlayer: number;
  votes: Vote[];
  currentMatch: number;
  currentScreen?: string;      // last active route path, for session resume
  gameMode?: string;           // id of the selected preset ('party' | 'chaos' | 'classic' | 'mimic' | 'custom')
  previousRankings?: {
    playerId: string;
    position: number;          // rank before this match
    previousScore: number;     // score before this match
  }[];
}
```

Content is organised into purchasable packs. Each pack bundles one or more word
categories and/or character themes behind a single purchase.

```typescript
interface Pack {
  id: string;
  productId: string | null;      // store SKU; null for the always-free pack
  nameKey: string;                // translation key for the pack's display name
  descriptionKey: string;         // translation key for the short description
  categories: string[];           // keys matching data/categories.json
  characterThemes: CharacterTheme[];
  color: string;                  // hex color for the store card
  isFree: boolean;
  previewCharacters: string[];    // character names shown on the store card (max 4)
}
```

---

## Game Flow

```
Home Screen
    │
    ▼
Select Game Mode  (setGameMode; presets apply their config, Custom does not)
    │
    ▼
Select Category  ──────────────────────────────────────────────────────────────┐
    │  (setGameWord)                                                            │
    ▼                                                                           │
Create Game  ◄──────────────────────────────────────────────────────── Back ──┘
    │  (createGame: assign impostors, build rounds)
    ▼
Show Word To All  [per-player private reveal loop]
    │  (showingWordToPlayer iterates through players)
    ▼
Round  [currentRound iterates through all rounds]
    │  (optional audio recording saved to round.audio)
    ▼
Discussion
    │  (review questions + audio playback)
    ▼
Votes  [per-player voting loop]
    │  (addVote called per player)
    ▼
Vote Results  (tally display)
    │
    ▼
Reveal Impostor(s)
    │
    ▼
Reveal Word  (impostor(s) guess the secret word)
    │  (setImpostorVotes, then resolveScoreOfTheMatch)
    ▼
End Game  (animated per-match rankings)
    │
    ├── Play Again  ──► resetGameWithExistingPlayers ──► Select Category
    │
    └── New Game  ──────► createNewGame ──────────────► Home Screen
```

The Store screen sits outside this linear flow and can be reached from three places:
the Home screen button, the sidebar menu (available on any screen), or by tapping a
locked category on the Select Category screen.

---

## User Stories and Acceptance Criteria

### Epic 1: Game Setup

**US-001** — As a player, I want to enter my name and select a character so I can be identified throughout the game.
- Name input accepts 1–15 characters.
- Characters are unique; a selected character is unavailable to other players.
- The player appears in the list immediately with their chosen character.

**US-002** — As a host, I want to configure impostors and question sets before starting, so the game matches the group's preference.
- Config menu is accessible from the category and player setup screens.
- Changes are reflected immediately in the game state.
- Conflict between impostor count and player count is handled without blocking the game.

**US-003** — As a host, I want to start the game only when at least 3 players are registered.
- The Create Game button is disabled with fewer than 3 players.
- No upper limit warning is needed up to 10 players.

### Epic 2: Gameplay

**US-004** — As a player, I want to see the secret word privately so others cannot read it over my shoulder.
- Word is hidden until the player taps to reveal.
- Device is explicitly passed to the next player between reveals.

**US-005** — As a player, I want to answer questions in a structured format so all players answer the same way.
- The question, the asker, and the answerer are all displayed.
- Navigation to the next question requires an explicit tap.

**US-006** — As a player, I want to record my answer so the group can replay it during discussion.
- Recording is optional; rounds without audio still function.
- Recordings are scoped to a single round and do not persist after the game ends.

**US-007** — As a player, I want to vote on who I think the impostor(s) are.
- The device is passed per player.
- Players select exactly as many suspects as there are impostors.
- The player cannot vote for themselves.

### Epic 3: Scoring and Results

**US-008** — As a player, I want to see a detailed score breakdown after each match.
- Each score event is shown individually (e.g., "Detected 1 impostor", "Never detected!!!").
- The animated count-up makes the scoring transparent and engaging.
- Position changes vs. the previous match are displayed.

**US-009** — As a player, I want to keep playing with the same group across multiple matches.
- Scores accumulate.
- Configuration persists between matches.
- The game resumes on the correct screen if the app is backgrounded.

### Epic 4: Game Modes and Customisation

**US-010** — As a host, I want to pick a preset play style so I don't have to configure every option manually.
- Party, Chaos, Classic, and Mimic each apply a complete configuration in one tap.
- Selecting Custom opens the configuration menu directly instead of applying a preset.

**US-011** — As a player, I want to answer against the clock so rounds feel more energetic.
- A 3-2-1 countdown precedes a visual timer ring for the configured duration.
- Time expiring stops any in-progress recording automatically and does not block the player from continuing.

**US-012** — As a player, I want a mode where I act out clues instead of answering questions verbally.
- Mimic mode rounds display a physical-acting prompt drawn from the selected category.
- Mimic mode uses the same pass-device and voting flow as other modes.

### Epic 5: Monetization

**US-013** — As a user, I want to unlock extra categories and characters by purchasing themed packs.
- Locked categories are visually distinct (lock icon, dimmed) and route to the Store when tapped.
- The Store shows the real, localised store price when available.

**US-014** — As a user, I want to recover purchases I've already paid for after reinstalling the app.
- A "Restore purchases" action re-syncs ownership from the platform's purchase history without requiring repurchase.
- A cancelled or failed purchase leaves the pack locked and shows a retry-oriented alert, without crashing the app.
