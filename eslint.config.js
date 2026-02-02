import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jquery,
        ...globals.webextensions,
      },
    },
    rules: {
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'no-console': 'warn',
      'no-var': 'warn',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'semi': ['error', 'never'],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'app/', 'src/**/*.ts'],
  },
]
