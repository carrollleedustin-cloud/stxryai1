import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Coverage configuration
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/types/**',
    '!src/styles/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Module paths
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // Handle CSS imports (with CSS modules)
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    
    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    
    // Handle image imports
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/build/',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Verbose output
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  
  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',
  
  // Indicates whether each individual test should be reported during the run
  notify: false,
  
  // A preset that is used as a base for Jest's configuration
  preset: undefined,
  
  // Run tests from one or more projects
  projects: undefined,
  
  // Use this configuration option to add custom reporters to Jest
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
  
  // Automatically reset mock state between every test
  resetMocks: true,
  
  // Reset the module registry before running each individual test
  resetModules: false,
  
  // Automatically restore mock state between every test
  restoreMocks: true,
  
  // The root directory that Jest should scan for tests and modules within
  rootDir: '.',
  
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],
  
  // Allows you to use a custom runner instead of Jest's default test runner
  runner: 'jest-runner',
  
  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: [],
  
  // The number of seconds after which a test is considered as slow and reported as such in the results
  slowTestThreshold: 5,
  
  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  snapshotSerializers: [],
  
  // The test environment that will be used for testing
  testEnvironmentOptions: {},
  
  // Adds a location field to test results
  testLocationInResults: false,
  
  // The glob patterns Jest uses to detect test files
  testRegex: [],
  
  // This option allows the use of a custom results processor
  testResultsProcessor: undefined,
  
  // This option allows use of a custom test runner
  testRunner: 'jest-circus/runner',
  
  
  
  // A map from regular expressions to paths to transformers
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  unmockedModulePathPatterns: undefined,
  
  // Indicates whether each individual test should be reported during the run
  watchPathIgnorePatterns: [],
  
  // Whether to use watchman for file crawling
  watchman: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
