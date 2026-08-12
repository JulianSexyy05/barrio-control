import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // La app usa el patrón estándar de fetch dentro de useEffect (setLoading/setData
      // en callbacks async). La regla de react-hooks v7 no es flow-aware y marca
      // falsos positivos en este patrón, por eso se desactiva.
      "react-hooks/set-state-in-effect": "off",
    },
  },
])
