const base = require('./jest.config');

module.exports = {
  ...base,
  testEnvironment: 'node',
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ['/node_modules/'],
};
