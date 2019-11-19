/**
 * @title Mocha based test file for gasless transactions
 */

const print = console.log;

const Web3 = require("web3");
const ganache = require("ganache-core");

/**
 * @notice Create a ganache testnet with custom accounts
 * @notice Create 1 account with ETH and 2 more account without any ETH
 */
const web3 = new Web3(ganache.provider({
	accounts: [
		{ balance: "0x10" },
		{ balance: "0x0" },
		{ balance: "0x0" },
	]
}));

describe("Gasless Transaction", async function () {

	const Identity = require("../build/contracts/Identity").abi;
	const Dapp = require("../build/contracts/Dapp").abi;

	const request = require("request");

	let relayer_URL;

	before(function () {
		/** @notice Injects the values into the  */
		// Below are the configuration needed for testing with the relayer
		process.env.PORT = 3000;
		process.env.PRIVATE_KEY = "0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8";
		process.env.WEB3_PROVIDER_URL = "https://rinkeby.infura.io/048a00ef79744b2c81a02d2352428843";

		// Get the values out so they can be used later on
		const { PORT, PRIVATE_KEY, WEB3_PROVIDER_URL } = process.env;

		relayer_URL = `http://localhost:${PORT}`;

		// Require the gasless-relayer server to start it. Wait for server to start before proceeding with await
		await require("gasless-relayer");
		print(`Interacting with Gasless Relayer server at: '${relayer_URL}'`);
	});


	let identity;
	let dapp;

	beforeEach("setup", async function () {
		identity = (new web3.eth.Contract(Identity)).deploy();
		dapp = (new web3.eth.Contract(Dapp)).deploy();
	});
});