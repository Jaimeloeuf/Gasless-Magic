const Web3 = require("web3");

// Abrevated function binding
const print = console.log;

// Either get a web3 instance via the default provider in environments such as the browser or use default localhost port
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// Print out instance
print(web3);