import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Market from "../artifacts/contracts/Market.sol/Market.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

const IPFS_CLIENT_URL = process.env.IPFS_CLIENT_URL || "";
const IPFS_BASE_URL = process.env.IPFS_BASE_URL || "";
const NFT_ADDRESS = process.env.NFT_ADDRESS || "";
const MARKET_ADDRESS = process.env.MARKET_ADDRESS || "";
const RPC_ENDPOINT = process.env.APP_PUBLIC_WORKSPACE_URL || "";
const ipfsClient = IPFS_CLIENT_URL && ipfsHttpClient(IPFS_CLIENT_URL);

export const ipfsClientAddWithProgress = async (fileData) => {
   try {
      const addedFile = await ipfsClient.add(fileData, {
         progress: (progress) => console.log(`received: ${progress}`), // TODO show progress to user
      });
      const fileLocation = `${IPFS_BASE_URL}${addedFile.path}`;
      console.log("fileLocation", fileLocation);
      return fileLocation;
   } catch (error) {
      console.error("Error uploading file: ", error);
   }
};

export const ipfsClientAdd = async (fileData) => {
   try {
      const addedFile = await ipfsClient.add(fileData);
      const fileLocation = `${IPFS_BASE_URL}${addedFile.path}`;
      console.log("fileLocation", fileLocation);
      return fileLocation;
   } catch (error) {
      console.error("Error uploading file: ", error);
   }
};

export const createMarketItem = async (tokenId, price) => {
   const web3Modal = new Web3Modal();
   const connection = await web3Modal.connect();
   const provider = new ethers.providers.Web3Provider(connection);
   const signer = provider.getSigner();
   /* list the item for sale on the marketplace */
   const marketContract = new ethers.Contract(
      MARKET_ADDRESS,
      Market.abi,
      signer
   );
   const priceParsed = ethers.utils.parseUnits(price, "ether");
   const listingPrice = await marketContract.getListingPrice();
   const listingPriceString = listingPrice.toString();
   const transaction = await marketContract.createMarketItem(
      NFT_ADDRESS,
      tokenId,
      priceParsed,
      {
         value: listingPriceString,
      }
   );
   await transaction.wait();
};

export const createNft = async (url) => {
   const web3Modal = new Web3Modal();
   const connection = await web3Modal.connect();
   const provider = new ethers.providers.Web3Provider(connection);
   const signer = provider.getSigner();

   /* create the item */
   const nftContract = new ethers.Contract(NFT_ADDRESS, NFT.abi, signer);
   let transaction = await nftContract.mintToken(url);
   const transactionCompleted = await transaction.wait();
   const event = transactionCompleted.events[0];
   const value = event.args[2];
   const tokenId = value.toNumber();
   return tokenId;
};

export const listNftForSale = async (tokenId, price) => {
   const web3Modal = new Web3Modal();
   const connection = await web3Modal.connect();
   const provider = new ethers.providers.Web3Provider(connection);
   const signer = provider.getSigner();
   /* list the item for sale on the marketplace */
   const marketContract = new ethers.Contract(
      MARKET_ADDRESS,
      Market.abi,
      signer
   );
   const listingPrice = await marketContract.getListingPrice();
   const listingPriceString = listingPrice.toString();
   const priceParsed = ethers.utils.parseUnits(price.toString(), "ether");
   const transaction = await marketContract.listItemForSale(
      tokenId,
      priceParsed,
      {
         value: listingPriceString,
      }
   );
   await transaction.wait();
};

export const removeSaleListing = async (tokenId) => {
   const web3Modal = new Web3Modal();
   const connection = await web3Modal.connect();
   const provider = new ethers.providers.Web3Provider(connection);
   const signer = provider.getSigner();
   /* list the item for sale on the marketplace */
   const marketContract = new ethers.Contract(
      MARKET_ADDRESS,
      Market.abi,
      signer
   );
   const listingPrice = await marketContract.getListingPrice();
   const listingPriceString = listingPrice.toString();
   const transaction = await marketContract.removeSaleListing(tokenId, {
      value: listingPriceString,
   });
   await transaction.wait();
};

export const purchaseNft = async (nft) => {
   const web3Modal = new Web3Modal();
   const connection = await web3Modal.connect();
   const provider = new ethers.providers.Web3Provider(connection);
   const signer = provider.getSigner();
   const marketContract = new ethers.Contract(
      MARKET_ADDRESS,
      Market.abi,
      signer
   );

   const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
   const transaction = await marketContract.executeMarketSale(
      NFT_ADDRESS,
      nft.itemId,
      {
         value: price,
      }
   );
   await transaction.wait();
};

export const loadNFTs = async () => {
   const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
   const tokenContract = new ethers.Contract(NFT_ADDRESS, NFT.abi, provider);
   const marketContract = new ethers.Contract(
      MARKET_ADDRESS,
      Market.abi,
      provider
   );
   const marketItemsFromResponse = await marketContract.fetchMarketItems();

   const marketItemsMapped = await Promise.all(
      marketItemsFromResponse.map(
         async ({ price, itemId, tokenId, seller, owner, sold, forSale }) => {
            const tokenUri = await tokenContract.tokenURI(tokenId);
            const meta = await axios.get(tokenUri);
            const metaData = meta?.data;
            const {
               image,
               name,
               description,
               externalLink,
               collection,
               properties,
            } = metaData;
            const priceFormatted = ethers.utils.formatUnits(
               price.toString(),
               "ether"
            );
            const nftData = {
               price: priceFormatted,
               itemId: itemId.toNumber(),
               seller: seller,
               owner: owner,
               externalLink,
               description,
               collection,
               properties,
               tokenUri,
               forSale,
               image,
               name,
               sold,
            };
            return nftData;
         }
      )
   );
   return marketItemsMapped;
};

export const fetchMyNFTs = async () => {
   const web3Modal = new Web3Modal();
   const connection = await web3Modal.connect();
   const provider = new ethers.providers.Web3Provider(connection);
   const signer = provider.getSigner();

   const marketContract = new ethers.Contract(
      MARKET_ADDRESS,
      Market.abi,
      signer
   );
   const tokenContract = new ethers.Contract(NFT_ADDRESS, NFT.abi, provider);
   const myNfts = await marketContract.fetchMyItems();

   const myNFTsMapped = await Promise.all(
      myNfts.map(async ({ price, tokenId, seller, owner, sold, forSale }) => {
         const tokenUri = await tokenContract.tokenURI(tokenId);
         const meta = await axios.get(tokenUri);
         const metaData = meta?.data;
         const {
            image,
            name,
            description,
            externalLink,
            collection,
            properties,
         } = metaData;
         const priceFormatted = ethers.utils.formatUnits(
            price.toString(),
            "ether"
         );
         const nftData = {
            price: priceFormatted,
            tokenId: tokenId.toNumber(),
            seller: seller,
            owner: owner,
            image,
            name,
            collection,
            description,
            sold,
            forSale,
            externalLink,
            properties,
         };
         return nftData;
      })
   );
   return myNFTsMapped;
};
