import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.stitchguard/**', 'scripts/**'],
  },
  {
    files: ['packages/web-demo/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        Image: 'readonly',
        ImageData: 'readonly',
        createImageBitmap: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
  {
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
