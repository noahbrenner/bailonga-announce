import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  prettierConfig,
  globalIgnores(["node_modules/", "dist/"]),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { disallowTypeAnnotations: false },
      ],
      "import/order": [
        "error",
        {
          alphabetize: { order: "asc", orderImportKind: "asc" },
        },
      ],
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: false },
      ],
    },
  },
  {
    files: ["eslint.config.mjs", "vite.config.ts"],
    rules: {
      "import/no-extraneous-dependencies": "off",
    }
  },
]);
