import { useState } from "react";
import { useRouter } from "next/router";
// import {
// ipfsClientAdd,
// ipfsClientAddWithProgress,
// createNft,
// createMarketItem,
// } from "/utils/abi";s
import { ipfsClientAdd, mintToken, createMarketItem } from "/utils/abi2";

const Create = () => {
   const router = useRouter();
   // const [tokenId, setTokenId] = useState("");
   const [fileUrl, setFileUrl] = useState(null);
   const [formInput, setFormInput] = useState({
      name: "",
      description: "",
      externalLink: "",
      collection: "",
      addedKey: "",
      addedValue: "",
      // price: "",
   });
   const [itemProperties, setItemProperties] = useState({});
   const handleFormInputChange = (event) =>
      setFormInput({ ...formInput, [event.target.name]: event.target.value });

   const handleFileChange = async (event) => {
      const fileData = event.target.files[0];
      const fileLocation = await ipfsClientAdd(fileData, true);
      setFileUrl(fileLocation);
   };

   const handleCreateNft = async () => {
      const { name, collection, description, externalLink, price } = formInput;
      console.log("formInput", formInput);
      if (!name || !description || !fileUrl)
         return console.error("Missing Info");
      /* first, upload to IPFS */
      const fileData = JSON.stringify({
         image: fileUrl,
         name,
         description,
         externalLink,
         collection,
         properties: itemProperties,
      });
      const initialPrice = price || 0;
      //TODO LOADING MODAL step 1
      const nftLocation = await ipfsClientAdd(fileData);
      //TODO LOADING MODAL step 2

      console.log("nftLocation", nftLocation);
      const tokenId = await mintToken(nftLocation);
      //TODO LOADING MODAL step 3
      const itemId = await createMarketItem(tokenId, initialPrice);
      //TODO LOADING MODAL steps completed
      console.log("itemId", itemId);
      // router.push("/me");
   };

   const handleAddKeyValue = () => {
      const { addedKey, addedValue } = formInput;
      if (!addedKey || !addedValue)
         return console.error("Value or Key is Missing/Invalid");
      setItemProperties({ ...itemProperties, [addedKey]: addedValue });
      setFormInput({ ...formInput, addedKey: "", addedValue: "" });
   };

   return (
      <div className="flex justify-center">
         <form className="w-1/2 flex flex-col pb-12">
            <input
               name="name"
               value={formInput.name}
               placeholder="Asset Name"
               className="mt-8 border rounded p-4"
               onChange={handleFormInputChange}
            />
            <textarea
               name="description"
               value={formInput.description}
               placeholder="Asset Description"
               className="mt-2 border rounded p-4"
               onChange={handleFormInputChange}
            />
            <input
               name="externalLink"
               value={formInput.externalLink}
               placeholder="External Link"
               className="mt-2 border rounded p-4"
               onChange={handleFormInputChange}
            />
            <input
               name="collection"
               value={formInput.collection}
               placeholder="Collection"
               className="mt-2 border rounded p-4"
               onChange={handleFormInputChange}
            />
            <div>
               <input
                  name="addedKey"
                  value={formInput.addedKey}
                  placeholder="Property Key"
                  className="mt-2 border rounded p-4"
                  onChange={handleFormInputChange}
               />
               <input
                  name="addedValue"
                  value={formInput.addedValue}
                  placeholder="Property Value"
                  className="mt-2 border rounded p-4"
                  onChange={handleFormInputChange}
               />
               <button
                  type="button"
                  disabled={false}
                  onClick={handleAddKeyValue}
                  className={`font-bold mt-4 text-white rounded p-4 shadow-lg bg-orange-500`}
               >
                  Add Property
               </button>
               {Object.keys(itemProperties)?.length > 0 && (
                  <div>
                     {Object.keys(itemProperties).map((key, i) => (
                        <div key={i}>
                           <p>{`${key}: ${itemProperties[key]}`}</p>
                        </div>
                     ))}
                  </div>
               )}
               <div></div>
            </div>
            {/* <input
               name="price"
               value={formInput.price}
               placeholder="Price"
               className="mt-2 border rounded p-4"
               onChange={handleFormInputChange}
            /> */}

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
               disabled={false}
               onClick={handleCreateNft}
               className={`font-bold mt-4 text-white rounded p-4 shadow-lg bg-orange-500`}
            >
               {false ? "NFT Minted Successfully!" : "Initiate Mint"}
            </button>
         </form>
      </div>
   );
};

export default Create;
