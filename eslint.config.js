import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'supabase/functions/**'] },
  js.configs.recommended,
  { languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.browser } } },
  { files: ['scripts/**', 'tests/**', 'vite.config.js', 'eslint.config.js'], languageOptions: { globals: { ...globals.node } } },
];
