const dapp = artifacts.require("dapp.sol");

module.exports = function (deployer) {
	deployer.deploy(dapp);
};