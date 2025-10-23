import baseConfig from './eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react': 'eslint-plugin-react',
      'react-hooks': 'eslint-plugin-react-hooks',
      'jsx-a11y': 'eslint-plugin-jsx-a11y',
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
