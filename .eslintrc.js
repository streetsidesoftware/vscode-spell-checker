module.exports = {
  env: {
    node: true,
    jest: true,
    es2017: true,
  },
  parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  parserOptions: {
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
  },
  ignorePatterns: [
    '**/*.d.ts',
    '**/node_modules/**'
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    'quotes': [ 'warn', 'single', { 'avoidEscape': true } ],

    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [ 'warn', { ignoreRestSiblings: true, argsIgnorePattern: '^_' } ],
  },
  overrides: [
    {
      files: ['*.json'],
      rules: {
        'quotes': [ 'error', 'double' ],
      }
    }
  ],
};
