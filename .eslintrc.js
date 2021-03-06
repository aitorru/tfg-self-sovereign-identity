module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:react/recommended'
	],
	'parserOptions': {
		'ecmaFeatures': {
			'jsx': true
		},
		'ecmaVersion': 13,
		'sourceType': 'module'
	},
	'plugins': [
		'react'
	],
	'rules': {
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off',
		'indent': [
			'warn',
			'tab'
		],
		'quotes': [
			'warn',
			'single'
		],
		'semi': [
			'warn',
			'always'
		],
		'key-spacing': [
			'warn',
			{ 'mode': 'minimum' }
		],
		'space-infix-ops': ['error', { 'int32Hint': false }]
	}
};
