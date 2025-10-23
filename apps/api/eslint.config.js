import baseConfig from '../../configs/eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    ignores: ['dist', 'node_modules'],
  },
];
