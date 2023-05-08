module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'linebreak-style': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'no-use-before-define': 'off',
    'class-methods-use-this': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'no-console': 'off',
    'react/no-unused-class-component-methods': 'off',
    'no-throw-literal': 'off',
    'consistent-return': 'off',
  },
};
