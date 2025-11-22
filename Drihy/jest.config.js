module.exports = {
  testEnvironment: "jsdom",

  testMatch: [
    "**/tests/unit/**/*.test.js",
    "**/tests/integration/**/*.test.js"
  ],

  collectCoverage: true,

  collectCoverageFrom: [
    "js/**/*.js",
    "!tests/**",
    "!coverage/**",
    "!node_modules/**"
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  transform: {
    "^.+\\.js$": "babel-jest"
  },

  transformIgnorePatterns: ["/node_modules/"]
};
