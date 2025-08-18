import '@testing-library/jest-native/extend-expect';

// Global test timeout
jest.setTimeout(10000);

// Mock expo modules that might cause issues
jest.mock('expo-constants', () => ({
  default: {
    statusBarHeight: 20,
  },
}));

// Mock react-native-uuid if it causes issues
jest.mock('react-native-uuid', () => ({
  v4: () => 'mocked-uuid-v4',
}));