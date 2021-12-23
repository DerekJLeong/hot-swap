// require("solidity-coverage");
// require("hardhat-gas-reporter");
// require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
   solidity: {
      version: "0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {
         chainId: 1337,
      },
      mumbai: {
         url: process.env.MUMBAI_URL || "",
         accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      },
      mainnet: {
         url: process.env.MAINNET_URL || "",
         accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      },
   },
   // gasReporter: {
   //    enabled: !process.env.REPORT_GAS,
   //    currency: "USD",
   // },
   // etherscan: {
   //    apiKey: process.env.ETHERSCAN_API_KEY,
   // },
};
