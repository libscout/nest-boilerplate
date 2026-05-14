module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  testTimeout: 60000,
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@src/(.*)": "<rootDir>/$1",
    "^@test/(.*)": "<rootDir>/../test/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/../test/setup.ts"],
};
