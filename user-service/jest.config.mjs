// jest.config.mjs
export default {
  testEnvironment: "node",
  transform: {},
  verbose: true,
  testMatch: ["**/src/tests/**/*.test.js"],
  modulePathIgnorePatterns: [
    "<rootDir>/src/repositories/stg",
    "<rootDir>/src/repositories/prod"
  ]
};
