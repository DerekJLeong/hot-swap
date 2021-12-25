import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const providerOptions = {
   walletconnect: {
      package: WalletConnectProvider,
      options: {
         infuraId: INFURA_PROJECT_ID,
      },
   },
};

let web3Modal;
let provider;

export const initWeb3Auth = async () => {
   web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
   });
   try {
      provider = await web3Modal.connect();
   } catch (error) {
      return console.error("Could not get a wallet connection", error);
   }

   // Subscribe to accounts change
   provider.on("accountsChanged", (accounts) => {
      fetchAccountData();
   });

   // Subscribe to chainId change
   provider.on("chainChanged", (chainId) => {
      fetchAccountData();
   });
   return fetchAccountData();
};

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
const fetchAccountData = async () => {
   // Get a Web3 instance for the wallet
   const web3 = new Web3(provider);
   console.log("Web3 instance is", web3);
   // Get connected chain id from Ethereum node
   const chainId = await web3.eth.getChainId();
   // Get accounts on wallet
   // MetaMask does not give you all accounts, only the selected account
   const accounts = await web3.eth.getAccounts();
   return { accounts, chainId };
};

export const removeAccountData = async () => {
   if (provider.disconnect) {
      await provider.disconnect();
      // If the cached provider is not cleared,
      // WalletConnect will default to the existing session
      // and does not allow to re-scan the QR code with a new wallet.
      // Depending on your use case you may want or want not his behavir.
      await web3Modal.clearCachedProvider();
   }
   provider = null;
   web3Modal = null;
   console.log("out");
};
