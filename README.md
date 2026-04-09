# Who is Lying?

**Who is Lying** is a local multiplayer social deduction party game for 3–10 players on a single device. Everyone knows the secret word — except the impostor. Ask the right questions, give convincing answers, and identify the spy before they guess the word and win.

Available on Android. iOS version in preparation.

---

## Screenshots

<img src="./assets/images/screenshot2.jpeg" alt="Creating a game with unique characters" width="120"/> <img src="./assets/images/screenshot1.jpeg" alt="A round of questions" width="120"/> <img src="./assets/images/screenshot3.jpeg" alt="Revealing the secret word" width="120"/>

---

## How to Play

1. Select a **word category** (Food, Animals, Halloween, and more).
2. Configure game settings: number of impostors, sets of questions, and whether to randomize impostors.
3. Each player receives the secret word privately — the impostor(s) see nothing.
4. Players take turns **asking and answering questions** in structured rounds. Answers may be recorded as audio.
5. After all rounds, a **discussion phase** lets everyone review questions and listen back to recordings.
6. Each player **votes** on who they believe the impostor(s) are.
7. The impostor(s) make a final attempt to **guess the secret word**.
8. Scores are calculated and an **animated end-game ranking** is revealed.
9. Play again with the same group — scores carry over across matches.

---

## Features

- Local play for 3–10 players on a single device
- Configurable number of impostors (1–3), including a random/hidden mode
- Configurable sets of questions (1–3 sets per game)
- Audio recording per round — playback during discussion
- Exposure-based question distribution (low / medium / high difficulty) that escalates across sets
- Turn-based voting with multi-select when there are multiple impostors
- Detailed score breakdown per match with animated end-game screen
- Persistent game state via AsyncStorage — the app resumes where it left off after backgrounding
- Bilingual: English and Brazilian Portuguese
- Unique character selection with theme filters
- Game configuration conflict resolution (too many impostors for player count)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| State Management | React Context API + AsyncStorage |
| Animations | React Native Reanimated |
| Responsive Layout | react-native-size-matters |
| Audio | expo-audio |
| Internationalisation | Custom i18n with JSON translation files |
| Testing | Jest 29 + React Native Testing Library |
| Code Quality | ESLint + Prettier |
| Build & Distribution | EAS Build (Expo Application Services) |

---

## Project Structure

```
whoIsLying/
├── app/                    # Expo Router screens (file-based routing)
│   ├── index.tsx           # Home / splash screen
│   ├── selectCategory.tsx  # Category carousel with flip-card preview
│   ├── createGame.tsx      # Player setup and game configuration
│   ├── showWordToAll.tsx   # Private word reveal per player
│   ├── words.tsx           # Impostor's private "you are the impostor" screen
│   ├── round.tsx           # Active question round with audio recording
│   ├── discussion.tsx      # Review all questions and audio playback
│   ├── votes.tsx           # Voting screen (multi-select for multi-impostor)
│   ├── votesResults.tsx    # Vote tally before impostor reveal
│   ├── revealImpostor.tsx  # Reveal impostor identity
│   ├── revealWord.tsx      # Impostor's word guess screen
│   ├── endGame.tsx         # Animated per-match score rankings
│   └── endOfMatches.tsx    # Final tournament standings
├── context/
│   ├── GameContext.tsx     # Central game state and all game logic
│   ├── LanguageContext.tsx # Language selection (EN / PT)
│   └── AppResetContext.tsx # Full app state reset
├── components/             # Reusable UI components
├── types/                  # TypeScript interfaces (Game, Player, Round, Vote, GameConfig)
├── data/
│   └── categories.json     # Word lists and question pools per category
├── translations/           # i18n JSON files (en.json, pt.json, categories.en.json, categories.pt.json)
├── styles/                 # Design tokens (colors, fontSize, spacing, radius)
├── utils/
│   └── gameTranslations.ts # Word index resolution utilities
└── __tests__/
    └── GameContext.test.tsx # 56 automated unit tests for core game logic
```

---

## Architecture

### State Management

All game state lives in `GameContext`. It is the single source of truth for players, rounds, voting, configuration, scores, and navigation history. The context persists its state to `AsyncStorage` after every change so the app can resume from the exact screen if it is backgrounded or closed.

On mount, the context reads from storage and merges the saved state with the current `INITIAL_GAME` defaults, ensuring newly added config fields always have valid values even when upgrading from an older saved state.

### Game Configuration

`GameConfig` controls three dimensions independently:

- **numberOfImpostors** (1–3): how many players receive the impostor role.
- **setsOfQuestions** (1–3): how many question rounds each player answers. Total rounds = `players × sets`.
- **randomImpostors**: if true, the number of impostors is randomised each game and hidden from players.

A conflict-resolution modal automatically appears if the configured impostor count exceeds the player count constraint (`maxImpostors = players − 2`).

### Question Distribution

Questions are classified as `low`, `medium`, or `high` exposure (how likely they are to reveal the impostor). The engine distributes questions across exposure levels per set using a fixed schedule that escalates pressure:

| Sets | Set 1 | Set 2 | Set 3 |
|---|---|---|---|
| 1 set | 50% L · 30% M · 20% H | — | — |
| 2 sets | 70% L · 30% M · 0% H | 10% L · 40% M · 50% H | — |
| 3 sets | 100% L · 0% M · 0% H | 30% L · 50% M · 20% H | 0% L · 30% M · 70% H |

Counts use largest-remainder rounding so they always sum to exactly `players`.

### Scoring

Scores are resolved in a single pass at the end of voting by `resolveScoreOfTheMatch`:

**Civilians:**
- +2 pts for detecting 1 impostor
- +3 pts for detecting 2 impostors in the same vote
- +5 pts for detecting all 3 impostors in the same vote

**Impostors:**
- +1 pt per voter who fails to identify them (accumulates during voting pass)
- Flat bonus if **never** detected: +3 (1 impostor), +5 (2 impostors), +10 (3 impostors) — replaces the per-voter +1 pts
- +3 pts if they correctly guess the secret word

Match scores are stored separately in `player.matchScore` so the end-game animation can display a per-event breakdown before merging into the cumulative `player.score`.

### Routing & Screen Persistence

Expo Router provides file-based navigation. The current screen path is written to `game.currentScreen` via `setCurrentScreen` on every screen mount. On app launch, if a saved game exists with players, the app navigates directly to `currentScreen` instead of the home screen.

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android emulator) or a physical device with Expo Go

### Installation

```bash
git clone https://github.com/BrenoFischer/whoIsLying
cd whoIsLying
npm install
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator
npx expo start --ios
```

### Development Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Lint the codebase
npm run lint

# Format code with Prettier
npm run format
```

---

## Testing

The project follows a multi-layer quality assurance strategy.

### Automated Tests — Jest

Core game logic is covered by a suite of 56 unit tests in `__tests__/GameContext.test.tsx`.

```
Test Suites: 1 passed
Tests:       56 passed, 56 total
Pass rate:   100%
```

Test suites:

| Suite | Tests | What is covered |
|---|---|---|
| Initial State | 2 | Default game shape, AsyncStorage hydration |
| Game Configuration | 5 | `setNumberOfImpostors`, `setSetsOfQuestions`, `setRandomImpostors` |
| Word Management | 6 | `getRandomWord`, `setGameWord`, `getCurrentWord` |
| Round Navigation | 3 | `nextRound`, `previousRound`, `showWordToNextPlayer` |
| Player Management | 3 | `updatePlayers`, `getSortedPlayers` (score + tie-break) |
| createGame | 7 | Round count, impostor selection, edge cases |
| Impostor Identification | 3 | `checkIfPlayerIsLiar`, `getLyingPlayers` |
| Voting | 4 | `addVote` (single + multi), `setImpostorVotes` |
| Round Questions | 3 | `getCurrentQuestion` |
| Audio Recordings | 4 | `saveRecordingToRound`, `getRoundAudio` |
| Screen Tracking | 2 | `setCurrentScreen` |
| resolveScoreOfTheMatch | 7 | All scoring branches (detect, miss, never-detected, word guess, cumulative) |
| Game Reset Functions | 5 | `createNewGame`, `resetGameWithExistingPlayers`, `previousRankings` |
| Context Provider Contract | 2 | Public API surface, state and hydration flag |

See [jest_tests.md](./jest_tests.md) for detailed test documentation.

### Manual Testing

Manual test plans covering player management, game setup, and end-to-end game flow are documented in [test_plans.md](./test_plans.md).

### Quality Gate

Jest is configured with a minimum coverage threshold of 70% across branches, functions, lines, and statements for all non-trivial source files.

---

## Project Documentation

| Document | Description |
|---|---|
| [requirements.md](./requirements.md) | Functional and non-functional requirements with data models and game flow |
| [test_plans.md](./test_plans.md) | Manual test cases, QA strategy, and release criteria |
| [jest_tests.md](./jest_tests.md) | Automated test suite documentation with results |

---

## Roadmap

### Completed

- [x] Core game logic with multi-impostor support
- [x] Configurable game settings (impostors, question sets, random mode)
- [x] Audio recording and playback per round
- [x] Exposure-based question escalation system
- [x] Animated end-game score screen (React Native Reanimated)
- [x] Game state persistence and session resume
- [x] Bilingual support (English / Brazilian Portuguese)
- [x] 56 automated unit tests — 100% pass rate
- [x] Google Play Store (Android) release (currently closed tests)

### In Progress

- [ ] Apple App Store (iOS) submission
- [ ] Additional word categories
- [ ] Additional Characters

### Future Enhancements

- [ ] Game statistics and match history
- [ ] Store purchase of themes/characters
- [ ] Spanish language support
- [ ] End-to-end tests with Detox
- [ ] Accessibility improvements (screen reader support)

---

## Author

**Breno Fischer**
GitHub: [@BrenoFischer](https://github.com/BrenoFischer)

---

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit).
