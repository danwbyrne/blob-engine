const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname),
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
    }
  },
  testEnvironment: "node",
  testURL: "http://localhost/",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testPathIgnorePatterns: ['/node_modules'],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "testMatch": [
    "**/*.spec.+(ts|tsx)"
  ]
}
