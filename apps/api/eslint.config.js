// @ts-check
const nestConfig = require('@pediatric-erp/eslint-config/nest');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...nestConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
];
