# Who Is Lying - Test Plans & QA Documentation

## 🧪 Testing Overview

This document outlines comprehensive testing strategies and test cases for the "Who Is Lying" React Native party game. Testing covers functional requirements, performance benchmarks, usability standards, and edge case scenarios.

---

## 📋 Test Strategy

### Testing Approach

- **Manual Testing**: Primary method for UI/UX and gameplay flow
- **Automated Testing**: Unit tests for business logic and state management
- **Regression Testing**: CI/CD integration with the set of tests

---

## 🧪 Test Plans

## Test Plan 1: Player Management Testing

| Test Case | Steps                               | Expected Result                         | Priority |
| --------- | ----------------------------------- | --------------------------------------- | -------- |
| TC-001.1  | Add valid player name               | Name added to player list               | High     |
| TC-001.2  | Add Player Name at Character Limits           | 1 character and 15 character names accepted and added to list  | High     |
| TC-001.3  | Add duplicate Player Names    | Name accepted or appropriate validation | Medium   |
| TC-001.4  | Remove Player from list | Selected Player successfully deleted from the list     | High     |
| TC-001.5  | Try to add 11th player              | Disabled add functionality, player limit enforced    | High     |


---

## Test Plan 2: Game Setup Testing

| Test Case | Steps                             | Expected Result                    | Priority |
| --------- | --------------------------------- | ---------------------------------- | -------- |
| TC-002.1  | Start Game with Minimum Players (3)         | One impostor assigned randomly, all 3 players are included in the game     | High |
| TC-002.2  | Start Game with Maximum Players (10)      |   One impostor assigned randomly, all 3 players are included in the game     | High |
| TC-002.3  | Attempt Start Game with Insufficient Players           | system prevents game start with less than minimum required players        | High |

## Test Plan 3: Game Flow

| Test Case | Steps                 | Expected Result                      | Priority |
| --------- | --------------------- | ------------------------------------ | -------- |
| TC-003.1  | Complete Full Game Round - Basic Flow     | Complete game flow from start to finish with minimal players   | Critical     |
| TC-003.2  | Impostor Assignment Randomization   | Impostor is randomly assigned and changes between games              | Medium     |

---

## 📊 Test Execution & Tracking

### Test Metrics

- **Total Test Cases**: 10+
- **Critical Priority**: 1 test cases
- **High Priority**: 7 test cases  
- **Medium Priority**: 2 test cases
- **Low Priority**: 0 test cases

### Coverage Areas

- ✅ **Player Management**: 5 test cases
- ✅ **Game Setup**: 3 test cases
- ✅ **Game Flow**: 2 test cases


### Test Execution Tracking Template

| Test Case | Status | Executed By | Date | Notes | Bug ID |
|-----------|--------|-------------|------|-------|--------|
| TC-001.1  | Pass   | Tester Name | Date | -     | -      |
| TC-001.2  | Fail   | Tester Name | Date | Error message unclear | BUG-001 |

## 🔄 Test Automation Strategy - ToDo

### Automated Test Coverage

**Unit Tests** (Target: 80% code coverage)
- Game logic functions
- State management operations
- Utility functions
- Data validation

**Integration Tests**
- Component interactions
- State transitions

**End-to-End Tests**
- Complete game flow
- Player management
- Win/lose scenarios

### Automation Tools

- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing
- **Detox**: End-to-end testing
- **Flipper**: Performance monitoring

---

## 📈 Success Criteria

### Release Readiness Criteria

**Must Have (Release Blockers)**
- Zero critical bugs
- All high priority test cases pass
- Performance targets met
- Core functionality working

**Should Have (Release Goals)**  
- All medium priority test cases pass
- UI polish complete
- Edge cases handled
- Documentation complete

**Could Have (Post-Release)**
- All low priority test cases pass
- Advanced features tested
- Extended device compatibility
- Performance optimizations

### Quality Gates

1. **Alpha Release**: 90% critical tests pass
2. **Beta Release**: 95% critical + high tests pass  
3. **Production Release**: 100% critical tests, 95% high tests pass

---

## 📋 Test Reports Template

### Daily Test Report

**Date**: [Date]

**Tester**: [Name]

**Build Version**: [Version]

**Test Execution Summary**
- Tests Planned: X
- Tests Executed: Y  
- Tests Passed: Z
- Tests Failed: A
- Tests Blocked: B

**New Bugs Found**: [Count]
**Bugs Fixed**: [Count]  
**Bugs Retested**: [Count]

**Risk Assessment**: [High/Medium/Low]
**Release Recommendation**: [Go/No-Go]