import { type JSX, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchTransactions, removeTransaction } from "./transactionsSlice";
import { fetchCategories } from "../Categories/categoriesSlice";
import TransactionModal from "./TransactionModal";
import {
    ArrowPathIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    FunnelIcon,
    ArrowUpTrayIcon
} from "@heroicons/react/24/solid";
import { type Transaction } from "../../models/Transaction";
import exportTransactionsToCSV from "../../util/exportTransactions";

interface Props {
    onDashboard: boolean; // show/hide certain UI elements based on page opened
}

export default function TransactionsList({ onDashboard }: Props): JSX.Element {
    // initialize redux dispatch
    const dispatch = useAppDispatch();

    // select relevant state from redux store
    const allTransactions = useAppSelector((state) => state.transactions.allItems);
    const categories = useAppSelector((state) => state.categories.items);
    const error = useAppSelector((state) => state.transactions.error);

    // local UI states
    const [ showModal, setShowModal ] = useState<boolean>(false);
    const [ editingTransaction, setEditingTransaction ] = useState<Transaction | null>(null);
    const [ currentPage, setCurrentPage ] = useState<number>(1);
    const [ showExportDropdown, setShowExportDropdown ] = useState(false);
    const [ showFilterDropdown, setShowFilterDropdown ] = useState(false);
    const [ customFrom, setCustomFrom ] = useState<string>("");
    const [ customTo, setCustomTo ] = useState<string>("");
    const [ filteredTransactions, setFilteredTransactions ] = useState<Transaction[] | null>(null);

    // fetch transactions and categories on mount
    useEffect(() => {
        dispatch(fetchTransactions());
        if (categories.length === 0) {
            dispatch(fetchCategories());
        }
    }, [ dispatch, categories.length ]);

    // helper to get category name from categoryId
    const getCategoryName = (id: number | null): string => {
        return categories.find((cat) => cat.id === id)?.name ?? "Uncategorized";
    };

    // helper to format date to en-GB
    const formatDate = (isoDate: string): string =>
        new Intl.DateTimeFormat("en-GB").format(new Date(isoDate));

    // helper to format currency amount
    const formatAmount = (amount: number): string =>
        amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // determine pagination limit and max pages
    const limitPerPage = onDashboard ? 5 : 12;
    const maxPages = onDashboard ? 3 : 1000;

    // choose filtered or full list
    const displayedList = filteredTransactions ?? allTransactions;

    // clip to visible range for pagination
    const visibleTransactions = displayedList.slice(0, maxPages * limitPerPage);
    const totalPages = Math.ceil(visibleTransactions.length / limitPerPage);

    // paginate based on current page
    const paginated = visibleTransactions.slice(
        (currentPage - 1) * limitPerPage,
        currentPage * limitPerPage
    );

    // move to previous page
    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // move to next page
    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                {/* show latest header on dashboard only */ }
                { onDashboard && (
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Latest Transactions</h2>
                ) }

                {/* pagination controls (only if not on dashboard) */ }
                { !onDashboard && (
                    <div className="flex justify-center items-center space-x-4">
                        <button className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
                                onClick={ handlePrev } disabled={ currentPage === 1 }>
                            <ChevronLeftIcon className="w-5 h-5"/>
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page { currentPage } of { totalPages === 0 ? 1 : totalPages }
                        </span>
                        <button className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
                                onClick={ handleNext } disabled={ currentPage === totalPages || totalPages === 0 }>
                            <ChevronRightIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ) }

                {/* right side buttons (export, filter, new) */ }
                <div className="flex items-center space-x-3 relative">
                    { !onDashboard && (
                        <>
                            {/* Export button */ }
                            <div className="relative">
                                <button
                                    onClick={ () => setShowExportDropdown((prev) => !prev) }
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                                >
                                    <ArrowUpTrayIcon className="w-5 h-5"/>
                                    <span>Export</span>
                                </button>
                                { showExportDropdown && (
                                    <div
                                        className="absolute right-0 z-50 mt-2 w-56 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-4 space-y-3">
                                        <button onClick={ () => {
                                            exportTransactionsToCSV(allTransactions, categories, { range: "lifetime" });
                                            setShowExportDropdown(false);
                                        } }
                                                className="w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:underline">
                                            Export Lifetime
                                        </button>
                                        <hr/>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            <label className="block mb-1 text-xs">From:</label>
                                            <input type="date" value={ customFrom } onChange={ (e) => {
                                                setCustomFrom(e.target.value);
                                                if (customTo && e.target.value >= customTo) setCustomTo("");
                                            } } max={ customTo || undefined }
                                                   className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 dark:text-white text-sm"/>
                                            <label className="block mt-2 mb-1 text-xs">To:</label>
                                            <input type="date" value={ customTo } onChange={ (e) => {
                                                setCustomTo(e.target.value);
                                                if (customFrom && e.target.value <= customFrom) setCustomFrom("");
                                            } } min={ customFrom || undefined }
                                                   className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 dark:text-white text-sm"/>
                                        </div>
                                        <button disabled={ !customFrom || !customTo || customFrom === customTo }
                                                onClick={ () => {
                                                    exportTransactionsToCSV(allTransactions, categories, {
                                                        from: customFrom,
                                                        to: customTo
                                                    });
                                                    setShowExportDropdown(false);
                                                } }
                                                className="w-full bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700 disabled:opacity-50">
                                            Export Custom
                                        </button>
                                    </div>
                                ) }
                            </div>

                            {/* Filter button */ }
                            <div className="relative">
                                <button
                                    onClick={ () => setShowFilterDropdown((prev) => !prev) }
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                                >
                                    <FunnelIcon className="w-5 h-5"/>
                                    <span>Filter</span>
                                </button>
                                { showFilterDropdown && (
                                    <div
                                        className="absolute right-0 z-50 mt-2 w-56 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md p-4 space-y-3">
                                        <button onClick={ () => {
                                            setFilteredTransactions(null);
                                            setShowFilterDropdown(false);
                                        } }
                                                className="w-full text-left text-sm text-gray-700 dark:text-gray-200 hover:underline">
                                            Show All (Lifetime)
                                        </button>
                                        <hr/>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            <label className="block mb-1 text-xs">From:</label>
                                            <input type="date" value={ customFrom } onChange={ (e) => {
                                                setCustomFrom(e.target.value);
                                                if (customTo && e.target.value >= customTo) setCustomTo("");
                                            } } max={ customTo || undefined }
                                                   className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 dark:text-white text-sm"/>
                                            <label className="block mt-2 mb-1 text-xs">To:</label>
                                            <input type="date" value={ customTo } onChange={ (e) => {
                                                setCustomTo(e.target.value);
                                                if (customFrom && e.target.value <= customFrom) setCustomFrom("");
                                            } } min={ customFrom || undefined }
                                                   className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 dark:text-white text-sm"/>
                                        </div>
                                        <button disabled={ !customFrom || !customTo || customFrom === customTo }
                                                onClick={ () => {
                                                    const from = new Date(customFrom + "T00:00:00");
                                                    const to = new Date(customTo + "T23:59:59");
                                                    setFilteredTransactions(
                                                        allTransactions.filter((tx) => {
                                                            const d = new Date(tx.date);
                                                            return d >= from && d <= to;
                                                        })
                                                    );
                                                    setShowFilterDropdown(false);
                                                    setCurrentPage(1);
                                                } }
                                                className="w-full bg-green-600 text-white text-sm py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
                                            Apply Filter
                                        </button>
                                    </div>
                                ) }
                            </div>
                        </>
                    ) }

                    {/* New Transaction button */ }
                    <button
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                        onClick={ () => setShowModal(true) }
                    >
                        <PlusIcon className="w-5 h-5"/>
                        <span>New Transaction</span>
                    </button>
                </div>
            </div>

            {/* error message */}
            { error && <p className="text-red-500">{ error }</p> }

            {/* transactions list */}
            <div className="min-h-[560px]">
                <ul key={ currentPage }
                    className={ onDashboard ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-4" }>
                    { paginated.length === 0 && (
                        <li className="text-gray-500 dark:text-gray-400">No transactions found.</li>
                    ) }

                    { paginated.map((tx) => (
                        <li key={ tx.id }
                            className="p-4 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 min-h-[100px]">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className={ `font-medium text-lg ${ tx.type === "income" ? "text-green-500" : "text-red-500" }` }>₪ { formatAmount(tx.amount) }</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{ tx.title }</p>
                                    { tx.note && !onDashboard && (
                                        <p className="text-xs text-gray-400 dark:text-gray-400 italic">{ tx.note }</p>
                                    ) }
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        { getCategoryName(tx.categoryId) } | { formatDate(tx.date) }
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="text-yellow-500 hover:text-yellow-700"
                                            onClick={ () => setEditingTransaction(tx) }>
                                        <ArrowPathIcon className="w-5 h-5"/>
                                    </button>
                                    <button className="text-red-500 hover:text-red-700" onClick={ async () => {
                                        await dispatch(removeTransaction(tx.id));
                                        dispatch(fetchTransactions());
                                    } }>
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        </li>
                    )) }
                </ul>
            </div>

            {/* transaction modal for add/update */}
            { (showModal || editingTransaction) && (
                <TransactionModal
                    onClose={ () => {
                        setShowModal(false);
                        setEditingTransaction(null);
                    } }
                    transactionToEdit={ editingTransaction }
                    onSuccess={ () => {
                        dispatch(fetchTransactions());
                    } }
                />
            ) }

            {/* pagination buttons for dashboard */}
            { onDashboard && (
                <div className="flex justify-center items-center mt-6 space-x-4">
                    <button className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
                            onClick={ handlePrev } disabled={ currentPage === 1 }>
                        <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                            Page { currentPage } of { totalPages === 0 ? 1 : totalPages }
                        </span>
                    <button className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
                            onClick={ handleNext } disabled={ currentPage === totalPages || totalPages === 0 }>
                        <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                </div>
            ) }
        </div>
    );
}