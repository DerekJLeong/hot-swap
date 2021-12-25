import { useContext, useEffect, useReducer, createContext } from "react";
import { setCookie } from "/utils/cookie";

export const GlobalStateContext = createContext();
export const DispatchContext = createContext();

const modal = "";
const user = {};
const web3Auth = { provider: null, web3Provider: null };
const initialState = { user, modal, web3Auth };

const buildIntialPersistedState = (stateInCookie) => ({
   ...initialState,
   ...stateInCookie,
});

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
      // case "SET_WEB3_AUTH":
      //    return { ...globalState, web3Auth: action.payload };
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

export const GlobalStateProvider = ({ children, persistedState }) => {
   const intialPersistedState = buildIntialPersistedState(persistedState);
   const [globalState, dispatch] = useReducer(reducer, intialPersistedState);

   useEffect(() => {
      const currentState = globalState;
      delete currentState.web3Auth;
      setCookie("persistedState", JSON.stringify(currentState));
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
