module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    env:{
        "browser": true,
        "node": true,
        "amd": true
    },
    "ignorePatterns": ["**/lib/dojo*"],
    rules: {
        "no-debugger": "off"
    }
};