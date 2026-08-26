// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Reanimated shared values are intentionally mutated via `.value`.
    files: ['**/flip-card.tsx', '**/press-scale.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
  {
    // Web hydration gate for static render; setState-on-mount is intentional.
    files: ['**/use-color-scheme.web.ts'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
