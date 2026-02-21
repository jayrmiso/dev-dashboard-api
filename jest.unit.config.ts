module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lambdas/src'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '.*\\.it\\.spec\\.ts$'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: { ignoreCodes: [151002] }
      }
    ]
  }
}
