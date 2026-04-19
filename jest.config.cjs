/** @type {import('jest').Config} */
module.exports = {
  displayName: "@fiap-13soat/work-order-service",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      {
        configFile: ".spec.swcrc",
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/main/**",
    "!src/**/*.spec.ts",
    "!src/**/*.d.ts",
    "!src/infra/observability/**",
    "!src/infra/db/prisma-client.ts",
    "!src/infra/db/types/**",
    "!src/**/index.ts",
    "!src/infra/messaging/sqs-event-consumer.ts",
    "!src/generated/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
