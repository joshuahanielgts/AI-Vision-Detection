// @ts-check

import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // Removing strictTypeChecked - it's too verbose and often flags correct code
      // ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylistic,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        React: "readonly",
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          tsconfigRootDir: import.meta.dirname,
        },
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,

      // Import rules - keep essential, downgrade noisy ones to warnings
      "import/no-unresolved": "error",
      "import/named": "warn", // Downgraded to warning
      "import/default": "warn", // Downgraded to warning
      "import/export": "error",
      "import/no-duplicates": "warn", // Added: warn on duplicate imports

      // React Refresh
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript
      "@typescript-eslint/no-unused-vars": "off",

      // Tailwind-friendly rules
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            "class", // For Tailwind class merging libraries
            "css", // For CSS-in-JS solutions
            "tw", // For twin.macro or similar
            "args",
            "position",
            "intensity",
            "rotation",
            "vertexShader",
            "fragmentShader",
            "uniforms",
            "side",
            "cmdk-input-wrapper", // Add shadcn command component property
          ],
        },
      ],

      // Turn off rules that are too strict
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Warning instead of off
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/require-await": "warn", // Warning instead of off

      // React specific
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "warn", // Added: security warning for _blank
      "react/jsx-key": ["warn", { checkFragmentShorthand: true }], // Added: better key warnings
      "react/no-unescaped-entities": "off",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
