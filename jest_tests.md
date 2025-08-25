# Jest Automated Tests Documentation

## Overview
This project includes automated tests using Jest and React Native Testing Library to ensure the game logic functions correctly. The tests focus on validating the GameContext functionality, which manages the core game state and operations.

## Test Coverage

### File Tested: `GameContext.test.tsx`
Location: `__tests__/GameContext.test.tsx`

### Test Categories

#### ✅ **Core Game State Management (12 tests passing)**
- **Initial State**: Validates default game initialization
- **Maximum Matches**: Tests setting game match limits
- **Match Progression**: Tests incrementing match counter
- **Round Navigation**: Tests moving between game rounds (next/previous)
- **Player Management**: Tests adding/updating players and their scores
- **Word Management**: Tests random word selection and word setting
- **Game Creation**: Tests new game setup and game reset functionality

#### ✅ **Voting System (4 tests passing)**  
- **Vote Recording**: Tests adding votes to the game state
- **Correct Vote Scoring**: Tests awarding 3 points for identifying the lying player
- **Secret Word Scoring**: Tests awarding 2 points for correct secret word guesses
- **Incorrect Vote Handling**: Tests that no points are awarded for wrong votes

#### ✅ **Context Provider (1 test passing)**
- **Method Availability**: Ensures all required game methods are accessible through the context

#### ✅ **Edge Cases - Partial Coverage (1/3 tests passing)**
- **Negative Points**: ✅ Successfully handles negative score scenarios
- **Empty Players Array**: ❌ Currently fails - needs error handling improvement
- **Single Player Game**: ❌ Currently fails - needs edge case handling

## Test Results Summary

**Total Tests**: 22  
**Passing**: 20 tests ✅  
**Failing**: 2 tests ❌  
**Success Rate**: 91%

## Failed Tests Analysis

### 1. Empty Players Array Test
**Error**: `Cannot read properties of undefined (reading 'en')`  
**Location**: `context/GameContext.tsx:104`  
**Issue**: The game creation logic doesn't handle cases where no category is set before creating a game with empty players.

### 2. Single Player Game Test  
**Error**: `Cannot read properties of undefined (reading 'en')`  
**Location**: `context/GameContext.tsx:104`  
**Issue**: Same root cause as above - missing category validation before game creation.

## Testing Framework & Libraries
- **Jest**: JavaScript testing framework
- **React Native Testing Library**: For React Native component testing
- **Testing utilities**: Custom helper functions for test setup

## Future Improvements
The failing tests highlight areas for code enhancement:
1. Better error handling for edge cases
2. Input validation before game creation
3. Graceful handling of missing or invalid categories

These tests serve as both quality assurance and documentation of expected behavior, helping maintain code reliability as the project evolves.