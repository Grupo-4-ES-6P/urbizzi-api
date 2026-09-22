import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.spec.json",
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!src/**/infra/schemas/*.ts",
  ],
  testEnvironment: "node",
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  },
};

export default config;
