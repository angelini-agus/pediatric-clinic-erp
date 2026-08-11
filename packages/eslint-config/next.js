// @ts-check
const baseConfig = require('./index');

/** @type {import('eslint').Linter.Config[]} */
const nextConfig = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Next.js allows default exports for pages and layouts
      'import/no-default-export': 'off',
      // React Server Components use async functions at component level
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    // Allow default exports in Next.js special files
    files: [
      'app/**/*.tsx',
      'app/**/*.ts',
      'pages/**/*.tsx',
      'next.config.*',
      'tailwind.config.*',
      'postcss.config.*',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },
];

module.exports = nextConfig;
