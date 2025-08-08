import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/tests/integration/**/*.test.ts'],
  // setupFilesAfterEnv: ['<rootDir>/src/tests/global.ts'], // if you have setup
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  verbose: true,
};

export default config;
