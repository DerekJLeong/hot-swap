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
      name: "",
      description: "",
      externalLink: "",
      properties: {},
      price: "",
   });
   const handleFormInputChange = (event) =>
      setFormInput({ ...formInput, [event.target.name]: event.target.value });

   const handleFileChange = async (event) => {
      const fileData = event.target.files[0];
      const fileLocation = await ipfsClientAddWithProgress(fileData);
      setFileUrl(fileLocation);
   };

   const handleCreateNft = async () => {
      const { name, description, externalLink, properties, price } = formInput;
      console.log("formInput", formInput);
      if (!name || !description || !fileUrl)
         return console.error("Missing Info");
      /* first, upload to IPFS */
      const fileData = JSON.stringify({
         image: fileUrl,
         name,
         description,
         externalLink,
         properties,
      });
      const initialPrice = price || 0;
      //TODO LOADING MODAL step 1
      const nftLocation = await ipfsClientAdd(fileData);
      //TODO LOADING MODAL step 2
      const tokenId = await createNft(nftLocation);
      //TODO LOADING MODAL step 3
      await createMarketItem(tokenId, initialPrice);
      //TODO LOADING MODAL steps completed
      router.push("/me");
   };

   return (
      <div className="flex justify-center">
         <form className="w-1/2 flex flex-col pb-12">
            <input
               name="name"
               placeholder="Asset Name"
               className="mt-8 border rounded p-4"
               onChange={handleFormInputChange}
            />
            <textarea
               name="description"
               placeholder="Asset Description"
               className="mt-2 border rounded p-4"
               onChange={handleFormInputChange}
            />
            <input
               name="externalLink"
               placeholder="External Link"
               className="mt-2 border rounded p-4"
               onChange={handleFormInputChange}
            />
            <input
               name="price"
               placeholder="Price"
               className="mt-2 border rounded p-4"
               onChange={handleFormInputChange}
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
               {tokenId ? "NFT Minted Successfully!" : "Initiate Mint"}
            </button>
         </form>
      </div>
   );
};

export default Create;
