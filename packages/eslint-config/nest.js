// @ts-check
const baseConfig = require('./index');

/** @type {import('eslint').Linter.Config[]} */
const nestConfig = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      // NestJS decorators require classes — allow them
      '@typescript-eslint/no-extraneous-class': 'off',

      // NestJS patterns commonly use parameter decorators
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Allow empty constructors (DI injection pattern)
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['constructors'] },
      ],

      // NestJS modules use decorators that can look like "unused" class members
      '@typescript-eslint/no-extraneous-class': 'off',

      // allow explicit any in extreme cases inside NestJS guards/filters
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];

module.exports = nestConfig;
