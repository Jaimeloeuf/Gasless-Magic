const Executor = artifacts.require("Executor.sol");
const Identity = artifacts.require("Identity.sol");

module.exports = function (deployer) {
    deployer.deploy(Executor);
    deployer.deploy(Identity);
};