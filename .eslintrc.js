/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    root: true,
    reportUnusedDisableDirectives: true,
    env: {
        node: true,
        jest: true,
        es2020: true,
    },
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    extends: [
        'eslint:recommended',
        'plugin:node/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:promise/recommended',
        'plugin:prettier/recommended',
        // 'plugin:unicorn/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    ignorePatterns: [
        '**/*.d.ts',
        '**/node_modules/**',
        'packages/client/server/**',
        'packages/*/dist/**',
        'packages/*/out/**',
        '**/temp/**',
        '**/dist/**',
        'packages/client/settingsViewer/**',
    ],
    plugins: ['import', 'unicorn', 'simple-import-sort'],
    rules: {
        'node/no-unsupported-features/es-syntax': 'off',
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        quotes: ['warn', 'single', { avoidEscape: true }],

        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'node/no-missing-import': [
            'error',
            {
                allowModules: ['vscode'],
                tryExtensions: ['.js', '.d.ts', '.ts'],
            },
        ],
        'node/no-unpublished-import': 'off',
        'promise/catch-or-return': ['error', { terminationMethod: ['catch', 'finally'] }],
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.mts', '**/*.cts'],
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                // '@typescript-eslint/no-use-before-define': 'off',
                '@typescript-eslint/no-empty-interface': 'off',
                '@typescript-eslint/no-inferrable-types': 'off',
                '@typescript-eslint/no-empty-function': 'off',
                // '@typescript-eslint/no-non-null-assertion': 'off',
                // '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
                'node/no-missing-import': 'off',
                'import/no-unresolved': 'off',
            },
        },
        {
            files: ['*.json'],
            rules: {
                quotes: ['error', 'double'],
            },
        },
        {
            files: ['**/*.js', '**/*.mjs'],
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
            rules: {
                'node/no-unsupported-features/es-syntax': 'off',
            },
        },
        {
            files: ['**/*.test.*', '**/__mocks__/**', '**/test/**', '**/test.*', '**/rollup.config.mjs'],
            rules: {
                'node/no-extraneous-import': 'off',
            },
        },
        {
            files: ['vitest.config.*'],
            rules: {
                'node/no-extraneous-import': 'off',
                'import/no-unresolved': 'off',
            },
        },
        {
            files: ['**/jest.config.js', '**/*.test.*'],
            rules: {
                'node/no-unpublished-require': 'off',
            },
        },
    ],
    settings: {
        'import/core-modules': ['vscode'],
    },
};

module.exports = config;
