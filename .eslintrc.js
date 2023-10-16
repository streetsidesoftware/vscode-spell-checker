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
        '**/build/**',
        'package-lock.json',
        '**/scripts/ts-json-schema-generator.cjs',
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
            // Note: this doesn't really work with pure ESM modules
            'error',
            {
                allowModules: ['vscode'],
                tryExtensions: ['.js', '.d.ts', '.ts', '.cts', '.mts', '.cjs', '.mjs'],
            },
        ],
        // 'node/no-unpublished-import': 'off',
        'promise/catch-or-return': ['error', { terminationMethod: ['catch', 'finally'] }],
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx'],
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            rules: {
                'no-restricted-modules': 'error',
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
                // This is caught by 'import/no-unresolved'
                'node/no-missing-import': [
                    'off',
                    {
                        tryExtensions: ['.js', '.d.ts', '.ts'],
                    },
                ],
                'node/no-unsupported-features/es-syntax': 'off',
                'import/no-unresolved': 'off',
                '@typescript-eslint/consistent-type-imports': 'error',
                '@typescript-eslint/no-empty-interface': 'off',
                '@typescript-eslint/no-non-null-assertion': 'error',
                // 'import/order': 'error',
                'simple-import-sort/imports': 'error',
                'simple-import-sort/exports': 'error',
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
            files: ['packages/client/**/*.test.ts', 'packages/client/**/*.spec.ts'],
            excludedFiles: [],
            extends: 'plugin:jest/recommended',
            env: {
                jest: true,
            },
            rules: {
                'jest/valid-title': 'warn',
            },
        },
        {
            files: [
                'vitest.config.*',
                '**/jest.config.js',
                '**/jest.config.ts',
                '**/*.test.*',
                '**/build.*',
                '**/test/**',
                '**/rollup.config.js',
            ],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                'import/no-unresolved': 'off',
                'node/no-extraneous-import': 'off',
                'node/no-unpublished-import': 'off',
                'node/no-unpublished-require': 'off',
            },
        },
        {
            files: ['**/disposable.test.ts'],
            rules: {
                // Must turn it off to prevent parsing error.
                'no-var': 'off',
            },
        },
    ],
    settings: {
        'import/core-modules': ['vscode'],
    },
};

module.exports = config;
