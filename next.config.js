module.exports = {
   reactStrictMode: true,
   env: {
      APP_PUBLIC_WORKSPACE_URL: process.env.APP_PUBLIC_WORKSPACE_URL,
      MARKET_ADDRESS: process.env.MARKET_ADDRESS,
      NFT_ADDRESS: process.env.NFT_ADDRESS,
      IPFS_CLIENT_URL: process.env.IPFS_CLIENT_URL,
      IPFS_BASE_URL: process.env.IPFS_BASE_URL,
      INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
   },
   images: {
      domains: [process.env.IPFS_HOSTNAME],
   },
};
