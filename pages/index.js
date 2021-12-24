import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { purchaseNft, loadNFTs } from "/utils/abi";

const Home = () => {
   const [nfts, setNfts] = useState([]);
   const [isLoading, setLoadingState] = useState(false);

   const handleLoadNfts = async () => {
      !isLoading && setLoadingState(true);
      const marketItems = await loadNFTs();
      setNfts(marketItems);
      setLoadingState(false);
   };

   const handlePurchaseNft = async (nft) => {
      if (nft.sold) return;
      !isLoading && setLoadingState(true);
      await purchaseNft(nft);
      handleLoadNfts();
   };

   useEffect(() => {
      handleLoadNfts();
   }, []);

   console.log("NFTS on Market", nfts);
   return (
      <div className="flex justify-center">
         <main className="w-full mr-10 ml-10 max-w-screen-2xl">
            <section className="grid grid-flow-row gap-4 pt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
               <h2 className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 mt-4 mb-6 font-bold text-center text-xl text-orange-500">
                  Welcome to the Market!
               </h2>
               {!isLoading && !nfts.length && (
                  <h2 className="">No items currently for sale</h2>
               )}
               {!isLoading &&
                  nfts.length &&
                  nfts.map(
                     (nft, index) =>
                        nft.forSale && (
                           <div
                              className="border shadow rounded-xl overflow-hidden max-w-l h-fit bg-gray-100"
                              key={index}
                           >
                              <img src={nft.image} />
                              <div className="">
                                 <h3 className="h12 text-2xl font-semibold">
                                    {nft.name}
                                 </h3>
                                 <p className="h24 p-4 overflow-hidden">
                                    {nft.description}
                                 </p>
                                 <div className="bg-white p-4 rounded-lg">
                                    <p className="text-gray-600 text-2xl font-bold mb-4 text-center">
                                       {nft.price} Matic
                                    </p>
                                    <button
                                       className="w-full bg-orange-500 text-white font-bold py-2 px-12 rounded shadow"
                                       onClick={() => handlePurchaseNft(nft)}
                                    >
                                       {nft.sold ? "Sold" : "Buy"}
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )
                  )}
            </section>
         </main>

         <footer className=""></footer>
      </div>
   );
};

export default Home;
