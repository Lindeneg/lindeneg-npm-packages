module.exports = {
  roots: ["<rootDir>"],
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
