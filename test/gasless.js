/**
 * @title Mocha based test file for gasless transactions
 */

const print = console.log;

const assert = require("assert");
const Web3 = require("web3");
const ganache = require("ganache-core");
const request = require("request");

/**
 * @notice Create a ganache testnet with custom accounts
 * @notice Create 1 account with ETH and 2 more account without any ETH
 */
const web3 = new Web3(ganache.provider({
	accounts: [
		{ balance: "0xDE0B6B3A7640000" }, // Hexadecimal for 1 ETH in wei
		{ balance: "0x0" },
		{ balance: "0x0" },
	]
}));

describe("Gasless Transaction", function () {
	this.timeout(10000); // 10 Seconds timeout


	/** @notice Create the variables for the different accounts */
	let accounts, acc_ETH, acc_ETHless1, acc_ETHless2;

	/** @notice Variables for the contract build files */
	let Identity, Dapp;

	/** @notice Variables for newly created contract objects */
	let IdentityContract, DappContract;

	/** @notice Variables for the final deployed contract objects */
	let identity, dapp;

	/** @notice Base/Root URL of the relayer */
	let relayer_host;

	/** @notice Variable to temporarily store the estimated Gas Limit of contract method executions */
	let gasEstimate;


	/** @notice First before hook to setup accounts and build files */
	before(async function () {
		accounts = await web3.eth.getAccounts();
		acc_ETH = accounts[0];
		acc_ETHless1 = accounts[1];
		acc_ETHless2 = accounts[2];

		// Get contract build files
		Identity = require("../build/contracts/Identity");
		Dapp = require("../build/contracts/Dapp");
	});


	/** @notice Setup Env variables and relayer */
	before(async function () {
		/** @notice Inject configurations for testing relayer into the environmental variables */
		process.env.PORT = 3000;
		// Put a private key from the created ganache
		// @Todo Update this to use a mnemonic, so it is always the same? Or is it actually needed
		// Or I can just inject the private key of the acc_ETH created above
		process.env.PRIVATE_KEY = "0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8";
		process.env.WEB3_PROVIDER_URL = "https://rinkeby.infura.io/048a00ef79744b2c81a02d2352428843";

		// Get the values out so they can be used later on
		const { PORT, PRIVATE_KEY, WEB3_PROVIDER_URL } = process.env;

		// Require the gasless-relayer server to start it. Wait for server to start before proceeding with await
		const app = await require("gasless-relayer");

		// Construct the Base/Root URL
		relayer_host = `http://localhost:${PORT}`;
		print(`Interacting with Gasless Relayer server at: '${relayer_host}'`);
	});


	beforeEach("setup", async function () {
		// Create new contract object instance
		IdentityContract = await new web3.eth.Contract(Identity.abi);
		DappContract = await new web3.eth.Contract(Dapp.abi);

		/** @notice Deploy the contracts */
		gasEstimate = await IdentityContract.deploy({ data: Identity.bytecode }).estimateGas();
		identity = await IdentityContract.deploy({ data: Identity.bytecode }).send({ from: acc_ETH, gas: gasEstimate });

		gasEstimate = await DappContract.deploy({ data: Dapp.bytecode }).estimateGas();
		dapp = await DappContract.deploy({ data: Dapp.bytecode }).send({ from: acc_ETH, gas: gasEstimate });
	});


	it("Value of n can be updated", async function () {
		const new_value = "12345"; // Value to be set for N

		const initialValueOfN = await dapp.methods.n().call();
		assert(initialValueOfN === "0", "Value of N should start with 0");

		/** @notice Make the call from the account with ETH */
		await dapp.methods.setN(new_value).send({ from: acc_ETH });

		const finalValueOfN = await dapp.methods.n().call();
		assert(finalValueOfN === new_value, "Value of N should be changed");

		const finalSender = await dapp.methods.sender().call();
		assert(acc_ETH === finalSender, "Account with ETH is not stored as account that made the call to setN()");
	});


	it("Proxy calls changes state of dapp with execute()", async function () {
		const new_value = "2345"; // Value to be set for N
		// @Todo For some reasons, bigger values tend to fail

		/** @notice Create the transaction Data needed to call setN() on dapp contract */
		const encodedTxData = dapp.methods.setN(new_value).encodeABI();

		/** @notice Use execute method of identity contract to proxy the execution of setN() */
		await identity.methods.execute(dapp.options.address, 0, encodedTxData, 0).send({ from: acc_ETH, gas: 4170000 });

		const finalN = await dapp.methods.n().call();
		const finalSender = await dapp.methods.sender().call();

		assert(finalN === new_value, "Proxied call failed to change state in 'dapp' contract");
		assert(identity.options.address === finalSender, "Dapp did not set address of identity as the 'sender' variable");
	});


	it("Gasless-Relayer is up and running. /Ping route is tested to work", async function () {

		/** @function Generic function to do assertion testing */
		function assertion_checks(error, statusCode, body) {
			print(arguments); // Print out all the input arguements if needed

			assert(!error, "Error when calling relayer with callback method");
			assert(statusCode === 200, "Status Code returned is not as expected");
			assert(body != false, "Request body was empty"); // Print the HTML for the Google homepage.
		}

		async function Callback_request() {
			/** @notice Extract and pass in the statusCode in the wrapped callback function */
			request.get(`${relayer_host}/ping`, (error, response, body) => assertion_checks(error, response.statusCode, body));
		}

		async function Async_Await_request() {
			/** @notice Promisify the method with the Node JS build in utility library */
			const get = require("util").promisify(request.get);
			const res = await get(`${relayer_host}/ping`);
			assertion_checks(res.error, res.statusCode, res.body);
		}

		/** @notice Call the sub tests 1 by 1 */
		print("Running test using callback method");
		await Callback_request();
		print("Running test using async/await method");
		await Async_Await_request();
	});
});