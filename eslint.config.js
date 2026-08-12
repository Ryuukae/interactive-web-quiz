import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
    // 1. Base ESLint recommended rules
    js.configs.recommended,

    // 2. Your custom project configuration
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

    // 3. Prettier collision prevention (must remain last in the array)
    prettierConfig
];