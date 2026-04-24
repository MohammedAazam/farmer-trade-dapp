require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      mining: {
        auto: true,
        interval: 0
      },
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true
    }
  }
};