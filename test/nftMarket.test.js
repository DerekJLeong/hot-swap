const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
   it("Should create and execute market sales", async function () {
      // Deploy Market Contract
      const Market = await ethers.getContractFactory("Market");
      const market = await Market.deploy();
      await market.deployed();
      const marketAddress = market.address;

      // Deploy NFT Contract
      const NFTContract = await ethers.getContractFactory("NFT");
      const nft = await NFTContract.deploy(marketAddress);
      await nft.deployed();
      const nftContractAddress = nft.address;

      // Mint Tokens and Add them to the market
      const listingPrice = await market.getListingPrice();
      const listingPriceString = listingPrice.toString();
      const auctionPrice = ethers.utils.parseUnits("1", "ether");
      const token1 = "https://www.mytokenlocation1.com";
      const token2 = "https://www.mytokenlocation2.com";
      await nft.createToken(token1);
      await nft.createToken(token2);
      await market.createMarketItem(nftContractAddress, 1, 0, {
         value: listingPriceString,
      });
      await market.createMarketItem(nftContractAddress, 2, auctionPrice, {
         value: listingPriceString,
      });

      // Fetch newly created NFTs on the market
      const createdNfts = await market.fetchMyItems();
      console.log("Created NFTs", createdNfts);
      expect(createdNfts.length).to.equal(2);

      //List Item For Sale On Market
      const itemToSell = createdNfts[0];
      const salePrice = ethers.utils.parseUnits("42", "ether");
      await market.listItemForSale(itemToSell.itemId, salePrice, {
         value: listingPriceString,
      });
      const marketItems1 = await market.fetchMarketItems();
      expect(marketItems1.length).to.equal(2);
      console.log("Item Listed For Sale", marketItems1);

      // Execute Market Sale of Listed Item
      const [_, buyerAddress] = await ethers.getSigners();
      await market
         .connect(buyerAddress)
         .executeMarketSale(nftContractAddress, 1, {
            value: salePrice,
         });
      const marketItems2 = await market.fetchMarketItems();
      expect(marketItems2.length).to.equal(1);
      console.log("Item Sale Executed", marketItems2);
      const marketItemsWithUri = await Promise.all(
         marketItems2.map(
            async ({ price, tokenId, seller, owner, forSale, sold }) => {
               const tokenUri = await nft.tokenURI(tokenId);
               const nftData = {
                  price: price.toString(),
                  tokenId: tokenId.toString(),
                  seller: seller,
                  owner: owner,
                  tokenUri,
                  forSale,
                  sold,
               };
               return nftData;
            }
         )
      );
      const firstMarketItem = marketItemsWithUri[0];
      console.log("First Market Item", firstMarketItem);
      expect(firstMarketItem.tokenUri).to.equal(token2);
      expect(firstMarketItem.tokenId).to.equal("2");
      expect(firstMarketItem.forSale).to.equal(false);
      expect(firstMarketItem.sold).to.equal(false);
   });
});
