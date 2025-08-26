import js from "@eslint/js";

export default [
  { ignores: ["**/.claude/**","tests/**","scripts/**","test-*.js",".next/**",".eslintrc.js","tailwind.config.js"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true }
    }
  },
  {
    files: ["components/**/*.{js,jsx}","pages/**/*.{js,jsx}"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly"
      }
    }
  },
  {
    files: ["pages/api/**/*.{js,mjs}","lib/**/*.{js,mjs}","scripts/**/*.{js,mjs}","tests/**/*.{js,mjs}","cli-*.js","**/test-*.js"],
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