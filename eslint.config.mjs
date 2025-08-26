import js from "@eslint/js";

export default [
  { ignores: ["**/.claude/**","tests/**","scripts/**","test-*.js",".next/**",".eslintrc.js","tailwind.config.js"] },
  js.configs.recommended,
  { rules: { "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], "no-undef": "warn" } }
];