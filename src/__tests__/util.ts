import { RuleTester } from "eslint";

export function makeRuleTester(): RuleTester {
  return new RuleTester({
    parserOptions: {
      ecmaVersion: 2015,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
  });
}
