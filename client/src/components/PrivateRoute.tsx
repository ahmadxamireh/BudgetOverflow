import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { type JSX } from "react";

// define expected props: a single child React element
interface Props {
    children: JSX.Element;
}

export default function PrivateRoute({ children }: Props) {
    // get current user from redux state
    const user = useAppSelector((state) => state.auth.user);

    // get session load status to ensure auth check completed
    const sessionLoaded = useAppSelector((state) => state.auth.sessionLoaded);

    // if session is not loaded yet, return nothing (avoid premature redirect)
    if (!sessionLoaded) return null;

    // if no user is logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // if user exists, allow access to protected children
    return children;
}