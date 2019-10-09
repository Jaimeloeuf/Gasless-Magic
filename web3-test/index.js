const Web3 = require("web3");

// Abrevated function binding
const print = console.log;

// Either get a web3 instance via the default provider in environments such as the browser or use default localhost port
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

async function main() {
    const accounts = await web3.eth.getAccounts();

    // Get the first account
    const acc = accounts[0];

    // Private key of the first account
    const p_key = 0xfd0be719e50e1c0b4982538b2550547208ec60062db2c8a5c83221d939176561;

    // Address of the Smart Contract dApp
    const contract_addr = 0x04Ab8D4D8905E9BA22CBfB70897cDb5aF45190Bc;

    // Read the ABI of the dApp from local fs.
    const abi = require("./abi.json");

    // Create a contract object with the address and ABI
    new web3.eth.Contract(abi, contract_addr)

    // Create a transaction object
    const tx = {
        // this could be provider.addresses[0] if it exists
        // from: acc,
        from: p_key,
        // target address, this could be a smart contract address
        to: contract_addr,
        // optional if you want to specify the gas limit 
        // gas: gasLimit,
        // optional if you are invoking say a payable function 
        // value: value,
        // this encodes the ABI of the method and the arguements
        // data: myContract.methods.myMethod(arg, arg2).encodeABI()
        data: 0x3f7a0270000000000000000000000000000000000000000000000000000000000000000a
    };

    // const signPromise = web3.eth.signTransaction(tx, p_key);
    // print(signPromise)
}

// Run the main function
main()