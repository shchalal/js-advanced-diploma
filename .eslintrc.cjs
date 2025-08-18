module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    'no-alert': 'off',
    'no-restricted-syntax': [
      'error',
      { selector: 'ForInStatement', message: 'for..in is not allowed' },
      { selector: 'LabeledStatement', message: 'Labels are not allowed' },
      { selector: 'WithStatement', message: '`with` is not allowed' },
   
    ],
   
    'no-await-in-loop': 'off',
    'no-plusplus': 'off',
    'class-methods-use-this': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'max-len': ['error', { code: 120, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'import/extensions': 'off',
    'no-param-reassign': ['error', { props: false }],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js'],
      env: { jest: true },
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};


