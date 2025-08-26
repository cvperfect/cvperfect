import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["**/.claude/**","tests/**","scripts/**","test-*.js",".next/**",".eslintrc.js","tailwind.config.js"] },
  js.configs.recommended,
  // Domyślnie: JSX + globals przeglądarkowe (setTimeout, Blob, console, itp.)
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser }
    }
  },
  // Środowisko Node dla backendu / skryptów / testów
  {
    files: ["pages/api/**/*.{js,mjs}","lib/**/*.{js,mjs}","scripts/**/*.{js,mjs}","tests/**/*.{js,mjs}","cli-*.js","**/test-*.js","mcp-*.js","*puppeteer*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.es2021 }
    }
  },
  {
    files: ["cli-tools-manager.js","test-*.js","tests/**/*.{js,mjs}","scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    }
  },
  { rules: { "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], "no-undef": "warn" } }
];