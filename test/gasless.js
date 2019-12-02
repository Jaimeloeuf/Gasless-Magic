/**
 * @title Mocha based test file for gasless transactions
 * 
 * @Todo Change the PORT of ganache-core server which is now hardcoded to 2001
 */

const print = console.log;

const assert = require("assert");
const Web3 = require("web3");
const ganache = require("ganache-core");
const request = require("request-promise-native");


describe("Gasless Transaction", function () {
	this.timeout(10000); // 10 Seconds timeout


	/** @notice Create variables for ganache and web3 */
	let server, ganacheProvider, web3;

	/** @notice Create variable for the gasless-relayer Express App */
	let app;

	/** @notice Create the variables for the different accounts */
	let acc_ETH, acc_ETHless;

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


	before("Setup ganache and web3", async function () {
		/**
         * @notice Create a ganache testnet with custom accounts
         * @notice Create 1 account with ETH and 2 more account without any ETH
         * @notice Run ganache-core server on the hardcoded PORT 2001
         */
		server = ganache.server({
			accounts: [
				{ balance: "0xDE0B6B3A7640000" }, // Hexadecimal for 1 ETH in wei
				{ balance: "0x0" },
				{ balance: "0x0" },
			],
			port: 2001
		});

		// Extract out ganacheProvider as it will be used again elsewhere
		ganacheProvider = server.provider;

		// await new Promise object for "Start ganache-core server" callback function to get called.
		await new Promise((resolve, reject) => {
			server.listen(function (err, blockchain) {
				if (err)
					reject(err); // Reject error if unable to start ganache-core at all
				else
					resolve(blockchain); // @Debug: blockchain -> The full ganache-core object
			});
		});

		// Create the web3 object with the newly created ganacheProvider
		web3 = new Web3(ganacheProvider);
	});


	before("Create ETH accounts", async function () {
		const accounts = await web3.eth.getAccounts();
		const address_ETH = accounts[0];
		const address_ETHless = accounts[1];

		// Temporary variable used to store privateKey extracted from ganacheProvider
		let privateKey;

		// Read privateKey directly from ganacheProvider for relayer to use
		privateKey = "0x" + ganacheProvider.manager.state.accounts[address_ETH.toLowerCase()].secretKey.toString("hex");
		acc_ETH = web3.eth.accounts.privateKeyToAccount(privateKey);

		privateKey = "0x" + ganacheProvider.manager.state.accounts[address_ETHless.toLowerCase()].secretKey.toString("hex");
		acc_ETHless = web3.eth.accounts.privateKeyToAccount(privateKey);

		// Simple assertion tests to ensure account generated with the privateKeys are correct
		assert(acc_ETH.address === address_ETH);
		assert(acc_ETHless.address === address_ETHless);
	});


	before("Read and store Build files", async function () {
		// Get contract build files
		Identity = require("../build/contracts/Identity");
		Dapp = require("../build/contracts/Dapp");
	});


	before("Setup Env variables for gasless-relayer", async function () {
		/** @notice Inject configurations for testing relayer into the environmental variables */

		// PORT for relayer to use
		process.env.PORT = 2002;

		// Set the privateKey for the account "acc_ETH"
		process.env.PRIVATE_KEY = acc_ETH.privateKey;

		// The Web3 provider's URL of gasless-relayer should be the ganache-core server started in this test
		process.env.WEB3_PROVIDER_URL = `http://localhost:${ganacheProvider.options.port}`;

		// Get the values out so they can be used later on
		const { PORT } = process.env;

		// Require the gasless-relayer server to start it. Wait for server to start before proceeding with await
		app = await require("gasless-relayer");

		// Construct the Base/Root URL
		relayer_host = `http://localhost:${PORT}`;
	});


	beforeEach("Create and deploy new set of Contracts for each test", async function () {
		// Create new contract object instance
		IdentityContract = await new web3.eth.Contract(Identity.abi);
		DappContract = await new web3.eth.Contract(Dapp.abi);

		/** @notice Deploy the contracts */
		gasEstimate = await IdentityContract.deploy({ data: Identity.bytecode }).estimateGas();
		identity = await IdentityContract.deploy({ data: Identity.bytecode }).send({ from: acc_ETH.address, gas: gasEstimate });

		gasEstimate = await DappContract.deploy({ data: Dapp.bytecode }).estimateGas();
		dapp = await DappContract.deploy({ data: Dapp.bytecode }).send({ from: acc_ETH.address, gas: gasEstimate });
	});


	it("Value of n can be updated", async function () {
		const new_value = "12345"; // Value to be set for N

		const initialValueOfN = await dapp.methods.n().call();
		assert(initialValueOfN === "0", "Value of N should start with 0");

		/** @notice Make the call from the account with ETH */
		await dapp.methods.setN(new_value).send({ from: acc_ETH.address });

		const finalValueOfN = await dapp.methods.n().call();
		assert(finalValueOfN === new_value, "Value of N should be changed");

		const finalSender = await dapp.methods.sender().call();
		assert(finalSender === acc_ETH.address, "Account with ETH is not stored as account that made the call to setN()");
	});


	it("Proxy calls changes state of dapp with execute()", async function () {
		const new_value = "2345"; // Value to be set for N
		// @Todo For some reasons, bigger values tend to fail

		/** @notice Create the transaction Data needed to call setN() on dapp contract */
		const encodedTxData = dapp.methods.setN(new_value).encodeABI();

		/** @notice Use execute method of identity contract to proxy the execution of setN() */
		await identity.methods.execute(dapp.options.address, 0, encodedTxData, 0).send({ from: acc_ETH.address, gas: 4170000 });

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


	it("Makes a gasless transaction", async function () {
		const newValue = "24"; // Value to be set for N

		/** @notice Create the transaction Data needed to call setN() on dapp contract */
		const encodedTxData = dapp.methods.setN(newValue).encodeABI();

		/** @notice Create tx of action user wants to execute before sending to relayer */
		const tx = {
			// The public address of the user who signs on this first to show intent of execution
			from: acc_ETHless.address,

			// Target address to interact with, which is the address of the Identity contract (Smart contract wallet address of this user) in this test
			to: identity.options.address,

			// nonce of the signer, which is the transaction count of the user
			nonce: web3.utils.toHex(await web3.eth.getTransactionCount(acc_ETHless.address)),

			// Maximum amount of gas to use for the transaction
			// With an additional 10% for margin or error
			// Created with the same method of calling setN of dapp
			gasLimit: web3.utils.toHex(Math.trunc(await dapp.methods.setN(newValue).estimateGas() * 1.1)),

			// This should ALWAYS be 0! Because EOA cannot send any ETH
			// Even if there is any ETH transfer from User, it is ETH transfer from the Smart Contract Wallet.
			// The value SCW sends over should be a function parameter to the execute call
			value: 0,

			// Data sent to execute function, with txData to interact with Dapp
			data: identity.methods.execute(dapp.options.address, 0, encodedTxData, 0).encodeABI()
		};
	});

	after("After hook to close gasless-relayer server and ganache-core server", async function () {
		// await new Promise object for "express app to close" callback function to get called.
		await new Promise((resolve) => app.close(resolve));

		// await new Promise object for "Close ganache-core server" callback function to get called.
		await new Promise((resolve, reject) => {
			server.close(function (err) {
				if (err)
					reject(err); // Reject error if unable to stop ganache-core
				else
					resolve();
			});
		});
	});
});