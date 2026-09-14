// @ts-check
const baseConfig = require('@pediatric-erp/eslint-config');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  {
    ignores: ['**/.astro/**', '**/.next/**', '**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['apps/api/**/*.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}', 'apps/landing/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
];
