const expoConfig = require('eslint-config-expo/flat.js');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  ...expoConfig,
  prettierRecommended,
  {
    rules: {
      'prettier/prettier': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
