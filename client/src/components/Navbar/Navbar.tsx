import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import logo from "../../assets/logo.png";
import avatar from "../../assets/avatar.png";
import { useAppSelector } from "../../hooks";
import { logoutUser } from "../../api/auth";
import { logout } from "../../state/authSlice";

export default function Navbar() {
    const user = useAppSelector((state) => state.auth.user);

    const [ isDropdownOpen, setDropdownOpen ] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // current route path

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [ isLoggingOut, setIsLoggingOut ] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true); // show spinner

            await logoutUser();

            // delay just for UX feedback
            setTimeout(() => {
                dispatch(logout());
                setIsLoggingOut(false);
                navigate("/", { replace: true });
            }, 1000);
        } catch (err: any) {
            const message = err?.response?.data?.error || err?.message || "Unexpected error";
            console.error("Logout error:", message);
            setIsLoggingOut(false);
        }
    };

    const goToDashboard = () => {
        if (location.pathname !== "/dashboard") {
            navigate("/dashboard");
        }
    };

    return (
        <nav className="relative bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between px-4 py-2 md:px-8">
                {/* Left side: logo and title with redirect */ }
                <button
                    onClick={ goToDashboard }
                    className="flex items-center space-x-3 focus:outline-none cursor-pointer"
                >
                    <img src={ logo } className="h-10" alt="Budget Overflow logo"/>
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Budget Overflow
                    </span>
                </button>

                {/* Right side: avatar and dropdown */ }
                { user && (
                    <div className="relative" ref={ dropdownRef }>
                        <button
                            onClick={ () => setDropdownOpen((prev) => !prev) }
                            className="flex items-center text-sm bg-gray-800 rounded-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                        >
                            <span className="sr-only">Open user menu</span>
                            <img
                                className="w-8 h-8 rounded-full cursor-pointer"
                                src={ avatar }
                                alt={ `${ user.firstName } ${ user.lastName }'s avatar` }
                            />
                        </button>

                        { isDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-60 bg-white divide-y divide-gray-100 rounded-lg shadow-md dark:bg-gray-700 dark:divide-gray-600 z-50">
                                <div className="px-4 py-3">
                                    <span className="block text-sm text-gray-900 dark:text-white">
                                        { user.firstName } { user.lastName }
                                    </span>
                                    <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                                        { user.email }
                                    </span>
                                </div>
                                <ul className="py-2">
                                    <li>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        >
                                            Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={ handleLogout }
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer disabled:opacity-50"
                                            disabled={ isLoggingOut }
                                        >
                                            { isLoggingOut ? (
                                                <span className="flex items-center gap-2">
            <svg
                className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                       5.291A7.962 7.962 0 014 12H0c0 3.042
                       1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            <span>Logging out...</span>
        </span>
                                            ) : (
                                                "Sign out"
                                            ) }
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) }
                    </div>
                ) }
            </div>

            {/* Absolute center: current page title */ }
            {/* Absolute center: page navigation links */ }
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex space-x-6">
                <Link
                    to="/dashboard"
                    className={ `text-lg font-semibold ${
                        location.pathname === "/dashboard"
                            ? "text-white"
                            : "text-gray-400 hover:text-gray-200"
                    }` }
                >
                    Dashboard
                </Link>
                <Link
                    to="/transactions"
                    className={ `text-lg font-semibold ${
                        location.pathname === "/transactions"
                            ? "text-white"
                            : "text-gray-400 hover:text-gray-200"
                    }` }
                >
                    Transactions
                </Link>
            </div>
        </nav>
    );
}