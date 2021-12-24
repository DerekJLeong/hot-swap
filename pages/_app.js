import "../styles/globals.css";
import Link from "next/link";

function MyApp({ Component, pageProps }) {
   return (
      <>
         <header className="border-b p-6">
            <h1 className="text-4xl font-bold">Hot Swap</h1>
            <nav className="flex mt-4">
               <Link href="/">
                  <a className="mr-6 font-semibold text-l text-orange-500">
                     Home
                  </a>
               </Link>
               <Link href="/me">
                  <a className="mr-6 font-semibold text-l text-orange-500">
                     My Assets
                  </a>
               </Link>
               <Link href="/sell">
                  <a className="mr-6 font-semibold text-l text-orange-500">
                     Sell
                  </a>
               </Link>
               <Link href="/create">
                  <a className="mr-6 font-semibold text-l text-orange-500">
                     Create
                  </a>
               </Link>
            </nav>
         </header>
         <Component {...pageProps} />
      </>
   );
}

export default MyApp;
