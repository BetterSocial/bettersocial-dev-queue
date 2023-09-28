module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    },
    {
      env: {
        node: true,
        es2021: true,
        'jest/globals': true
      },
      files: ['__tests__/**/*.js'],
      extends: ['eslint:recommended', 'plugin:jest/recommended', 'plugin:prettier/recommended'],
      plugins: ['jest', 'prettier'],
      rules: {
        'no-unused-vars': ['error', {argsIgnorePattern: '^_'}]
      }
    }
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'linebreak-style': 'off',
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'warn',
    'no-param-reassign': 'off',
    'react/prop-types': 'off',
    camelcase: 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-useless-escape': 'warn',
    'no-nested-ternary': 'off',
    'no-case-declarations': 'warn',
    'comma-dangle': 'off',
    'global-require': 'warn',
    'no-underscore-dangle': ['error', {allow: ['_id']}], // because we use mongo and its id start with underscore
    semi: ['error', 'always']
  }
};
