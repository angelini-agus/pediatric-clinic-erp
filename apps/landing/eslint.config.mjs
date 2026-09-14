// @ts-check
import nextConfig from '@pediatric-erp/eslint-config/next';

/**
 * ESLint flat config de la landing (Astro + islas React).
 * Los archivos `.astro` no se lintean acá (los cubre `astro check`);
 * esta config aplica a los componentes `.ts`/`.tsx`.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...nextConfig,
  {
    ignores: ['**/.astro/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
