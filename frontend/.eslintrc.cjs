module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json']
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  env: {
    es2022: true,
    browser: true,
    node: true
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
};

