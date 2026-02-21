import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/**', 'cdk.out/**', '.aws-sam/**', 'outputs/**', '**/*.js', '**/*.d.ts']
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,js}'],
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'no-shadow': ['error', { builtinGlobals: false, hoist: 'functions' }],
      'object-curly-spacing': ['error', 'always']
    }
  },
  prettierRecommended
]
