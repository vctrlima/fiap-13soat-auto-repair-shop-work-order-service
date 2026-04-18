/* eslint-disable */
const { readFileSync } = require("fs");

const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, "utf-8"),
);
swcJestConfig.swcrc = false;

module.exports = {
  displayName: "@fiap-13soat-auto-repair-shop/work-order-e2e",
  globalSetup: "<rootDir>/src/support/global-setup.ts",
  setupFiles: ["<rootDir>/src/support/test-setup.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/tests/**/*.spec.ts"],
  transform: {
    "^.+\\.[tj]s$": ["@swc/jest", swcJestConfig],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  testTimeout: 60000,
};
