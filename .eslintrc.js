//http://eslint.org/docs/user-guide/configuring
module.exports = {
	"env": {
		"browser": true,
		"jquery": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
	},
	"rules": {
		"array-callback-return": "error",
		"default-case": "error",
		"indent": "off",
		"no-eq-null": "error",
		"no-invalid-this": "error",
		"no-lone-blocks": "error",
		"no-multi-str": "error",
		"no-new-func": "error",
		"no-new-wrappers": "error",
		"no-prototype-builtins": "off",
		"no-self-compare": "error",
		"no-sequences": "error",
		"no-useless-concat": "error",
		"no-shadow-restricted-names": "error",
		"no-mixed-operators": "error",
		"no-mixed-spaces-and-tabs": "off",

		"no-constant-condition": [
			"error", {
				"checkLoops": false
			}
		],
		"no-unused-vars": [
			"error",
			{
				"vars": "local",
        "args": "none",
				"varsIgnorePattern": "round"
			}
		],
		"no-use-before-define": [
			"error", {
				"functions": false
			}
		],
		"multiline-ternary": [
			"error",
			"always-multiline"
		],

		//options that will make a change on the file when --fix is used on the command
		"array-element-newline": [
			"error",
			"consistent"
		],
		"block-spacing": [
			"error",
			"never"
		],
		"function-paren-newline": [
			"error",
			"consistent"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"no-extra-parens": [
			"error",
			"functions"
		],
		"object-curly-newline": [
			"error",
			{
				"consistent": true
			}
		],
		"object-property-newline": [
			"error",
			{
				"allowAllPropertiesOnSameLine": true
			}
		],
		"padded-blocks": [
			"error",
			"never"
		],
		"quote-props": [
			"error",
			"consistent-as-needed"
		],
		"quotes": [
			"error",
			"single", {
				"avoidEscape": true
			}
		],

		//options that will make a change on the file when --fix is used on the command
		"array-bracket-spacing": "error",
		"arrow-spacing": "error",
		"brace-style": "error",
		"comma-dangle": "error",
		"comma-spacing": "error",
		"comma-style": "error",
		"computed-property-spacing": "error",
		"eol-last": "error",
		"func-call-spacing": "error",
		"implicit-arrow-linebreak": "error",
		"key-spacing": "error",
		"keyword-spacing": "error",
		"lines-between-class-members": "error",
		"no-confusing-arrow": "error",
		"no-else-return": "error",
		"no-floating-decimal": "error",
		"no-implicit-coercion": "error",
		"no-multiple-empty-lines": "error",
		"no-trailing-spaces": "error",
		"no-undef-init": "error",
		"no-unneeded-ternary": "error",
		"no-useless-computed-key": "error",
		"no-useless-return": "error",
		"no-whitespace-before-property": "error",
		"object-curly-spacing": "error",
		"operator-assignment": "error",
		"semi": "error",
		"semi-spacing": "error",
		"space-in-parens": "error",
		"space-infix-ops": "error",
		"space-unary-ops": "error",
		"switch-colon-spacing": "error",
		"wrap-regex": "error"
	}
};
