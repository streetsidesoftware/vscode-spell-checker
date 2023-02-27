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
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    ignorePatterns: ['**/*.d.ts', '**/node_modules/**', 'packages/client/server/**', 'packages/*/dist/**', '**/temp/**'],
    plugins: ['import', 'unicorn', 'simple-import-sort'],
    rules: {
        'node/no-unsupported-features/es-syntax': 'off',
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        quotes: ['warn', 'single', { avoidEscape: true }],

        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
        'node/no-missing-import': [
            'error',
            {
                allowModules: ['vscode'],
                tryExtensions: ['.js', '.d.ts', '.ts'],
            },
        ],
        'node/no-unpublished-import': 'off',
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.mts'],
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
        },
        {
            files: ['*.json'],
            rules: {
                quotes: ['error', 'double'],
            },
        },
    ],
    settings: {
        'import/core-modules': ['vscode'],
    },
};

module.exports = config;
