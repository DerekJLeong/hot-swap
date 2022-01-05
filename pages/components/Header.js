import { useEffect } from "react";
import { useRouter } from "next/router";
import { useGlobalState, useDispatch } from "/utils/store";
import { connection, connect, disconnect } from "/utils/web3Auth";
import { removeCookie } from "/utils/cookie";
import Link from "next/link";

const Header = ({}) => {
   const router = useRouter();
   const globalState = useGlobalState();
   const dispatch = useDispatch();
   const activeUser =
      !!globalState.user?.address && !!globalState.user?.chainId;

   const handleLogout = async () => {
      await disconnect();
      removeCookie("persistedState");
      router.reload();
      router.push("/");
   };

   // useEffect(async () => {
   //    if (web3ModalInstance?.cachedProvider) {
   //       console.log("WOOOOOOOW");
   //       const authData = await connect();
   //       setCookie(
   //          "persistedState",
   //          JSON.stringify({ ...persistedState, user: authData })
   //       );
   //       !loggedIn && router.reload();
   //    }
   // }, [connect]);
   // A `provider` should come with EIP-1193 events. We'll listen for those events
   // here so that when a user switches accounts or networks, we can update the
   // local React state with that new information.
   useEffect(() => {
      if (connection?.on) {
         const handleAccountsChanged = async (accounts) => {
            console.log("accountsChanged", accounts);
            const network = await web3Provider.getNetwork();
            dispatch({
               type: "SET_USER",
               payload: { address: accounts[0], chainId: network.chainId },
            });
         };

         // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
         const handleChainChanged = (hexChainId) => {
            router.reload();
         };

         const handleDisconnect = (error) => {
            console.log("disconnect", error);
            disconnect();
            removeCookie("persistedState");
            dispatch({
               type: "RESET_USER",
            });
            dispatch({
               type: "RESET_WEB3_AUTH",
            });
            router.push("/");
         };

         connection.on("accountsChanged", handleAccountsChanged);
         connection.on("chainChanged", handleChainChanged);
         connection.on("disconnect", handleDisconnect);

         // Subscription Cleanup
         return () => {
            if (connection.removeListener) {
               connection.removeListener(
                  "accountsChanged",
                  handleAccountsChanged
               );
               connection.removeListener("chainChanged", handleChainChanged);
               connection.removeListener("disconnect", handleDisconnect);
            }
         };
      }
   }, [connection, disconnect]);

   console.log("globalState", globalState);
   return (
      <header className="border-b p-6">
         <h1 className="text-4xl font-bold">Hot Swap</h1>
         <nav className="flex mt-4">
            <Link href="/">
               <a className="mr-6 font-semibold text-l text-orange-500">Home</a>
            </Link>
            <Link href="/market">
               <a className="mr-6 font-semibold text-l text-orange-500">
                  Marketplace
               </a>
            </Link>
            <Link href="/me">
               <a className="mr-6 font-semibold text-l text-orange-500">
                  My Collection
               </a>
            </Link>
            <Link href="/create">
               <a className="mr-6 font-semibold text-l text-orange-500">
                  Create
               </a>
            </Link>
            <a
               onClick={handleLogout}
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
