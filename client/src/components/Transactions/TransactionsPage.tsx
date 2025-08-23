import Navbar from "../Navbar/Navbar.tsx";
import TransactionsList from "./TransactionsList.tsx";

export default function TransactionsPage() {
    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 ">
                <Navbar/>
                <div className="p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* transactions + graph side by side */ }
                        <div className="grid grid-cols-1 gap-6">
                            <div className="col-span-1">
                                <TransactionsList onDashboard={ false }/> {/* hide notes on dashboard */ }
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}