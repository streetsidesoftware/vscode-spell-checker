// @ts-check

import eslint from '@eslint/js';
import nodePlugin from 'eslint-plugin-n';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsEslint from 'typescript-eslint';
import globals from 'globals';

// mimic CommonJS variables -- not needed if using CommonJS
// import { FlatCompat } from "@eslint/eslintrc";
// const __dirname = fileURLToPath(new URL('.', import.meta.url));
// const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: eslint.configs.recommended});

export default tsEslint.config(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended'],
    tsEslint.configs.strictTypeChecked,
    tsEslint.configs.stylisticTypeChecked,
    tsEslint.configs.recommendedTypeChecked,
    { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.url } } },
    {
        ignores: [
            '.github/**/*.yaml',
            '.github/**/*.yml',
            '**/__snapshots__/**',
            '**/__mocks__/**',
            '**/.vscode-test/**',
            '**/.yarn/**',
            '**/*.d.ts',
            '**/build/**',
            '**/coverage/**',
            '**/dist/**',
            '**/fixtures/**',
            '**/fixtures/**/*.js',
            '**/node_modules/**',
            '**/out/**',
            '**/scripts/ts-json-schema-generator.cjs',
            '**/tsdown.config.*',
            '**/temp/**',
            '**/webpack*.js',
            '**/*.json',
            'package-lock.json',
            'packages/*/dist/**',
            'packages/*/out/**',
            'packages/client/server/**',
            'website/.docusaurus/**',
            'website/**',
            'website/build/**',
            'website/node_modules/**',
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
        languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.node } },
        files: ['**/*.{ts,cts,mts,tsx}'],
        rules: {
            // Note: you must disable the base rule as it can report incorrect errors
            'no-unused-vars': 'off',
            '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: false }],
            '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports', prefer: 'type-imports' }],
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': 'off', // 'warn'
            '@typescript-eslint/no-unnecessary-type-parameters': 'off', // warn
            '@typescript-eslint/no-unnecessary-condition': 'off', // 'warn'
            '@typescript-eslint/restrict-template-expressions': 'off',
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
            '@typescript-eslint/prefer-literal-enum-member': 'off',
            'n/no-missing-import': [
                'off', // disabled because it is not working correctly
                {
                    tryExtensions: ['.d.ts', '.d.mts', '.d.cts', '.ts', '.cts', '.mts', '.js', '.cjs', '.mjs'],
                },
            ],
        },
    },
    {
        files: [
            '**/__mocks__/**',
            '**/*.test.*',
            '**/build.mjs',
            '**/rollup.config.mjs',
            '**/test.*',
            '**/test/**',
            '**/tsdown.config.*',
            '**/tsup.config.*',
        ],
        rules: {
            'n/no-extraneous-require': 'off', // Mostly for __mocks__ and test files
            'n/no-extraneous-import': 'off',
            'n/no-unpublished-import': 'off',
            '@typescript-eslint/no-dynamic-delete': 'off', // useful for tests
            '@typescript-eslint/no-explicit-any': 'off', // any is allowed in tests
            '@typescript-eslint/no-unsafe-argument': 'off', // useful for tests
            '@typescript-eslint/no-unsafe-assignment': 'off', // useful for tests
            '@typescript-eslint/no-unsafe-call': 'off', // useful for tests
            '@typescript-eslint/no-unsafe-return': 'off', // useful for tests
            '@typescript-eslint/no-useless-constructor': 'off', // useful for tests
        },
    },
    {
        files: ['**/jest.config.*', '**/__mocks__/**'],
        rules: {
            'n/no-extraneous-require': 'off',
            'no-undef': 'off',
        },
    },
    {
        files: ['**/*.json'],
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
        },
    },
);
