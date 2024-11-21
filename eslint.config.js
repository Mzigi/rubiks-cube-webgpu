// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  { 
    rules: { 
      "semi": ["error", "always"],
      "@typescript-eslint/explicit-function-return-type": ["error"],
      "@typescript-eslint/typedef": ["error", {
        "arrayDestructuring": true,
        "arrowParameter": true,
        "memberVariableDeclaration": true,
        "objectDestructuring": true,
        "parameter": true,
        "propertyDeclaration": true,
        "variableDeclaration": true,
        "variableDeclarationIgnoreFunction": false }]
       }
  }
);