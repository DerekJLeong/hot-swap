import { useContext, useEffect, useReducer, createContext } from "react";
import { setCookie } from "/utils/cookie";

export const GlobalStateContext = createContext();
export const DispatchContext = createContext();

const modal = "";
const user = {};
const initialState = { user, modal };
const buildIntialPersistedState = (stateInCookie) => {
   console.log("stateInCookie", stateInCookie);
   const intialPersistedState = { ...initialState, ...stateInCookie };
   return intialPersistedState;
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
      case "SET_USER":
         return { ...globalState, user: action.payload };
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
      setCookie("persistedState", JSON.stringify(globalState));
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
