module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  env: {
    node: true,
  },
  ignorePatterns: ["lib/*"],
  rules: {
    "@typescript-eslint/no-namespace": [2, { allowDeclarations: true }],
  },
};
