import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

export default [
	{
		ignores: ['dist'],
	},
	{
		// All JavaScript-esque files
		files: ['**/*.{m,c,}{js,ts}{x,}'],
		plugins: {
			'@stylistic': stylistic,
		},
		languageOptions: {
			sourceType: 'module',
			ecmaVersion: 'latest',
			globals: {
				...globals.node,
				...globals.es2021, // es2022 is not available (https://github.com/sindresorhus/globals/issues/183)
				...globals.browser,
				NodeJS: true,
			},
		},
		rules: {
			// Recommended
			...js.configs.recommended.rules,
			...stylistic.configs['recommended-flat'].rules,

			// Overrides
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/indent-binary-ops': ['error', 'tab'],
			'@stylistic/no-tabs': 0,
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/member-delimiter-style': 'error',

			// Additions
			'curly': 'error',
			'no-shadow': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
		},
	},
	{
		// TypeScript files
		files: ['**/*.{m,c,}ts{x,}'],
		plugins: {
			'@typescript-eslint': typescriptPlugin,
		},
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: './tsconfig.eslint.json',
			},
		},
		rules: {
			...typescriptPlugin.configs['strict-type-checked'].rules,
			...typescriptPlugin.configs['stylistic-type-checked'].rules,
		},
	},
	{
		// React files
		files: ['**/*.{m,c,}{js,ts}x'],
		plugins: {
			react: reactPlugin,
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			// Recommended
			...reactPlugin.configs.recommended.rules,
			...reactPlugin.configs['jsx-runtime'].rules,

			// Overrides
			'@stylistic/jsx-indent': ['error', 'tab'],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
		},
	},
];
