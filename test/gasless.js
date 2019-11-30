/**
 * @title Mocha based test file for gasless transactions
 */

const print = console.log;

const assert = require("assert");
const Web3 = require("web3");
const ganache = require("ganache-core");
const request = require("request-promise-native");


/**
 * @notice Create a ganache testnet with custom accounts
 * @notice Create 1 account with ETH and 2 more account without any ETH
 */
const server = ganache.server({
	accounts: [
		{ balance: "0xDE0B6B3A7640000" }, // Hexadecimal for 1 ETH in wei
		{ balance: "0x0" },
		{ balance: "0x0" },
	],
	port: 2001
});
const ganacheProvider = server.provider;
server.listen(function (err, blockchain) {
	if (err) {
		print("Ganache-core server failed to start/listen to port");
		throw err; // Throw error if unable to start ganache-core at all
	}
	// Debug: blockchain -> The full ganache object
});
const web3 = new Web3(ganacheProvider);


describe("Gasless Transaction", function () {
	this.timeout(10000); // 10 Seconds timeout


	/** @notice Create variable for the gasless-relayer Express App */
	let app;

	/** @notice Create the variables for the different accounts */
	let accounts, acc_ETH, acc_ETHless;

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


	before("Create ETH accounts and read Build files", async function () {
		accounts = await web3.eth.getAccounts();
		acc_ETH = accounts[0];
		acc_ETHless = accounts[1];

		// Get contract build files
		Identity = require("../build/contracts/Identity");
		Dapp = require("../build/contracts/Dapp");
	});


	before("Setup Env variables for gasless-relayer", async function () {
		/** @notice Inject configurations for testing relayer into the environmental variables */

		// PORT for relayer to use
		process.env.PORT = 3000;

		// Read privateKey directly from ganacheProvider for relayer to use
		// @Todo Explore using a fixed mnemonic, so it is always the same? Or is it actually needed
		let privateKey = "0x" + ganacheProvider.manager.state.accounts[acc_ETH.toLowerCase()].secretKey.toString("hex");
		// Simple assertion test to make sure the privateKey is correct
		assert(web3.eth.accounts.privateKeyToAccount(privateKey).address === acc_ETH);

		// Set the privateKey for the account "acc_ETH"
		process.env.PRIVATE_KEY = privateKey;

		// The Web3 provider's URL of gasless-relayer should be the ganache-core server started in this test
		process.env.WEB3_PROVIDER_URL = `http://localhost:${ganacheProvider.options.port}`;

		// Get the values out so they can be used later on
		const { PORT, PRIVATE_KEY } = process.env;

		// Require the gasless-relayer server to start it. Wait for server to start before proceeding with await
		app = await require("gasless-relayer");

		// Construct the Base/Root URL
		relayer_host = `http://localhost:${PORT}`;
		print(`Interacting with Gasless Relayer server at: '${relayer_host}'`);
	});


	beforeEach("Create and deploy new set of Contracts for each test", async function () {
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
		// Parse the response value as JSON before testing
		const res = JSON.parse(await request.get(`${relayer_host}/ping`));
		assert(res.status === 200, "Status Code returned is not as expected");
		assert(res.body != false, "Request body was empty"); // Print the HTML for the Google homepage.
	});


	after("After hook to close gasless-relayer server and ganache-core server", async function () {
		// Await so that it only continues after the callback function is called. @Todo to verify if this is deterministic
		await app.close(() => print("Server stopped and port closed"));

		// Close the ganache-core server, throw the error if it fails
		server.close(function (err) {
			if (err)
				throw (err);
		});
	});
});