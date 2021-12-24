import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchMyNFTs, listNftForSale, removeSaleListing } from "/utils/abi";

const getMarketStatus = (nft) =>
   nft.sold ? "Sold" : nft.forSale ? "Remove Listing" : "List For Sale";

const Create = () => {
   const router = useRouter();
   const [nfts, setNfts] = useState([]);
   const [isLoading, setLoadingState] = useState(false);

   const handleLoadNfts = async () => {
      !isLoading && setLoadingState(true);
      const marketItems = await fetchMyNFTs();
      setNfts(marketItems);
      setLoadingState(false);
   };

   const handleListNftForSale = async (nft) => {
      const { tokenId, price } = nft;
      // const { price } = formInput;
      const convertedPrice = price ? Number(price) : 1; //TODO if no price enter price
      await listNftForSale(tokenId, convertedPrice);
      router.push("/");
   };

   const handleRemoveSaleListing = async (nft) => {
      if (nft.sold) return;
      const { tokenId } = nft;
      await removeSaleListing(tokenId);
      router.push("/");
   };

   const handleCardButtonClick = (nft) => {
      nft.forSale ? handleRemoveSaleListing(nft) : handleListNftForSale(nft);
   };

   useEffect(() => {
      handleLoadNfts();
   }, []);

   console.log("My NFTs", nfts);
   return (
      <div className="flex justify-center">
         <main className="w-full mr-10 ml-10 max-w-screen-2xl">
            <section className="grid grid-flow-row gap-4 pt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
               <h2 className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 mt-4 mb-6 font-bold text-center text-xl text-orange-500">
                  Your Digital Assets
               </h2>
               {!isLoading && !nfts.length && (
                  <h2 className="">
                     No items currently associated with account
                  </h2>
               )}
               {!isLoading &&
                  nfts.length &&
                  nfts.map((nft, index) => (
                     <div
                        className="border shadow rounded-xl overflow-hidden max-w-l h-fit bg-gray-100"
                        key={index}
                     >
                        <img src={nft.image} />
                        <div className="p-4">
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
                                 onClick={() => handleCardButtonClick(nft)}
                              >
                                 {getMarketStatus(nft)}
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
            </section>
         </main>

         <footer className=""></footer>
      </div>
   );
};

export default Create;
