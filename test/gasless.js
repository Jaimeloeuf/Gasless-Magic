/**
 * @title Mocha based test file for gasless transactions
 */

const print = console.log;

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


	/** @notice Generic function to estimate Gas for contract methods with a 10% error of margin */
	const estimateGas = async (method, input) => Math.trunc(await method(input).estimateGas() * 1.1);
});