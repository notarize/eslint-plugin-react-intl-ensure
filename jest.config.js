module.exports = {
  moduleDirectories: ["<rootDir>/src", "<rootDir>/node_modules"],
  moduleFileExtensions: ["ts", "json", "js"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
