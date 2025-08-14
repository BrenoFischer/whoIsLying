# Who Is Lying - Project Requirements & Documentation

## 🎯 Project Overview

**Who Is Lying** is a React Native local multiplayer party game for 3-10 players on a single device. Players take turns trying to identify the impostor while the impostor attempts to blend in and survive.

---

## 📋 Functional Requirements

### FR-001: Player Management

- **FR-001.1**: System SHALL support 3-10 players in a single game session
- **FR-001.2**: System SHALL allow players to enter/edit their names before game start
- **FR-001.3**: System SHALL validate player names with 1 to 15 characters, within a session
- **FR-001.4**: System SHALL allow players to select a gender and a illustration
- **FR-001.5**: System SHALL display current player count and remaining slots

### FR-002: Game Setup & Configuration

- **FR-002.1**: System SHALL randomly assign one impostor per game
- **FR-002.2**: System SHALL provide game rules/instructions screen
- **FR-002.3**: System SHALL allow host to start game when minimum players reached
- **FR-002.4**: System SHALL support game reset/restart functionality

### FR-003: Gameplay Mechanics

- **FR-003.1**: System SHALL present questions/prompts to all players
- **FR-003.2**: System SHALL display all responses anonymously for voting
- **FR-003.3**: System SHALL handle turn-based player interaction on single device
- **FR-003.4**: System SHALL implement voting mechanism for impostor identification

### FR-004: Game Flow & State Management

- **FR-004.1**: System SHALL manage game phases (setup, question, response, voting, results)
- **FR-004.2**: System SHALL track game progress and scores
- **FR-004.3**: System SHALL record points correctly for impostors and regular players
- **FR-004.4**: System SHALL provide end game summary and restart option

### FR-005: User Interface

- **FR-005.1**: System SHALL provide intuitive touch-based navigation
- **FR-005.2**: System SHALL display clear visual indicators for current player/phase
- **FR-005.3**: System SHALL implement responsive design for various screen sizes
- **FR-005.4**: System SHALL provide visual feedback for user actions

---

## ⚡ Non-Functional Requirements

### NFR-001: Performance

- **NFR-001.1**: App SHALL launch within 3 seconds on target devices
- **NFR-001.2**: Game state transitions SHALL complete within 1 second

### NFR-002: Usability

- **NFR-002.1**: UI elements SHALL be large enough for group gameplay
- **NFR-002.2**: Text SHALL be readable from arm's length
- **NFR-002.3**: App SHALL work only in portrait
- **NFR-002.4**: Color scheme SHALL provide sufficient contrast

### NFR-003: Compatibility

- **NFR-003.1**: App SHALL support Android 7.0+ (API level 24+)
- **NFR-003.2**: App SHALL work on devices with screen sizes 4.5" to 10"
- **NFR-003.3**: App SHALL function without internet connectivity

---

## 📱 Technical Specifications

### Tech Stack

- **Framework**: React Native
- **State Management**: Context API
- **Navigation**: Expo Router
- **Build**: Expo/React Native CLI
- **Target Platform**: Android (Play Store) / iOS (Apple Store)

---

## 👥 User Stories & Acceptance Criteria

### Epic 1: Game Setup

**US-001**: As a player, I want to add my name and choose an illustration, so I can participate in the game

- **AC**: Name input field accepts 1-15 characters
- **AC**: Multiple illustrations, based on gender, to select
- **AC**: Name appears in player list immediately

**US-002**: As a host, I want to start the game when ready so everyone can begin playing

- **AC**: Start button enabled only with 3+ players
- **AC**: Game transitions to "reveal words" phase
- **AC**: A message to pass the device to a specific player is displayed

### Epic 2: Gameplay

**US-003**: As a player, I want to answer questions privately so others can't see my response

- **AC**: Only current player sees question and input field
- **AC**: Previous responses are hidden from other players
- **AC**: Device can be passed securely between players

**US-004**: As a player, I want to vote for who I think is lying so I can try to win

- **AC**: All responses shown anonymously during voting
- **AC**: Each player gets one vote
- **AC**: Results revealed after all votes cast

### Epic 3: Game Management

**US-005**: As a player, I want to see game results so I know who won

- **AC**: Impostor identity revealed
- **AC**: Winning team announced
- **AC**: Option to play again displayed

---

### Data Models

**Player**
```
Player {
  id: string;
  name: string;
  gender: string;
  character: string;
  score: number;
}
```

**Round**
```
Round {
  playerThatAsks: Player;
  playerThatAnswers: Player;
  question: string;
}
```

**Vote**
```
Vote {
  playerThatVoted: Player;
  playerVoted: Player;
}
```

**Game**
```
Game {
  players: Player[];
  rounds: Round[];
  currentRound: number;
  lyingPlayer: Player;
  category: undefined | string;
  word: undefined | string;
  selectedWord: undefined | string;
  showingWordToPlayer: number;
  votes: Vote[];
  maximumMatches: number;
  currentMatch: number;
}
```

---

## 🔄 Game Flow Diagram

### Game States and Transitions

1. **Setup Phase**
   - Select maximum number of rounds (adjustable at the end)
   - Select Category
   - Add players (3-10)
   - Assign impostor randomly
   - Assign each other Player a secret word randomly
   - Assign each Round a question based on the selected Category

2. **Reveal Word Phase**
   - Reveal secret word or if it's impostor to each player individually
   - Button to reveal text, to safely share the same device

2. **Question Phase**
   - Display which Player is making the question and which Player is answering it
   - Display current question
   - Show whose turn it is
   - Display button to go to next question

3. **Discussion Phase**
   - Display all questions that were made

4. **Voting Phase**
   - Collect votes from each player
   - Calculate results

5. **Results Phase**
   - Show voting results
   - Reveal impostor identity
   - Display winner
   - Option to restart


---

## 🚀 Deployment Strategy

### Release Phases

**Phase 1: Alpha Testing**
- Internal testing with core features
- Basic gameplay mechanics validation
- Performance baseline establishment

**Phase 2: Beta Testing**
- Limited user testing (friends/family)
- User experience feedback collection
- Bug fixes and performance optimization

**Phase 3: Production Release**
- App Store submission
- Marketing materials preparation
- User support documentation

### Distribution Channels

- **Primary**: Google Play Store (Android)
- **Secondary**: Apple App Store (iOS)
