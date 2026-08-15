import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
    // Base ESLint recommended rules
    js.configs.recommended,

    // Your custom project configuration
    {
        plugins: {
            jsdoc: jsdoc
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "eqeqeq": "error",
            "curly": ["error", "multi-line"],
            "jsdoc/check-param-names": "error",
            "jsdoc/check-tag-names": "error",
            "jsdoc/check-types": "error"
        }
    },

    // Prettier collision prevention (must remain last in the array)
    prettierConfig,

    // JSDoc Annotaion check
    jsdoc.configs['flat/recommended'],
  {
    plugins: {
      jsdoc,
    },
    rules: {
      // Strictly require JSDoc for Classes and Methods
      'jsdoc/require-jsdoc': ['error', {
        require: {
          ClassDeclaration: true,
          MethodDefinition: true,
          FunctionDeclaration: true,
          ArrowFunctionExpression: false
        },
      }],
      
      // Ensure professional standards within the JSDoc blocks
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',

      // --- Modern Best Practice Additions ---

      // Require @throws if the function explicitly throws an error.
      // This is critical for professional error handling and API boundaries.
      'jsdoc/require-throws': 'error',

      // Ensure the JSDoc parameters actually match the function signature.
      // Prevents outdated docs where a param was renamed but the JSDoc wasn't.
      'jsdoc/check-param-names': 'error',

      // Prevent typos in standard JSDoc tags (e.g., catching `@paramm` instead of `@param`)
      'jsdoc/check-tag-names': 'error',

      // Ensure the TypeScript/JavaScript types provided in the JSDoc are syntactically valid
      'jsdoc/valid-types': 'error',

      // Prevent JSDoc blocks from being completely empty
      'jsdoc/empty-tags': 'error',

      // Allow blank lines between tags for better readability if desired
      'jsdoc/tag-lines': ['error', 'any', { startLines: 0 }]
    },
  }
];