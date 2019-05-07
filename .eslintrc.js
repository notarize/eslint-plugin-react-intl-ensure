module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  plugins: ["@typescript-eslint"],
  rules: {
    eqeqeq: ["error", "always"],
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true, allowTypedFunctionExpressions: true },
    ],
    "@typescript-eslint/no-explicit-any": "error",
  },
};
