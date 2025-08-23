import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./state/authSlice";
import registerReducer from "./components/Register/registerSlice"
import loginReducer from "./components/Login/loginSlice";
import transactionsReducer from "./components/Transactions/transactionsSlice";
import categoriesReducer from "./components/Categories/categoriesSlice";

// configure and export the redux store with all feature slices
export const store = configureStore({
    reducer: {
        auth: authReducer, // handles user session state
        register: registerReducer, // handles register form state
        login: loginReducer, // handles login form state
        transactions: transactionsReducer, // handles transaction state
        categories: categoriesReducer // handles category state
    }
});

// define and export the global state shape type
export type RootState = ReturnType<typeof store.getState>;

// define and export the dispatch type for usage in components
export type AppDispatch = typeof store.dispatch;