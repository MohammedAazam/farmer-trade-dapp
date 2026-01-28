require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/uMjNcEtNXiuSDfKP2H4Ye",
      accounts: ["account-address"]
    }
  }
};
