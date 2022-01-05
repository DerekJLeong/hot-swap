import { useEffect, useCallback } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletLink from "walletlink";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import HotSwapMarket from "../artifacts/contracts/HotSwapMarket.sol/HotSwapMarket.json";

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const providerOptions = {
   walletconnect: {
      package: WalletConnectProvider,
      options: {
         infuraId: INFURA_PROJECT_ID,
      },
   },
   "custom-walletlink": {
      display: {
         logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
         name: "Coinbase",
         description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      options: {
         appName: "Coinbase",
         networkUrl: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
         chainId: 1,
      },
      package: WalletLink,
      connector: async (_, options) => {
         const { appName, networkUrl, chainId } = options;
         const walletLink = new WalletLink({
            appName,
         });
         const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
         await provider.enable();
         return provider;
      },
   },
};

export let connection;
export let signer;
export let provider;
export let web3ModalInstance;

export const connect = async () => {
   web3ModalInstance = new Web3Modal({
      cacheProvider: true,
      providerOptions,
   });
   // connection that is returned when
   // using web3Modal to connect. Can be MetaMask or WalletConnect.
   try {
      connection = await web3ModalInstance.connect();
      // We plug the initial `provider` into ethers.js and get back
      // a Web3Provider. This will add on methods from ethers.js and
      // event listeners such as `.on()` will be different.
      provider = new ethers.providers.Web3Provider(connection);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const { chainId } = network;
      const HotSwapMarketContract = new ethers.Contract(
         process.env.HOTSWAP_ADDRESS,
         HotSwapMarket.abi,
         signer
      );
      return {
         user: { address, chainId },
         web3Auth: { web3ModalInstance, connection, provider, signer },
         HotSwapMarketContract,
      };
   } catch (error) {
      return console.error("Could not get a wallet connection", error);
   }
};

export const connectCachedProvider = async () => {
   web3ModalInstance = new Web3Modal({
      cacheProvider: true,
      providerOptions,
   });
   const cachedProviderName = JSON.parse(
      localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")
   );
   const cachedProvider = web3ModalInstance.providerController.providers.find(
      ({ id }) => id === cachedProviderName
   );
   connection = await cachedProvider.connector(); // Some connector may need providerPackage and opts
   provider = new ethers.providers.Web3Provider(connection); // If you use web3, then const web3 = new Web3(proxy);
   signer = provider.getSigner();
   const address = await signer.getAddress();
   const network = await provider.getNetwork();
   const { chainId } = network;
   const HotSwapMarketContract = new ethers.Contract(
      process.env.HOTSWAP_ADDRESS,
      HotSwapMarket.abi,
      signer
   );
   return {
      user: { address, chainId },
      web3Auth: { web3ModalInstance, connection, provider, signer },
      HotSwapMarketContract,
   };
};

export const disconnect = async () => {
   if (!web3ModalInstance) {
      web3ModalInstance = new Web3Modal({
         cacheProvider: true,
         disableInjectedProvider: true,
         providerOptions,
      });
   }
   await web3ModalInstance.clearCachedProvider();
   if (provider?.disconnect && typeof provider.disconnect === "function") {
      await provider.disconnect();
   }
};
