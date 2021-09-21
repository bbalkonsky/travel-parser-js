export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: ['dotenv/config'],
    testMatch: ['<rootDir>/**/*.spec.ts'],
    coverageDirectory: './coverage'
};
