module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:typescript-sort-keys/recommended',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {},
  plugins: ['@typescript-eslint', 'typescript-sort-keys'],
  root: true,
};
