const abi = JSON.stringify(require("./build/contracts/Executor.json").abi);

console.log(abi);

module.exports = abi;