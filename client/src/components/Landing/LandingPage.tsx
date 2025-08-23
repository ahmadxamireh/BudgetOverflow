import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";

export default function LandingPage() {
    const navigate = useNavigate();

    // check if a user is already logged in
    const user = useAppSelector((state) => state.auth.user);

    return (
        <section
            className="pt-24 md:h-screen flex bg-cyan-950 flex-col justify-center text-center md:text-left md:flex-row md:justify-between md:items-center lg:px-48 md:px-12 px-4 bg-secondary text-white">
            <div className="md:flex-1 md:mr-10">
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                    Take Control of Your Finances
                    <span className="block text-primary mt-2">
                        With Budget Overflow
                    </span>
                </h1>
                <p className="text-lg mb-8 max-w-lg">
                    Track your spending, analyse expenses, and gain clarity on your budget — all in one secure,
                    easy-to-use dashboard.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button
                        className="bg-black text-white px-6 py-3 rounded-lg border border-black hover:bg-gray-900 transition"
                        onClick={ () => navigate(user ? "/dashboard" : "/login") }
                    >
                        Login
                    </button>
                    <button
                        className="bg-white text-black px-6 py-3 rounded-lg border border-black hover:bg-gray-100 transition"
                        onClick={ () => navigate(user ? "/dashboard" : "/register") }
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            <div className="flex justify-center mt-12 md:mt-0 md:flex-1">
                <img
                    src={ logo }
                    alt="Budget Overflow Logo"
                    className="w-100 h-auto"
                />
            </div>
        </section>
    );
}