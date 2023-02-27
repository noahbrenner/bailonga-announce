/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
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
  },
};
