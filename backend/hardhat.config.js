require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
      // Optionally add accounts if needed, for example:
      accounts: [process.env.PRIVATE_KEY]
    },
  },
};
