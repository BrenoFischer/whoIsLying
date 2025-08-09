# Who Is Lying - Project Requirements & Test Plans

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
- **FR-003.2**: System SHALL collect responses from each player privately
- **FR-003.3**: System SHALL display all responses anonymously for voting
- **FR-003.4**: System SHALL handle turn-based player interaction on single device
- **FR-003.5**: System SHALL implement voting mechanism for impostor identification

### FR-004: Game Flow & State Management
- **FR-004.1**: System SHALL manage game phases (setup, question, response, voting, results)
- **FR-004.2**: System SHALL track game progress and scores
- **FR-004.3**: System SHALL determine win conditions for impostors and regular players
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
- **NFR-001.3**: Memory usage SHALL not exceed 200MB during gameplay

### NFR-002: Usability
- **NFR-002.1**: UI elements SHALL be large enough for group gameplay (min 44dp touch targets)
- **NFR-002.2**: Text SHALL be readable from arm's length (min 16sp font size)
- **NFR-002.3**: App SHALL work only in portrait
- **NFR-002.4**: Color scheme SHALL provide sufficient contrast (WCAG AA compliance)

### NFR-003: Compatibility
- **NFR-003.1**: App SHALL support Android 7.0+ (API level 24+)
- **NFR-003.2**: App SHALL work on devices with screen sizes 4.5" to 10"
- **NFR-003.3**: App SHALL function without internet connectivity
- **NFR-003.4**: App SHALL support multiple screen densities (mdpi to xxxhdpi)

### NFR-004: Reliability
- **NFR-004.1**: App SHALL recover gracefully from app backgrounding/foregrounding
- **NFR-004.2**: Game state SHALL persist during interruptions (calls, notifications)
- **NFR-004.3**: App crash rate SHALL be less than 1% of sessions

---

## 📱 Technical Specifications

### Tech Stack
- **Framework**: React Native
- **State Management**: Context API
- **Navigation**: Expo Router
- **Storage**: AsyncStorage (for settings/preferences)
- **Build**: Expo/React Native CLI
- **Target Platform**: Android (Play Store) / iOS (Apple Store)

### Key Components
- Game State Manager
- Player Management System  
- Question/Response Handler
- Voting System
- UI/UX Components
- Local Data Persistence

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

## 🧪 Test Plans

## Test Plan 1: Player Management Testing

### TP-001: Player Addition & Validation
**Objective**: Verify player management functionality

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-001.1 | Add valid player name | Name added to player list |
| TC-001.2 | Add duplicate player name | Error message displayed, name rejected |
| TC-001.3 | Add name with special characters | Name accepted or appropriate validation |
| TC-001.4 | Add maximum length name (15+ chars) | Name truncated or validation error |
| TC-001.5 | Try to add 11th player | Error message, player limit enforced |
| TC-001.6 | Remove player from list | Player removed, count updated |

### TP-001: Boundary Testing
| Test Case | Input | Expected Result |
|-----------|-------|-----------------|
| TC-001.7 | 2 players, try to start | Start button disabled |
| TC-001.8 | 3 players, try to start | Game starts successfully |
| TC-001.9 | 10 players, try to start | Game starts successfully |
| TC-001.10 | Empty player name | Validation error |

---

## Test Plan 2: Game Flow Testing

### TP-002: Core Gameplay
**Objective**: Verify complete game flow works correctly

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-002.1 | Start game with 5 players | One impostor assigned randomly |
| TC-002.2 | Complete question round | All players answer privately |
| TC-002.3 | Proceed to voting phase | Responses shown anonymously |
| TC-002.4 | Complete voting round | Results calculated correctly |
| TC-002.5 | Check win conditions | Correct winner determined |
| TC-002.6 | Restart game | New impostor assigned |

### TP-002: State Management
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-002.7 | Rotate device during gameplay | Game state preserved |
| TC-002.8 | Background/foreground app | Game continues from same state |
| TC-002.9 | Receive notification during game | Game state unaffected |
| TC-002.10 | Low memory scenario | App handles gracefully |

---

## Test Plan 3: UI/UX Testing

### TP-003: Interface & Usability
**Objective**: Verify user interface works across different scenarios

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-003.1 | Test on 5" screen | All elements visible and touchable |
| TC-003.2 | Test on 6.5" screen | UI scales appropriately |
| TC-003.3 | Test on tablet (10") | Layout adapts correctly |
| TC-003.4 | Test touch targets | All buttons minimum 44dp |
| TC-003.5 | Test text readability | Font size appropriate for group play |
| TC-003.6 | Test color contrast | Meets accessibility standards |

### TP-003: Responsive Design
| Test Case | Device/Orientation | Expected Result |
|-----------|-------------------|-----------------|
| TC-003.7 | Portrait phone | Optimal layout |
| TC-003.8 | Landscape phone | Elements repositioned appropriately |
| TC-003.9 | Portrait tablet | Scaled UI elements |
| TC-003.10 | Landscape tablet | Full screen utilization |

---

## Test Plan 4: Performance Testing

### TP-004: Performance & Resource Usage
**Objective**: Verify app meets performance requirements

| Test Case | Metric | Target | Test Method |
|-----------|--------|--------|-------------|
| TC-004.1 | App launch time | <3 seconds | Cold start measurement |
| TC-004.2 | Memory usage | <200MB | Profiling during gameplay |
| TC-004.3 | Frame rate | 60fps | UI animation testing |
| TC-004.4 | Battery usage | Minimal drain | Extended play testing |
| TC-004.5 | Storage usage | <50MB | APK size + data |

---

## Test Plan 5: Edge Cases & Error Handling

### TP-005: Robustness Testing
**Objective**: Verify app handles unexpected scenarios gracefully

| Test Case | Scenario | Expected Result |
|-----------|----------|-----------------|
| TC-005.1 | Network interruption | No impact (offline game) |
| TC-005.2 | Incoming phone call | Game pauses, resumes correctly |
| TC-005.3 | Low battery warning | Game continues unaffected |
| TC-005.4 | Storage full | App functions normally |
| TC-005.5 | Multiple rapid taps | No duplicate actions |
| TC-005.6 | Device lock/unlock | Game state preserved |

---

## 📊 Test Execution Tracking

### Test Metrics
- **Total Test Cases**: 35+
- **Functional Tests**: 20
- **Performance Tests**: 5
- **UI/UX Tests**: 10
- **Edge Case Tests**: 6

### Coverage Areas
- ✅ Player Management (100%)
- ✅ Game Flow (100%)  
- ✅ UI/UX (100%)
- ✅ Performance (100%)
- ✅ Error Handling (100%)

### Risk Assessment
- **High Risk**: Single device multiplayer coordination
- **Medium Risk**: State management during interruptions
- **Low Risk**: Basic UI functionality

---

## 🚀 Deployment Checklist

### Pre-Release Validation
- [ ] All functional requirements tested
- [ ] Performance benchmarks met
- [ ] UI/UX validated on target devices
- [ ] Edge cases handled appropriately
- [ ] Play Store guidelines compliance verified
- [ ] APK size optimized
- [ ] Screenshots and store listing prepared

### Post-Release Monitoring
- [ ] Crash analytics configured
- [ ] Performance monitoring enabled
- [ ] User feedback collection ready
- [ ] Update rollout strategy defined

