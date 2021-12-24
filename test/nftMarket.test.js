const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
   it("Should create and execute market sales", async function () {
      const Market = await ethers.getContractFactory("Market");
      const market = await Market.deploy();
      await market.deployed();
      const marketAddress = market.address;

      const NFTContract = await ethers.getContractFactory("NFT");
      const nft = await NFTContract.deploy(marketAddress);
      await nft.deployed();
      const nftContractAddress = nft.address;

      const listingPrice = await market.getListingPrice();
      const listingPriceString = listingPrice.toString();

      const auctionPrice = ethers.utils.parseUnits("1", "ether");

      const token1 = "https://www.mytokenlocation1.com";
      const token2 = "https://www.mytokenlocation2.com";
      await nft.createToken(token1);
      await nft.createToken(token2);

      await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
         value: listingPriceString,
      });
      await market.createMarketItem(nftContractAddress, 2, auctionPrice, {
         value: listingPriceString,
      });

      const createdNfts = await market.fetchMyItems();
      console.log("Created NFTs", createdNfts);
      expect(createdNfts.length).to.equal(2);

      const [_, buyerAddress] = await ethers.getSigners();
      await market
         .connect(buyerAddress)
         .createMarketSale(nftContractAddress, 1, { value: auctionPrice });
      const marketItems = await market.fetchMarketItems();
      expect(marketItems.length).to.equal(1);

      const marketItemsWithUri = await Promise.all(
         marketItems.map(async ({ price, tokenId, seller, owner }) => {
            const tokenUri = await nft.tokenURI(tokenId);
            const nftData = {
               price: price.toString(),
               tokenId: tokenId.toString(),
               seller: seller,
               owner: owner,
               tokenUri,
            };
            return nftData;
         })
      );
      const firstMarketItem = marketItemsWithUri[0];
      console.log("First Market Item", firstMarketItem);
      expect(firstMarketItem.tokenUri).to.equal(token2);
      expect(firstMarketItem.tokenId).to.equal("2");
   });
});
