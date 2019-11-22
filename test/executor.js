const Executor = artifacts.require("Executor");
const Dapp = artifacts.require("dapp");

contract("Executor", function (accounts) {
	let executor;
	let dapp;

	// Create a new set of contracts for every test
	beforeEach("setup", async function () {
		executor = await Executor.new();
		dapp = await Dapp.new();
	});

	it("Proxy calls changes state of dapp with execute()", async function () {
		const encodedTxData = dapp.contract.methods.setN("15").encodeABI();
		const result = await executor.execute(dapp.address, 0, encodedTxData, 0);
		const finalN = await dapp.n();
		const finalSender = await dapp.sender();

		assert(web3.utils.toBN("15").eq(finalN), "Proxied call failed to change state in 'dapp' contract");
		assert(executor.address === finalSender, "Dapp did not set address of executor as the 'sender' variable");
	});

	it("Proxy calls changes state of dapp with execute_with_custom_gas()", async function () {
		const encodedTxData = dapp.contract.methods.setN("12").encodeABI();
		const result = await executor.execute_with_custom_gas(dapp.address, 0, encodedTxData, 0, 100000); // Hardcoded gas amount
		const finalN = await dapp.n();
		const finalSender = await dapp.sender();

		assert(web3.utils.toBN("12").eq(finalN), "Proxied call failed to change state in 'dapp' contract");
		assert(executor.address === finalSender, "Dapp did not set address of executor as the 'sender' variable");
	});
});