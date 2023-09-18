module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "linebreak-style": "off",
    "no-console": "off",
    "import/prefer-default-export": "off",
    "no-use-before-define": "warn",
    "no-param-reassign": "off",
    "react/prop-types": "off",
    camelcase: "off",
    "import/no-extraneous-dependencies": "off",
    "no-useless-escape": "warn",
    "no-nested-ternary": "off",
    "no-case-declarations": "warn",
    "comma-dangle": "off",
    "global-require": "warn",
    semi: ["error", "always"],
  },
};
