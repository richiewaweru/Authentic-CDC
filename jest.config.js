module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@miblanchard/react-native-slider$':
      '<rootDir>/__mocks__/@miblanchard/react-native-slider.tsx',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
