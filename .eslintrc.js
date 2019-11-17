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
        ]
    }
};