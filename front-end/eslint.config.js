import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
	{
		ignores: ["node_modules", "dist"],
	},
	{
		files: ["**/*"],
		languageOptions: {
			sourceType: "module",
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.es2020,
			},
		},
		rules: {
			// Recommended
			...js.configs.recommended.rules,

			// Defaults
			"array-bracket-spacing": "error",
			"arrow-spacing": "error",
			"comma-spacing": "error",
			"comma-style": "error",
			"curly": "error",
			"eol-last": "error",
			"keyword-spacing": "error",
			"max-statements-per-line": "error",
			"no-floating-decimal": "error",
			"no-inline-comments": "error",
			"no-multi-spaces": "error",
			"no-multiple-empty-lines": "error",
			"no-shadow": "error",
			"no-trailing-spaces": "error",
			"no-var": "error",
			"prefer-const": "error",
			"quotes": "error",
			"semi": "error",
			"space-before-blocks": "error",
			"space-before-function-paren": "error",
			"space-in-parens": "error",
			"space-infix-ops": "error",
			"space-unary-ops": "error",
			"spaced-comment": "error",

			// Custom
			"brace-style": ["error", "stroustrup"],
			"comma-dangle": ["error", "always-multiline"],
			"dot-location": ["error", "property"],
			"indent": ["error", "tab"],
			"object-curly-spacing": ["error", "always"],
		},
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		plugins: {
			"@typescript-eslint": typescriptPlugin,
		},
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: "./tsconfig.eslint.json",
			},
		},
		rules: {
			...typescriptPlugin.configs["recommended-type-checked"].rules,
			...typescriptPlugin.configs["strict-type-checked"].rules,
			...typescriptPlugin.configs["stylistic-type-checked"].rules,
		},
	},
];
