import logo from "../../assets/logo.png";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getCurrentUser, loginUser, registerUser } from "../../api/auth"; // API helpers
import { setUser } from "../../state/authSlice"; // global user state
import { startRegister, registerSuccess, registerFailure, resetRegisterState } from "./registerSlice"; // local slice

export default function Register() {
    const dispatch = useAppDispatch(); // Redux dispatch
    const navigate = useNavigate(); // router navigation

    // Redux state for error/loading for register
    const loading = useAppSelector((state) => state.register.loading);
    const error = useAppSelector((state) => state.register.error);

    // form field states
    const [ firstName, setFirstName ] = useState<string>("");
    const [ lastName, setLastName ] = useState<string>("");
    const [ email, setEmail ] = useState<string>("");
    const [ password, setPassword ] = useState<string>("");

    // to show T&Cs
    const [ showTerms, setShowTerms ] = useState(false);

    // always start with a clean state
    useEffect(() => {
        dispatch(resetRegisterState());
    }, [ dispatch ]);

    // form submit handler
    async function handleSubmit(e: FormEvent) {
        e.preventDefault(); // prevent page reload
        dispatch(startRegister()); // mark loading

        try {
            // register the user
            await registerUser({ firstName, lastName, email, password });

            // log in after successful registration
            await loginUser({ email, password });

            // fetch the user data via /me after successful login
            const user = await getCurrentUser();

            // store the user info in Redux for global access
            dispatch(setUser(user));

            // redirect after a short delay (purely for UI success message)
            setTimeout(() => {
                dispatch(registerSuccess()); // mark success to end loading state
                navigate("/dashboard"); // redirect to dashboard (protected route)
            }, 2000);
        } catch (err: any) {
            const message = err?.response?.data?.error || err?.message || "Unexpected error";
            console.error("Register error:", message);
            dispatch(registerFailure(message));
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
                            Create an account
                        </h1>

                        {/* Error Message */ }
                        { error && (
                            <p className="text-sm text-red-700 bg-red-100 p-2 rounded">
                                { error }
                            </p>
                        ) }

                        {/* Form */ }
                        <form className="space-y-6" onSubmit={ handleSubmit }>
                            {/* First Name */ }
                            <div>
                                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900">
                                    First name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={ firstName }
                                    onChange={ (e) => setFirstName(e.target.value) }
                                    placeholder="John"
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                />
                            </div>

                            {/* Last Name */ }
                            <div>
                                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900">
                                    Last name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={ lastName }
                                    onChange={ (e) => setLastName(e.target.value) }
                                    placeholder="Doe"
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                />
                            </div>

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

                            {/* Terms */ }
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        required
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-primary-300"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-light text-gray-900">
                                        I accept the{ " " }
                                        <button
                                            type="button"
                                            className="font-medium text-blue-900 hover:underline"
                                            onClick={ () => setShowTerms(true) }
                                        >
                                            Terms and Conditions
                                        </button>
                                    </label>
                                </div>
                            </div>

                            {/* Submit */ }
                            {/* Submit */ }
                            <button
                                type="submit"
                                disabled={ loading }
                                className="w-full text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 flex items-center justify-center gap-2"
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
                                        <span>Registering...</span>
                                    </span>
                                ) : (
                                    "Create an account"
                                ) }
                            </button>

                            {/* Login Link */ }
                            <p className="text-sm font-light text-gray-900">
                                Already have an account?{ " " }
                                <Link to="/login" className="font-medium text-primary-600 hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            { showTerms && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="terms-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
                        <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
                        <div className="text-gray-700 text-sm mb-4 space-y-2">
                            <p>By creating an account on Budget Overflow, you agree to the following:</p>
                            <ul className="list-decimal list-inside space-y-3">
                                <br/>
                                <li>Use:<p>You may use this app for personal, non-commercial budgeting purposes
                                           only.</p></li>
                                <li>Data:<p>Your data is stored securely and used only to provide core features.</p>
                                </li>
                                <li>Security:<p>You are responsible for maintaining the confidentiality of your
                                                account.</p></li>
                                <li>Limitations:<p>We are not liable for any financial decisions made using the app.</p>
                                </li>
                                <li>Changes:<p>Terms may be updated at any time with or without notice.</p></li>
                            </ul>
                            <p>If you do not agree, please do not use the app.</p>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={ () => setShowTerms(false) }
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </section>
    );
}