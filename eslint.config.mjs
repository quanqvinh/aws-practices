import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginCdk from 'eslint-plugin-cdk'
import pluginPrettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

const ignores = ['dist/**/*', 'build/*', 'coverage/*', '*.js', '*.d.ts']

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores,
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    ignores,
  },
  {
    ...pluginJs.configs.recommended,
    ignores,
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    ignores,
  })),
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      cdk: pluginCdk,
      prettier: pluginPrettier,
    },
    ignores,
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      'cdk/ban-lambda-runtimes': [
        'error',
        {
          bannedRuntimes: [
            'NODEJS',
            'NODEJS_4_3',
            'NODEJS_6_10',
            'NODEJS_8_10',
            'NODEJS_10_X',
            'NODEJS_12_X',
            'DOTNET_CORE_1',
            'DOTNET_CORE_2',
          ],
        },
      ],
      'cdk/construct-ctor': 'error',
      'cdk/construct-props-struct-name': 'error',
      'cdk/public-static-property-all-caps': 'error',
      'cdk/no-static-import': 'error',
      'cdk/stack-props-struct-name': 'error',
      'cdk/prefer-type-only-imports': [
        'error',
        {
          moduleNames: ['aws-lambda'],
        },
      ],
    },
  },
]
