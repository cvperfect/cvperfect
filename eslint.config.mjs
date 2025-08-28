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
  // Środowisko Node dla backendu / skryptów / testów / utilities / config files
  {
    files: [
      "pages/api/**/*.{js,mjs}",
      "lib/**/*.{js,mjs}",
      "scripts/**/*.{js,mjs}",
      "tests/**/*.{js,mjs}",
      "utils/**/*.{js,mjs}",
      "cli-*.js",
      "**/test-*.js", 
      "mcp-*.js",
      "*puppeteer*.js",
      "start-*.js",
      "*.config.js"
    ],
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
  // React components and pages that need process.env access
  {
    files: [
      "components/PerformanceMonitor.js",
      "pages/_app.js",
      "pages/privacy-policy.js", 
      "pages/performance.js"
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly"
      }
    }
  },
  { rules: { "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], "no-undef": "warn" } }
];