import { useState } from "react";
import { useRouter } from "next/router";
import {
   ipfsClientAdd,
   ipfsClientAddWithProgress,
   createNft,
   createMarketItem,
} from "/utils/abi";

const Create = () => {
   const router = useRouter();
   const [tokenId, setTokenId] = useState("");
   const [fileUrl, setFileUrl] = useState(null);
   const [formInput, setFormInput] = useState({
      price: "",
      name: "",
      description: "",
   });

   const handleFileChange = async (event) => {
      const fileData = event.target.files[0];
      const fileLocation = await ipfsClientAddWithProgress(fileData);
      setFileUrl(fileLocation);
   };

   const handleCreateNft = async () => {
      const { name, description, price } = formInput;
      if (!name || !description || !price || !fileUrl)
         return console.error("Missing Info");
      /* first, upload to IPFS */
      const fileData = JSON.stringify({
         name,
         description,
         image: fileUrl,
      });
      const nftLocation = await ipfsClientAdd(fileData);
      const tokenId = await createNft(nftLocation);
      setTokenId(tokenId);
   };

   const handleCreateMarketItem = async () => {
      const { price } = formInput;
      await createMarketItem(tokenId, price);
      router.push("/");
   };

   return (
      <div className="flex justify-center">
         <form className="w-1/2 flex flex-col pb-12">
            <input
               placeholder="Asset Name"
               className="mt-8 border rounded p-4"
               onChange={(e) =>
                  setFormInput({ ...formInput, name: e.target.value })
               }
            />
            <textarea
               placeholder="Asset Description"
               className="mt-2 border rounded p-4"
               onChange={(e) =>
                  setFormInput({ ...formInput, description: e.target.value })
               }
            />
            <input
               placeholder="Asset Price in Eth"
               className="mt-2 border rounded p-4"
               onChange={(e) =>
                  setFormInput({ ...formInput, price: e.target.value })
               }
            />
            <input
               type="file"
               name="Asset"
               className="my-4"
               onChange={handleFileChange}
            />
            {fileUrl && (
               <img className="rounded mt-4" width="350" src={fileUrl} />
            )}
            <button
               type="button"
               disabled={tokenId}
               onClick={handleCreateNft}
               className={`font-bold mt-4 text-white rounded p-4 shadow-lg ${
                  tokenId ? "bg-orange-300" : "bg-orange-500"
               }`}
            >
               {tokenId ? "NFT Created Successfully!" : "Create NFT"}
            </button>
            <button
               type="button"
               disabled={!tokenId}
               onClick={handleCreateMarketItem}
               className={`font-bold mt-4 text-white rounded p-4 shadow-lg ${
                  !tokenId ? "bg-gray-300" : "bg-orange-500"
               }`}
            >
               List On Market
            </button>
         </form>
      </div>
   );
};

export default Create;
