/* eslint-disable n/no-unpublished-import */
// @ts-check

import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from 'typescript-eslint';

// mimic CommonJS variables -- not needed if using CommonJS
// import { FlatCompat } from "@eslint/eslintrc";
// const __dirname = fileURLToPath(new URL('.', import.meta.url));
// const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: eslint.configs.recommended});

export default tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    eslintPluginPrettierRecommended,
    ...tsEslint.configs.recommended,
    {
        ignores: [
            '.github/**/*.yaml',
            '.github/**/*.yml',
            '**/__snapshots__/**',
            '**/.vscode-test/**',
            '**/.yarn/**',
            '**/*.d.ts',
            '**/build/**',
            '**/coverage/**',
            '**/dist/**',
            '**/fixtures/**',
            '**/fixtures/**/*.js',
            '**/node_modules/**',
            '**/scripts/ts-json-schema-generator.cjs',
            '**/temp/**',
            '**/webpack*.js',
            'package-lock.json',
            'packages/*/dist/**',
            'packages/*/out/**',
            'packages/client/server/**',
        ],
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        files: ['**/*.{ts,cts,mts,tsx}'],
        rules: {
            // Note: you must disable the base rule as it can report incorrect errors
            'no-unused-vars': 'off',
            '@typescript-eslint/consistent-type-imports': ['error'],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'n/no-missing-import': [
                'off', // disabled because it is not working correctly
                {
                    tryExtensions: ['.d.ts', '.d.mts', '.d.cts', '.ts', '.cts', '.mts', '.js', '.cjs', '.mjs'],
                },
            ],
        },
    },
    {
        files: ['**/*.test.*', '**/__mocks__/**', '**/test/**', '**/test.*', '**/rollup.config.mjs', '**/build.mjs'],
        rules: {
            'n/no-extraneous-require': 'off', // Mostly for __mocks__ and test files
            'n/no-extraneous-import': 'off',
            'n/no-unpublished-import': 'off',
            '@typescript-eslint/no-explicit-any': 'off', // any is allowed in tests
        },
    },
    {
        files: ['**/jest.config.*', '**/__mocks__/**'],
        rules: {
            'n/no-extraneous-require': 'off',
            'no-undef': 'off',
        },
    },
);
