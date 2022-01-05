import { create as ipfsHttpClient } from "ipfs-http-client";
import { ethers } from "ethers";
import axios from "axios";
import HotSwapMarket from "../artifacts/contracts/HotSwapMarket.sol/HotSwapMarket.json";
import {
   connection,
   provider,
   signer,
   web3ModalInstance,
} from "/utils/web3Auth";

const IPFS_CLIENT_URL = process.env.IPFS_CLIENT_URL || "";
const IPFS_BASE_URL = process.env.IPFS_BASE_URL || "";
const HOTSWAP_ADDRESS = process.env.HOTSWAP_ADDRESS || "";
const RPC_ENDPOINT = process.env.APP_PUBLIC_WORKSPACE_URL || "";
const ipfsClient = IPFS_CLIENT_URL && ipfsHttpClient(IPFS_CLIENT_URL);
const HotSwapMarketContract =
   signer && new ethers.Contract(HOTSWAP_ADDRESS, HotSwapMarket.abi, signer);

export const getListingPrice = async () => {
   try {
      const listingPrice =
         await HotSwapMarketContract.getListingPrice().toString();
      return listingPrice;
   } catch (error) {
      console.error("Error uploading file: ", error);
   }
};

export const getMintingPrice = async () => {
   try {
      const mintingPrice =
         await HotSwapMarketContract.getMintingPrice().toString();
      return mintingPrice;
   } catch (error) {
      console.error("Error uploading file: ", error);
   }
};

export const ipfsClientAdd = async (
   fileData,
   withProgress = false,
   progressCallBack = (progress) => console.log(`received: ${progress}`)
) => {
   try {
      const addedFile =
         (withProgress &&
            (await ipfsClient.add(fileData, {
               progress: progressCallBack, // Todo show progress to user
            }))) ||
         (await ipfsClient.add(fileData));
      const fileLocation = `${IPFS_BASE_URL}${addedFile.path}`;
      return fileLocation;
   } catch (error) {
      console.error("Error uploading file: ", error);
   }
};

export const mintToken = async (itemUri, amount = 1) => {
   try {
      const HotSwapMarketContract = new ethers.Contract(
         HOTSWAP_ADDRESS,
         HotSwapMarket.abi,
         signer
      );
      const mintingPrice = await getMintingPrice();
      console.log("here", amount, itemUri, [], {
         value: mintingPrice,
      });
      const transaction = await HotSwapMarketContract.mintToken(
         amount,
         itemUri,
         [],
         {
            value: mintingPrice,
         }
      );
      console.log("transaction", transaction);
      const transactionCompleted = await transaction.wait();
      console.log("transactionCompleted", transactionCompleted);
      const event = transactionCompleted.events[0];
      const value = event.args[2];
      const tokenId = value.toNumber();
      return tokenId;
   } catch (error) {
      console.error(error);
   }
};

export const createMarketItem = async (tokenId, price) => {
   try {
      const HotSwapMarketContract = new ethers.Contract(
         HOTSWAP_ADDRESS,
         HotSwapMarket.abi,
         signer
      );
      const priceParsed = ethers.utils.parseUnits(price, "ether");
      const itemId = await HotSwapMarketContract.createMarketItem(
         HOTSWAP_ADDRESS,
         tokenId,
         priceParsed
      );
      return itemId;
   } catch (error) {
      console.error(error);
   }
};

export const listItemForSale = async (itemId, price) => {
   try {
      const listingPrice = await getListingPrice();
      const priceParsed = ethers.utils.parseUnits(price.toString(), "ether");
      const transaction = await HotSwapMarketContract.listItemForSale(
         itemId,
         priceParsed,
         {
            value: listingPrice,
         }
      );
      await transaction.wait();
   } catch (error) {
      console.error(error);
   }
};

export const removeItemFromSale = async (tokenId) => {
   try {
      const listingPrice = await getListingPrice();
      const transaction = await HotSwapMarketContract.removeSaleListing(
         tokenId,
         {
            value: listingPrice,
         }
      );
      await transaction.wait();
   } catch (error) {
      console.error(error);
   }
};

export const executeItemSale = async (marketItem) => {
   try {
      const price = ethers.utils.parseUnits(
         marketItem.price.toString(),
         "ether"
      );
      const transaction = await HotSwapMarketContract.executeMarketSale(
         HOTSWAP_ADDRESS,
         marketItem.itemId,
         {
            value: price,
         }
      );
      await transaction.wait();
   } catch (error) {
      console.error(error);
   }
};

export const fetchItem = async (itemId) => {
   try {
      const fetchedItem = await HotSwapMarketContract.getCollection(itemId);
      return fetchedItem;
   } catch (error) {
      console.error(error);
   }
};

export const mapFetchedItems = async (items) => {
   try {
      const marketItemsMapped = await Promise.all(
         items.map(
            async ({
               price,
               itemId,
               tokenId,
               seller,
               owner,
               sold,
               forSale,
            }) => {
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
   } catch (error) {
      console.error(error);
   }
};

export const fetchMarketItems = async () => {
   try {
      // const provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
      // const HotSwapMarketContract = new ethers.Contract(
      //    HOTSWAP_ADDRESS,
      //    Market.abi,
      //    provider
      // );
      const marketItemsFromResponse =
         await HotSwapMarketContract.fetchMarketItems();
      const mappedItems = await mapFetchedItems(marketItemsFromResponse);
      return mappedItems;
   } catch (error) {
      console.error(error);
   }
};

export const fetchMyItems = async () => {
   try {
      const myItems = await HotSwapMarketContract.fetchMyItems();
      const myItemsMapped = await mapFetchedItems(myItems);
      return myItemsMapped;
   } catch (error) {
      console.error(error);
   }
};

export const createMarketCollection = async (tokenId, price) => {
   try {
      const mintingPrice = await getMintingPrice();
      const priceParsed = ethers.utils.parseUnits(price, "ether");
      const collectionId = await HotSwapMarketContract.createMarketItem(
         HOTSWAP_ADDRESS,
         tokenId,
         priceParsed,
         {
            value: mintingPrice,
         }
      );
      return collectionId;
   } catch (error) {
      console.error(error);
   }
};

export const removeItemFromCollection = async (collectionId, itemId) => {
   try {
      await HotSwapMarketContract.removeItemFromCollection(
         collectionId,
         itemId
      );
   } catch (error) {
      console.error(error);
   }
};
export const addItemToCollection = async (collectionId, itemId) => {
   try {
      await HotSwapMarketContract.addItemToCollection(collectionId, itemId);
   } catch (error) {
      console.error(error);
   }
};

export const fetchCollectionItem = async (collectionId, itemId) => {
   try {
      const fetchedCollectionItem =
         await HotSwapMarketContract.getCollectionItem(collectionId, itemId);
      return fetchedCollectionItem;
   } catch (error) {
      console.error(error);
   }
};

export const fetchCollection = async (collectionId) => {
   try {
      const fetchedCollection = await HotSwapMarketContract.getCollection(
         collectionId
      );
      return fetchedCollection;
   } catch (error) {
      console.error(error);
   }
};

export const getAmountOfCollectionItems = async (collectionId) => {
   try {
      const amountOfItems =
         await HotSwapMarketContract.getAmountOfCollectionItems(collectionId);
      return amountOfItems;
   } catch (error) {
      console.error(error);
   }
};
