module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true, // For test files
        "truffle/globals": true // Same as "truffle/truffle": true
    },
    "plugins": [
        "truffle"
    ],
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        /** Reference links for rule below
         * @link https://eslint.org/docs/rules/require-atomic-updates
         * @link https://stackoverflow.com/questions/56892964/await-async-race-condition-error-in-eslint-require-atomic-updates
         */
        "require-atomic-updates": "off"
    }
};