import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  collectCoverage: true,
  coverageReporters: ["text"],
  coverageThreshold: {
    global: {
      statements: 80,
    },
  },
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  transform: { "^.+.ts$": "ts-jest" },
  verbose: true,
};

export default config;
