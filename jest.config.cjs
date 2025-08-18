module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.js$': 'babel-jest' },
  moduleFileExtensions: ['js'],
  roots: ['<rootDir>/__tests__'],
  collectCoverageFrom: ['src/js/**/*.js'],
};
