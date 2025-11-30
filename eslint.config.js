// @ts-check

import tseslint from "typescript-eslint";
import js from "@eslint/js";

export default [
    // Base JS recommended rules
    js.configs.recommended,

    // TypeScript recommended rules
    ...tseslint.configs.recommended,

    // Project-wide overrides for TypeScript files
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Common TS rules you probably want
            "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },

    // Ignore build directories and other files
    {
        ignores: [
            "sample-development/**",
            "node_modules/**",
            "dist/**",
            "build/**"
        ]
    }
];