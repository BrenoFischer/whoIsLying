# Who Is Lying — Test Plans & QA Documentation

## Testing Strategy

The project follows a layered quality assurance strategy:

1. **Automated unit tests** (Jest + React Native Testing Library) — cover all business logic in `GameContext`. Run on every change.
2. **Manual functional tests** — cover the full user journey across screens. Executed before any release.
3. **Regression tests** — the automated suite serves as the regression baseline; manual tests are re-executed when screens change.

The testing philosophy is to test **behaviour, not implementation**. Tests assert on the public contract that components and context functions expose, not on internal data structures.

---

## Test Plan 1 — Player Management

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-001.1 | Add valid player name | Enter a name between 1 and 15 characters and confirm | Player appears in the list with the chosen character | High |
| TC-001.2 | Name at minimum boundary | Enter a 1-character name and confirm | Player is accepted and added to the list | High |
| TC-001.3 | Name at maximum boundary | Enter a 15-character name and confirm | Player is accepted and added to the list | High |
| TC-001.4 | Name exceeds limit | Attempt to type more than 15 characters | Input is capped at 15; no extra characters appear | High |
| TC-001.5 | Duplicate player names | Add two players with the same name | Both are accepted; names are valid (no uniqueness constraint) | Medium |
| TC-001.6 | Delete a player | Add 3+ players, then delete one | The deleted player is removed; remaining players are unaffected | High |
| TC-001.7 | Attempt to add an 11th player | Add 10 players, then try to add another | The add-player input is disabled; player count stays at 10 | High |
| TC-001.8 | Character uniqueness | Add multiple players and select characters | Each character can only be assigned to one player at a time | High |
| TC-001.9 | Character picker theme filter | Open character picker and select a theme filter | Only characters belonging to the selected theme are shown | Medium |

---

## Test Plan 2 — Game Configuration

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-002.1 | Default configuration | Open a new session without changing settings | numberOfImpostors = 1, setsOfQuestions = 2, randomImpostors = false | High |
| TC-002.2 | Increase impostor count to 2 | Open config menu, increase impostors to 2 | Config updates immediately; badge on config button reflects new value | High |
| TC-002.3 | Increase impostor count to 3 | Open config menu, increase impostors to 3 | Config updates immediately | High |
| TC-002.4 | Impostor count upper bound | Attempt to increase impostors above 3 | The + button is disabled; count stays at 3 | High |
| TC-002.5 | Impostor count lower bound | Attempt to decrease impostors below 1 | The − button is disabled; count stays at 1 | High |
| TC-002.6 | Enable Random & Hidden mode | Toggle "Random & Hidden impostors" on | The impostor count control dims and becomes non-interactive | High |
| TC-002.7 | Sets of questions — increase to 3 | Open config menu, increase sets to 3 | Config updates; game will create players × 3 rounds | High |
| TC-002.8 | Sets of questions — lower bound | Attempt to decrease sets below 1 | The − button is disabled | High |
| TC-002.9 | Config persists across screens | Configure settings on category screen, navigate to create game | Settings remain unchanged on the create-game screen | High |
| TC-002.10 | Impostor conflict — too many for player count | Configure 3 impostors, then add only 4 players and start | Conflict modal appears offering an adjusted count | High |
| TC-002.11 | Resolve conflict — accept adjusted count | In conflict modal, keep the adjusted count and create game | Game creates with the adjusted impostor count | High |
| TC-002.12 | Resolve conflict — choose random mode | In conflict modal, toggle random mode and create game | Game creates with random impostor count | Medium |

---

## Test Plan 3 — Word and Category Selection

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-003.1 | Category carousel navigation | Swipe between categories on the carousel | Active category changes; card highlights accordingly | High |
| TC-003.2 | Flip card preview | Tap a category card | Card flips to show the description | Medium |
| TC-003.3 | Continue with selected category | Select a category and tap "Select category" | Navigates to Create Game; selected category is saved in state | High |
| TC-003.4 | Locked category | Scroll to an unavailable category | Lock icon is shown; category cannot be selected; Continue button is disabled | High |
| TC-003.5 | Category persists to create-game screen | Select a category, navigate to create game | The header on the create-game screen shows the selected category name | Medium |

---

## Test Plan 4 — Word Reveal Phase

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-004.1 | Word revealed to civilian | During the reveal loop, tap reveal on a civilian's turn | The secret word appears | Critical |
| TC-004.2 | Impostor sees no word | During the reveal loop, tap reveal on the impostor's turn | An "impostor" message is shown — not the word | Critical |
| TC-004.3 | Device pass prompt | After revealing the word, tap "Done" | The screen shows a pass-device prompt for the next player | High |
| TC-004.4 | No back navigation | Attempt to navigate back from the reveal screen | Navigation is blocked; player cannot go back | High |
| TC-004.5 | Multiple impostors — all see impostor screen | Configure 2 impostors; run through reveal for all players | The two impostors see the impostor screen; all others see the word | Critical |

---

## Test Plan 5 — Question Rounds

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-005.1 | Correct round count | Create a game with 4 players and 2 sets | 8 rounds are generated (4 × 2) | High |
| TC-005.2 | Round count with 3 sets | Create a game with 3 players and 3 sets | 9 rounds are generated (3 × 3) | High |
| TC-005.3 | Asking and answering players shown | Navigate to any round | The asker's name, answerer's name, and question are all displayed | High |
| TC-005.4 | Advance to next round | Tap the "Next" button | The next round is displayed; currentRound increments | High |
| TC-005.5 | Last round — navigate to discussion | Tap "Next" on the final round | The app navigates to the Discussion screen | High |
| TC-005.6 | Audio recording | Tap the record button, speak, then stop | Recording is attached to the round and the round card shows a playback icon | High |
| TC-005.7 | Forgot word flow | Tap "Forgot word" during a round | A player-select modal appears, then the word is shown privately | Medium |

---

## Test Plan 6 — Discussion Phase

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-006.1 | All questions displayed | Navigate to discussion after completing all rounds | All questions are listed, grouped by answering player | High |
| TC-006.2 | Audio playback | Tap the play button on a round with a recording | Audio plays through the speaker | High |
| TC-006.3 | Pause and resume | Tap play, then tap pause | Audio pauses; tapping play again resumes from the same position | Medium |
| TC-006.4 | Switching recordings | Play one recording, then tap another round | Previous audio stops; new audio begins | Medium |
| TC-006.5 | Round without recording | Inspect a round created without recording | No playback control is shown for that round | Medium |

---

## Test Plan 7 — Voting Phase

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-007.1 | Identity modal on each player's turn | Navigate to the voting screen | Each player sees a modal confirming their name before voting | Critical |
| TC-007.2 | Vote selection — single impostor game | Tap one player from the list | The player is highlighted; the Continue button text shows "1 of 1 selected" | High |
| TC-007.3 | Vote confirmed and advanced | Tap Continue with a valid selection | Vote is registered; device-pass flow moves to the next player | High |
| TC-007.4 | Cannot self-vote | Inspect the voter's own name in the list | The current voter does not appear in the voting list | Critical |
| TC-007.5 | Multi-select — 2 impostor game | Configure 2 impostors; cast a vote | Two selections are required; the button shows "1 of 2 selected" until complete | High |
| TC-007.6 | Replace oldest selection at capacity | Select 2 players (2-impostor game), then tap a 3rd | The oldest selection is replaced; total always equals 2 | High |
| TC-007.7 | Deselect a player | Tap an already-selected player | The player is deselected | High |
| TC-007.8 | All players vote | Complete the voting loop for all players | The app navigates to Vote Results | High |

---

## Test Plan 8 — Vote Results and Impostor Reveal

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-008.1 | Vote tally accuracy | Cast known votes, then view results | Each player's vote count matches what was cast | Critical |
| TC-008.2 | Most-voted player highlighted | One player receives the most votes | That player appears prominently at the top of the results | High |
| TC-008.3 | Tie handling | Two players receive the same highest vote count | The tie is acknowledged and both players are featured | High |
| TC-008.4 | Impostor revealed correctly | Tap "Reveal Impostor" | The actual impostor(s) are shown with their name and character | Critical |
| TC-008.5 | Multiple impostors revealed | Configure 2 impostors and play through | Both impostors are revealed on the reveal screen | High |
| TC-008.6 | Impostor word guess — correct | Impostor types the exact secret word | The score resolution awards +3 pts for the correct guess | Critical |
| TC-008.7 | Impostor word guess — incorrect | Impostor types a different word | No bonus is awarded for the word guess | High |

---

## Test Plan 9 — Scoring and End Game

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-009.1 | Civilian detects 1 impostor | Civilian votes correctly for the only impostor | That civilian receives exactly +2 pts | Critical |
| TC-009.2 | Civilian misses impostor | Civilian votes for a non-impostor | No points awarded to the civilian | High |
| TC-009.3 | Impostor never detected | No civilian votes for the impostor | Impostor receives the flat +3/+5/+10 never-detected bonus | Critical |
| TC-009.4 | Impostor partially detected | Some civilians vote correctly, some do not | Detected impostors get no flat bonus; each per-voter +1 from misses still applies | High |
| TC-009.5 | Per-event breakdown shown | View the end-game screen after a scored match | Each score event (e.g., "Detected 1 impostor +2") is listed per player card | High |
| TC-009.6 | Scores carry over between matches | Play two matches with the same group | Second match scores are added to first match scores | Critical |
| TC-009.7 | Rank change indicators | Play two matches | Cards show up/down arrows and position delta vs. previous match | Medium |
| TC-009.8 | Impostor badge on end-game card | View end-game screen | Impostor player cards have a visual distinction | Medium |

---

## Test Plan 10 — Session Persistence and Resume

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-010.1 | State survives backgrounding | Start a game, background the app, reopen it | The app is on the same screen with all data intact | Critical |
| TC-010.2 | Resume navigates to correct screen | Background during the round phase, reopen | The app navigates directly to the round screen | High |
| TC-010.3 | New session starts from Home | No saved game exists on first launch | The app starts at the Home screen | High |

---

## Test Plan 11 — Internationalisation

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-011.1 | Switch to Portuguese | Tap the "PT" button on the Home screen | All UI text switches to Brazilian Portuguese immediately | High |
| TC-011.2 | Switch back to English | Tap the "EN" button | All UI text switches back to English | High |
| TC-011.3 | Category questions localised | Play a game with Portuguese selected | Questions are displayed in Portuguese | High |
| TC-011.4 | Language persists across screens | Select Portuguese, navigate to multiple screens | Language remains Portuguese throughout the session | High |

---

## Test Plan 12 — History and Saved Players

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-012.1 | Players auto-saved on first game | Create a game with brand-new players and finish it | All players appear in the saved players list with 0 matches played | Critical |
| TC-012.2 | Known player reuses existing profile | Add a player whose name already exists in saved players | The existing saved profile (and its id) is reused, no duplicate is created | Critical |
| TC-012.3 | Saved players button appears when list is non-empty | Open create-game screen after at least one player has been saved | "Saved players" button appears with a badge showing the correct count | High |
| TC-012.4 | Saved players button hidden when list is empty | Open create-game screen on a fresh install with no saved players | No "Saved players" button is shown | High |
| TC-012.5 | Add saved player to game | Open saved players list and tap a player | The player is added to the current player list | High |
| TC-012.6 | Already-added player is not re-addable | Open saved players list when a saved player is already in the current list | That player row shows a checkmark and cannot be tapped again | High |
| TC-012.7 | Saved players list respects player cap | Have 10 players in the game, open saved players list and tap another | A toast appears saying the player limit is reached; player is not added | High |
| TC-012.8 | Delete saved player from list | Open saved players list, tap the trash icon on a player, confirm | The player is removed from the list permanently | High |
| TC-012.9 | Delete confirmation — cancel | Tap trash icon on a player, then tap Cancel | The delete is aborted; the player remains in the list | Medium |
| TC-012.10 | Auto-delete conflict — limit reached | Have 30 saved players, then create a game with new players | The auto-delete conflict modal appears listing the candidates to be removed | Critical |
| TC-012.11 | Auto-delete conflict — confirm | In the conflict modal, tap Continue | The listed players are removed and the new players are saved; game starts | Critical |
| TC-012.12 | Auto-delete conflict — cancel | In the conflict modal, tap Cancel | Nothing is deleted; game does not start; user can manage the list manually | High |
| TC-012.13 | Auto-delete picks players with fewest matches | Trigger auto-delete with several candidates of different match counts | The candidates shown are the ones with the fewest matches played | High |
| TC-012.14 | Stats updated after a match — matches played | Play one full match as a saved player | That player's matchesPlayed increments by 1 in Player stats | Critical |
| TC-012.15 | Stats updated after a match — lifetime score | Play one full match as a saved player | The player's lifetimeScore reflects the score earned in that match | Critical |
| TC-012.16 | Stats updated after a match — impostor detected | Play as impostor and get voted out | timesDetectedAsImpostor increments; timesUndetectedAsImpostor stays the same | High |
| TC-012.17 | Stats updated after a match — impostor undetected | Play as impostor and avoid detection | timesUndetectedAsImpostor increments; timesDetectedAsImpostor stays the same | High |
| TC-012.18 | Stats updated after a match — guessed word | Play as impostor and guess the secret word correctly | timesGuessedWord increments by 1 | High |
| TC-012.19 | Stats updated after a match — civilian vote accuracy | Play as civilian and vote on impostors | civilianVotesCorrect and civilianVotesTotal both update correctly | High |
| TC-012.20 | Match recorded in history | Complete a full match | An entry appears at the top of Match history with the correct category, date, and player list | Critical |
| TC-012.21 | Match history capped at 20 | Play 21 full matches with saved players | Match history shows exactly 20 entries; the oldest entry is gone | High |
| TC-012.22 | Match history empty state | Open Match history before any match has been played | Empty-state message is shown ("No matches played yet") | Medium |
| TC-012.23 | Player stats empty state | Open Player stats before any player has been saved | Empty-state message is shown ("No saved players yet") | Medium |
| TC-012.24 | Player stats expand / collapse | Open Player stats, tap a player card | Detailed stats expand; tapping again collapses them | Medium |
| TC-012.25 | Match history accessible from sidebar | Open the sidebar menu from any screen | "Match history" option is present and opens the Match history screen | High |
| TC-012.26 | Player stats accessible from sidebar | Open the sidebar menu from any screen | "Player stats" option is present and opens the Player stats screen | High |

---

## Test Execution Tracking

| Test Case | Status | Notes | Bug ID |
|---|---|---|---|
| TC-001.1 | — | | |
| TC-001.2 | — | | |
| TC-001.3 | — | | |
| TC-001.4 | — | | |
| TC-001.5 | — | | |
| TC-001.6 | — | | |
| TC-001.7 | — | | |
| TC-001.8 | — | | |
| TC-001.9 | — | | |
| TC-002.1 | — | | |
| TC-002.2 | — | | |
| TC-002.3 | — | | |
| TC-002.4 | — | | |
| TC-002.5 | — | | |
| TC-002.6 | — | | |
| TC-002.7 | — | | |
| TC-002.8 | — | | |
| TC-002.9 | — | | |
| TC-002.10 | — | | |
| TC-002.11 | — | | |
| TC-002.12 | — | | |
| TC-012.1 | — | | |
| TC-012.2 | — | | |
| TC-012.3 | — | | |
| TC-012.4 | — | | |
| TC-012.5 | — | | |
| TC-012.6 | — | | |
| TC-012.7 | — | | |
| TC-012.8 | — | | |
| TC-012.9 | — | | |
| TC-012.10 | — | | |
| TC-012.11 | — | | |
| TC-012.12 | — | | |
| TC-012.13 | — | | |
| TC-012.14 | — | | |
| TC-012.15 | — | | |
| TC-012.16 | — | | |
| TC-012.17 | — | | |
| TC-012.18 | — | | |
| TC-012.19 | — | | |
| TC-012.20 | — | | |
| TC-012.21 | — | | |
| TC-012.22 | — | | |
| TC-012.23 | — | | |
| TC-012.24 | — | | |
| TC-012.25 | — | | |
| TC-012.26 | — | | |

*(Continue for all test plans before a release)*

---

## Test Coverage Summary

| Test Plan | Test Cases | Critical | High | Medium |
|---|---|---|---|---|
| 1 — Player Management | 9 | 0 | 7 | 2 |
| 2 — Game Configuration | 12 | 0 | 10 | 2 |
| 3 — Word & Category | 5 | 0 | 3 | 2 |
| 4 — Word Reveal | 5 | 3 | 2 | 0 |
| 5 — Question Rounds | 7 | 0 | 6 | 1 |
| 6 — Discussion | 5 | 0 | 2 | 3 |
| 7 — Voting | 8 | 2 | 6 | 0 |
| 8 — Results & Reveal | 7 | 3 | 4 | 0 |
| 9 — Scoring & End Game | 8 | 4 | 2 | 2 |
| 10 — Persistence & Resume | 3 | 1 | 2 | 0 |
| 11 — Internationalisation | 4 | 0 | 4 | 0 |
| 12 — History & Saved Players | 26 | 6 | 15 | 5 |
| **Total** | **99** | **19** | **63** | **17** |

---

## Automation Strategy

### Current Automated Coverage

All game and history logic is covered by the automated test suite:

**`__tests__/GameContext.test.tsx`**
- 56 unit tests — 100% pass rate
- Covers `GameContext` API surface: game configuration, word management, round navigation, player management, game creation, impostor identification, voting, scoring, audio, screen tracking, and state reset functions

**`__tests__/HistoryContext.test.tsx`**
- Covers `HistoryContext` API surface: hydration from AsyncStorage, persistence, `getSavedPlayerByName`, `deleteSavedPlayer`, `getAutoDeleteCandidates` (room check, fewest-matches ordering, createdAt tie-breaking), `commitAutoSave`, `updateSavedPlayerStats`, and `recordMatch` (prepend order, 20-entry cap)

Tests run with `npm test`; coverage report with `npm run test:coverage`

### Future Automation Targets

| Target | Tool | Priority |
|---|---|---|
| Component rendering and interaction | React Native Testing Library | Medium |
| Screen navigation and state transitions | React Native Testing Library | Medium |
| End-to-end gameplay flow | Detox | Low |

---

## Release Criteria

### Release Blockers (must pass 100%)
- All Critical manual test cases
- All 56 automated unit tests
- No crashes on devices running Android 7.0+

### Release Goals (must pass 95%)
- All High priority manual test cases
- No unresolved blocking UX issues

### Post-Release (iteration targets)
- All Medium priority manual test cases
- Automated coverage for component tests
