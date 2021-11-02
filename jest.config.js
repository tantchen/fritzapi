module.exports = {
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
        outputPath: './docs/test/index.html',
      },
    ],
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
