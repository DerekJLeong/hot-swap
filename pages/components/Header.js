import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { initWeb3Auth, removeAccountData } from "/utils/web3Auth";
import { useGlobalState, useDispatch } from "/utils/store";
import { removeCookie } from "/utils/cookie";

const Header = ({}) => {
   const router = useRouter();
   const globalState = useGlobalState();
   const dispatch = useDispatch();
   const activeUser = !!globalState.user?.accounts?.length;

   const handleWeb3Login = async () => {
      const user = await initWeb3Auth();
      const action = { type: "SET_USER", payload: user };
      dispatch(action);
   };

   const handleWeb3Logout = async () => {
      await removeAccountData();
      const action = { type: "RESET" };
      dispatch(action);
      removeCookie("persistedState");
      router.push("/me");
   };

   useEffect(() => {
      !activeUser && handleWeb3Login();
   }, []);

   return (
      <header className="border-b p-6">
         <h1 className="text-4xl font-bold">Hot Swap</h1>
         <nav className="flex mt-4">
            <Link href="/">
               <a className="mr-6 font-semibold text-l text-orange-500">Home</a>
            </Link>
            <Link href="/me">
               <a className="mr-6 font-semibold text-l text-orange-500">
                  My Assets
               </a>
            </Link>
            <Link href="/create">
               <a className="mr-6 font-semibold text-l text-orange-500">
                  Create
               </a>
            </Link>
            <a
               onClick={handleWeb3Logout}
               hidden={!activeUser}
               role="button"
               className="mr-6 font-semibold text-l text-orange-500"
            >
               Logout
            </a>
         </nav>
      </header>
   );
};

export default Header;
