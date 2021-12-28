// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
   // Hardhat always runs the compile task when running scripts with its command
   // line interface.
   //
   // If this script is run directly using `node` you may want to call compile
   // manually to make sure everything is compiled
   // await hre.run('compile');

   // We get the contract to deploy
   const MarketContract = await hre.ethers.getContractFactory("Market");
   const Market = await MarketContract.deploy();
   await Market.deployed();
   console.log("Market deployed to:", Market.address);

   const NFTContract = await hre.ethers.getContractFactory("NFT");
   const NFT = await NFTContract.deploy(Market.address);
   await NFT.deployed();
   console.log("NFT deployed to:", NFT.address);

   const HotSwapMarketContract = await hre.ethers.getContractFactory(
      "HotSwapMarket"
   );
   const HotSwapMarket = await HotSwapMarketContract.deploy(Market.address);
   await HotSwapMarket.deployed();
   console.log("HotSwapMarket:", HotSwapMarket.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
});
