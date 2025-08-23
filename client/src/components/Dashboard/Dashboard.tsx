import { useAppDispatch, useAppSelector } from "../../hooks";
import Navbar from "../Navbar/Navbar";
import OverviewCard from "./OverviewCard";
import TransactionsList from "../Transactions/TransactionsList";
import { useEffect } from "react";
import { fetchTransactions } from "../Transactions/transactionsSlice";
import TransactionsGraph from "../Transactions/TransactionsGraph";
import { formatCurrency } from "../../util/formatCurrency";

// convert Date → YYYY-MM string
const getYearMonthKey = (date: Date): string =>
    `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(2, "0") }`;

const formatMonthYear = (date: Date): string =>
    `${ String(date.getMonth() + 1).padStart(2, "0") }/${ date.getFullYear() }`;

export default function Dashboard() {
    const dispatch = useAppDispatch();

    // fetch all transactions on mount
    useEffect(() => {
        dispatch(fetchTransactions());
    }, [ dispatch ]);

    const user = useAppSelector((state) => state.auth.user);
    const transactions = useAppSelector((state) => state.transactions.allItems);

    // full totals
    const income = transactions
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = transactions
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);

    const budget = income - expenses;

    // prepare month keys
    const now = new Date();
    const currentMonthKey = getYearMonthKey(now);
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = getYearMonthKey(previousMonthDate);

    // accumulate monthly income and expenses
    let currentMonthIncome = 0;
    let previousMonthIncome = 0;
    let currentMonthExpenses = 0;

    transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        const txMonthKey = getYearMonthKey(txDate);

        if (txMonthKey === currentMonthKey) {
            if (tx.type === "income") currentMonthIncome += tx.amount;
            else if (tx.type === "expense") currentMonthExpenses += tx.amount;
        } else if (txMonthKey === previousMonthKey && tx.type === "income") {
            previousMonthIncome += tx.amount;
        }
    });

    // income trend with + or - sign
    const incomeTrend = (() => {
        if (previousMonthIncome === 0) return "--";
        const change = ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
        const prefix = change >= 0 ? "+" : "";
        return `${ prefix }${ Math.round(change) }%`;
    })();

    // expenses as % of this month’s income, with + or - based on if it exceeds 100%
    const expensesTrend = (() => {
        if (currentMonthIncome === 0) return "--";
        const percent = (currentMonthExpenses / currentMonthIncome) * 100;
        return `-${ Math.round(percent) }%`;
    })();

    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 ">
                <Navbar/>
                <div className="p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
                            Welcome back, { user?.firstName }!
                        </h1>

                        {/* overview cards */ }
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            <OverviewCard
                                title="Total Budget"
                                value={ formatCurrency(budget) }
                                trend="--"
                            />
                            <OverviewCard
                                title={ `Income (${ formatMonthYear(now) })` }
                                value={ formatCurrency(currentMonthIncome) }
                                trend={ incomeTrend }
                            />
                            <OverviewCard
                                title={ `Expenses (${ formatMonthYear(now) })` }
                                value={ formatCurrency(currentMonthExpenses) }
                                trend={ expensesTrend }
                            />
                        </div>

                        {/* transactions + graph side by side */ }
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="col-span-1">
                                <TransactionsList onDashboard={ true }/> {/* hide notes on dashboard */ }
                            </div>
                            <div className="col-span-1 xl:col-span-2">
                                <TransactionsGraph/>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}