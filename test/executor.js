const Executor = artifacts.require("Executor");
const Dapp = artifacts.require("dapp");
// const identity = artifacts.require("Identity");

// Abrevated function binding
const print = console.log;

contract('Executor', function (accounts) {
    let executor;
    let dapp;

    beforeEach("setup", async function () {
        executor = await Executor.new();
        dapp = await Dapp.new();
    });

    it("Proxy calls changes state of dapp with execute()", async function () {
        const encodedTxData = dapp.contract.methods.setN("15").encodeABI();
        const result = await executor.execute(dapp.address, 0, encodedTxData, 0)
        const finalN = await dapp.n();

        assert(web3.utils.toBN("15").eq(finalN), "Value not set")
    });
});