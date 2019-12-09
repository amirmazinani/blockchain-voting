var Voting = artifacts.require("./Voting.sol");

module.exports = function(deployer) {
 deployer.deploy(Voting, 10000, web3.utils.toWei('0.01', 'ether'), ['amir', 'asal', 'hana'].map(name => web3.utils.asciiToHex(name)));
};