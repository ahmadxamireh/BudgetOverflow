import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/Landing/LandingPage";
import RegisterPage from "./components/Register/RegisterPage";
import LoginPage from "./components/Login/LoginPage";
import Dashboard from "./components/Dashboard/Dashboard";
import TransactionsPage from "./components/Transactions/TransactionsPage";
import SettingsPage from "./components/Settings/SettingsPage";
import PrivateRoute from "./components/PrivateRoute";
import { store } from "./store";
import { setSessionLoaded, setUser } from "./state/authSlice";
import { getCurrentUser } from "./api/auth";

function App() {
    // run once on mount to try restoring session
    useEffect(() => {
        // attempt to get current user from backend (auth cookie must be set)
        getCurrentUser()
            // update redux user state if successful
            .then((user) => store.dispatch(setUser(user)))
            .catch((err) => {
                // ignore unauthenticated error, log unexpected ones
                if (err.message !== "Not authenticated") {
                    console.error("User restore failed:", err);
                }
            })
            // always mark session as loaded
            .finally(() => store.dispatch(setSessionLoaded()));
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <LandingPage/> }/>
                <Route path="/register" element={ <RegisterPage/> }/>
                <Route path="/login" element={ <LoginPage/> }/>
                <Route path="/dashboard" element={ <PrivateRoute><Dashboard/></PrivateRoute> }/>
                <Route path="/transactions" element={ <PrivateRoute><TransactionsPage/></PrivateRoute> }/>
                <Route path="/settings" element={ <PrivateRoute><SettingsPage/></PrivateRoute> }/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;