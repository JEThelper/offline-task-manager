// Mock expo-sqlite to avoid native module issues in tests
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
  openDatabaseSync: jest.fn(),
}));

// Mock expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest
    .fn()
    .mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  addNetworkStateListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));
