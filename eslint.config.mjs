import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Source asset pack (read-only input, contains a standalone asset browser).
    "212-chicken-assets/**",
    // Archived, unwired experiments (see experiments/*/README.md).
    "experiments/**",
    // Generated runtime copies and test artefacts.
    "public/212/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
