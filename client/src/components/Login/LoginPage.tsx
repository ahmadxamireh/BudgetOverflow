import logo from "../../assets/logo.png";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getCurrentUser, loginUser } from "../../api/auth";
import { setUser } from "../../state/authSlice";
import { startLogin, loginSuccess, loginFailure, resetLoginState } from "./loginSlice";

export default function Login() {
    const dispatch = useAppDispatch(); // Redux dispatch
    const navigate = useNavigate(); // router navigation

    /// Redux state for error/loading for login
    const loading = useAppSelector((state) => state.login.loading);
    const error = useAppSelector((state) => state.login.error);

    // form field states
    const [ email, setEmail ] = useState<string>("");
    const [ password, setPassword ] = useState<string>("");

    // always start with a clean state
    useEffect(() => {
        dispatch(resetLoginState());
    }, [ dispatch ]);

    // form submit handler
    async function handleSubmit(e: FormEvent) {
        e.preventDefault(); // prevent page reload
        dispatch(startLogin()); // mark loading

        try {
            // log in user
            await loginUser({ email: email.trim(), password });

            // fetch authenticated user data via /me after successful login
            const user = await getCurrentUser();

            // store the user info in Redux for global access
            dispatch(setUser(user));

            // redirect after a short delay (purely for UI success message, does not affect logic)
            setTimeout(() => {
                dispatch(loginSuccess()); // mark success to end loading state
                navigate("/dashboard"); // redirect to dashboard (protected route)
            }, 1000);
        } catch (err: any) {
            const message = err?.response?.data?.error || err?.message || "Unexpected error";
            console.error("Login error:", message);
            dispatch(loginFailure(message));
        }
    }

    return (
        <section className="bg-cyan-950">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                {/* Logo & Brand */ }
                <Link
                    to="/"
                    className="flex items-center mb-6 text-4xl font-semibold text-white"
                >
                    <img src={ logo } alt="logo" className="w-20 h-20 mr-2"/>
                    Budget Overflow
                </Link>

                {/* Card Container */ }
                <div className="w-full bg-gray-100 rounded-lg shadow sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Log in to your account
                        </h1>

                        {/* Error Message */ }
                        { error && (
                            <p className="text-sm text-red-700 bg-red-100 p-2 rounded">
                                { error }
                            </p>
                        ) }

                        {/* Form */ }
                        <form className="space-y-6" onSubmit={ handleSubmit }>
                            {/* Email */ }
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={ email }
                                    onChange={ (e) => setEmail(e.target.value) }
                                    placeholder="name@company.com"
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                />
                            </div>

                            {/* Password */ }
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={ password }
                                    onChange={ (e) => setPassword(e.target.value) }
                                    placeholder="••••••••"
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                />
                            </div>
                            {/* Submit */ }
                            <button
                                type="submit"
                                disabled={ loading }
                                className="w-full text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                            >
                                { loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"/>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                                                5.291A7.962 7.962 0 014 12H0c0 3.042
                                                1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <span>Logging in...</span>
                                    </span>
                                ) : (
                                    "Log in"
                                ) }
                            </button>

                            {/* Register Link */ }
                            <p className="text-sm font-light text-gray-900">
                                Don't have an account?{ " " }
                                <Link to="/register" className="font-medium text-primary-600 hover:underline">
                                    Register here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}