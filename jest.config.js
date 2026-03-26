const path = require('path');
const ts = require('typescript');
const { pathsToModuleNameMapper } = require('ts-jest');

const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const { config } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

// Align Jest resolution with tsconfig paths (Jest resolves before ts-jest transform).
// Exclude `react` → @types/react — tests must resolve the real `react` package.
const tsPaths = { ...(config.compilerOptions?.paths || {}) };
delete tsPaths.react;
const fromTsconfigPaths = pathsToModuleNameMapper(tsPaths, {
  prefix: '<rootDir>/',
});

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  setupFiles: ['dotenv/config'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom', //initial was testEnvironment: 'node', using jsdom
  rootDir: '.',
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@background/index$': '<rootDir>/src/background/test-compat/index.ts',
    '^@background/account$':
      '<rootDir>/src/background/hive/modules/account.module.ts',
    '^@background/(mk|ledger|claim|hive-engine-config|local-storage|autolock|rpc|settings|multisig)\\.module$':
      '<rootDir>/src/background/hive/modules/$1.module.ts',
    '^@background/utils/accounts\\.utils$':
      '<rootDir>/src/background/hive/utils/accounts.utils.ts',
    '^@background/requests/request-handler$':
      '<rootDir>/src/background/test-compat/requests/request-handler.ts',
    '^src/background/requests/request-handler(?:\\.ts)?$':
      '<rootDir>/src/background/test-compat/requests/request-handler.ts',
    '^@background/requests/dialog-lifecycle$':
      '<rootDir>/src/background/test-compat/requests/dialog-lifecycle.ts',
    '^src/background/requests/dialog-lifecycle(?:\\.ts)?$':
      '<rootDir>/src/background/test-compat/requests/dialog-lifecycle.ts',
    '^@background/requests/init$':
      '<rootDir>/src/background/test-compat/requests/init.ts',
    '^src/background/requests/init(?:\\.ts)?$':
      '<rootDir>/src/background/test-compat/requests/init.ts',
    '^@background/requests/logic(?:/.*)?$':
      '<rootDir>/src/background/test-compat/requests/logic.ts',
    '^src/background/requests/logic(?:/.*)?(?:\\.ts)?$':
      '<rootDir>/src/background/test-compat/requests/logic.ts',
    '^@background/requests/operations$':
      '<rootDir>/src/background/test-compat/requests/operations.ts',
    '^@background/requests/operations/index$':
      '<rootDir>/src/background/test-compat/requests/operations.ts',
    '^src/background/requests/operations/index(?:\\.ts)?$':
      '<rootDir>/src/background/test-compat/requests/operations.ts',
    '^@background/requests/operations/operations\\.utils$':
      '<rootDir>/src/background/hive/requests/operations/operations.utils.ts',
    '^src/background/requests/operations/operations\\.utils(?:\\.ts)?$':
      '<rootDir>/src/background/hive/requests/operations/operations.utils.ts',
    '^@background/requests/operations/ops/(.*)$':
      '<rootDir>/src/background/hive/requests/operations/ops/$1.ts',
    '^src/background/requests/operations/ops/(.*)\\.ts$':
      '<rootDir>/src/background/hive/requests/operations/ops/$1.ts',
    '^src/content-scripts/web-interface/response\\.logic(?:\\.ts)?$':
      '<rootDir>/src/content-scripts/hive/web-interface/response.logic.ts',
    '^src/content-scripts/keychainify/keychainify(?:\\.ts)?$':
      '<rootDir>/src/content-scripts/hive/keychainify/keychainify.ts',
    ...fromTsconfigPaths,
    '^axios$': 'axios/dist/node/axios.cjs',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '@ledgerhq/devices/hid-framing': '@ledgerhq/devices/lib/hid-framing',
  },
  modulePaths: ['<rootDir>'],
  collectCoverageFrom: ['<rootDir>/**/*.{ts, tsx}'],
  collectCoverage: false,
  modulePathIgnorePatterns: [
    '<rootDir>/src/__tests__/utils-for-testing/',
    'mocks',
    'othercases',
  ],
  //until here
  //working configuration until here E2E/utils/actions tests.

  //added new config for background section
  setupFilesAfterEnv: ['./jest.setup.js'], //only for jest-chrome
  //end added
};
