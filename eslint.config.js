import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    extends: [eslint.configs.recommended, ...tseslint.configs.strictTypeChecked],
  },
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Relax strict type-checked rules for test files (Vitest + RTL patterns)
  {
    files: ['test/**/*.ts', 'test/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/await-thenable': 'off',
    },
  },
  // Relax strict type-checked rules for E2E tests (Playwright API patterns)
  {
    files: ['e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    ignores: ['dist/**', 'demo/dist/**', 'node_modules/**', '*.config.*', 'demo/vite.config.ts'],
  },
);
