import { useContext, useEffect, useReducer, createContext } from "react";
import { setCookie } from "/utils/cookie";

export const GlobalStateContext = createContext();
export const DispatchContext = createContext();

const modal = "";
const emptyUser = { address: "", chainId: "" };
// const web3Auth = {
//    web3ModalInstance: null,
//    connection: null,
//    provider: null,
//    signer: null,
// };
const contract = {};
const initialState = { user: emptyUser, modal, contract };

const buildIntialPersistedState = (user, contract) => {
   const initialState = window && window.localStorage.getItem("persistedState");
   return {
      ...initialState,
      user,
      contract,
   };
};

export const reducer = (globalState, action) => {
   switch (action.type) {
      case "RESET":
         return initialState;
      case "INIT":
         return {
            ...globalState,
            ...action.payload.clientState,
            ...action.payload.storageReturn,
         };
      case "STORE":
         return { ...globalState, ...action.payload };
      case "SET_CONTRACT":
         return { ...globalState, contract: action.payload };
      // case "RESET_WEB3_AUTH":
      //    return { ...globalState, web3Auth };
      case "SET_USER":
         return { ...globalState, user: action.payload };
      case "RESET_USER":
         return { ...globalState, user };
      case "SET_MODAL":
         return { ...globalState, modal: action.payload || "" };
      default:
         throw new Error(`Unhandled action type: ${action.type}`);
   }
};

export const GlobalStateProvider = ({
   children,
   persistedUser,
   marketContract,
}) => {
   const [globalState, dispatch] = useReducer(reducer, initialState);

   useEffect(() => {
      const intialPersistedState = buildIntialPersistedState(
         persistedUser,
         marketContract
      );
      dispatch({ type: "STORE", payload: intialPersistedState });
   }, [persistedUser, marketContract]);
   useEffect(() => {
      const state = globalState;
      delete state.user;
      delete state.contract;
      localStorage.setItem("peristedState", JSON.stringify(state));
   }, [globalState]);

   return (
      <GlobalStateContext.Provider value={globalState}>
         <DispatchContext.Provider value={dispatch}>
            {children}
         </DispatchContext.Provider>
      </GlobalStateContext.Provider>
   );
};

export const useGlobalState = () => {
   const state = useContext(GlobalStateContext);
   if (state == null) {
      throw new Error("useGlobalState must be used within a GlobalProvider");
   }
   return state;
};

export const useDispatch = () => {
   const dispatch = useContext(DispatchContext);
   if (dispatch == null) {
      throw new Error("useDispatch must be used within a GlobalProvider");
   }
   return dispatch;
};
