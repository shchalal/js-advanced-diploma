module.exports = {
  env: { browser: true, es2022: true, jest: true },
  extends: ['standard'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-alert': 0, 
    'no-console': 0
  }
};
