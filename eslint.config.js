// ESLint 9 usa flat config: sustituye al antiguo `.eslintrc.json`, que
// ESLint 9 ya no lee (formato eslintrc) y que además extendía "google"
// sin tener instalado `eslint-config-google`.
import js from '@eslint/js';
import google from 'eslint-config-google';
import globals from 'globals';

// eslint-config-google 0.14.0 todavía trae tres reglas eliminadas en
// ESLint 9 (valid-jsdoc, require-jsdoc y no-catch-shadow): se quitan del
// conjunto y el resto de reglas de Google se usa tal cual.
const {
  'valid-jsdoc': _validJsdoc,
  'require-jsdoc': _requireJsdoc,
  'no-catch-shadow': _noCatchShadow,
  ...googleRules
} = google.rules;

export default [
  js.configs.recommended,
  {
    rules: googleRules,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  {
    ignores: ['node_modules/**'],
  },
];
