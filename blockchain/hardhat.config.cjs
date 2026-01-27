require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/uMjNcEtNXiuSDfKP2H4Ye",
      accounts: ["a7d98ab856fe2c3095a317857db7a1e5440d0e293aefc14ab1c660815468ebe8"]
    }
  }
};
