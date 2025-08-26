import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: [".claude/**", "tests/**", "scripts/**", "test-*.js"],
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "warn"
    }
  }
];