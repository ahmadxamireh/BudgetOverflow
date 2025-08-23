import { useAppSelector } from "../../hooks";
import Chart from "react-apexcharts";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type ApexOptions } from "apexcharts";
import { formatCurrency } from "../../util/formatCurrency";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

// dropdown options
const RANGE_OPTIONS = [
    "Lifetime",
    "Last 7 days",
    "Last 30 days",
    "Last 90 days",
    "Custom..."
];

export default function TransactionsGraph() {
    // get all transactions from Redux state
    const allTransactions = useAppSelector((state) => state.transactions.allItems);

    // component state for dropdowns and custom range
    const [ showDropdown, setShowDropdown ] = useState(false);
    const [ selectedRange, setSelectedRange ] = useState("Lifetime");
    const [ showCustomPopup, setShowCustomPopup ] = useState(false);
    const [ customFrom, setCustomFrom ] = useState<string>("");
    const [ customTo, setCustomTo ] = useState<string>("");

    // format a raw date string into dd/mm/yyyy
    const formatDisplayDate = (str: string): string =>
        new Date(str).toLocaleDateString("en-GB");

    // determine label to show based on selection
    const getRangeLabel = () => {
        if (selectedRange === "Custom..." && customFrom && customTo) {
            return `${ formatDisplayDate(customFrom) } - ${ formatDisplayDate(customTo) }`;
        }
        return selectedRange;
    };

    // convert yyyy-mm-dd string to Date object
    const toDate = (str: string): Date => new Date(str + "T00:00:00");

    // compute filtered list of transactions based on selected time range
    const filtered = useMemo(() => {
        const now = new Date();

        if (selectedRange === "Lifetime") return allTransactions;

        if (selectedRange === "Custom..." && customFrom && customTo) {
            const from = toDate(customFrom);
            const to = toDate(customTo);
            return allTransactions.filter((tx) => {
                const d = new Date(tx.date);
                return d >= from && d <= to;
            });
        }

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let from: Date;
        switch (selectedRange) {
            case "Last 7 days":
                from = new Date(today);
                from.setDate(from.getDate() - 6);
                break;
            case "Last 30 days":
                from = new Date(today);
                from.setDate(from.getDate() - 29);
                break;
            case "Last 90 days":
                from = new Date(today);
                from.setDate(from.getDate() - 89);
                break;
            default:
                from = new Date(0);
        }

        return allTransactions.filter((tx) => new Date(tx.date) >= from);
    }, [ allTransactions, selectedRange, customFrom, customTo ]);

    // transform filtered data into format expected by ApexCharts
    const chartData = useMemo(() => {
        const byDate: Record<string, { income: number; expense: number }> = {};

        for (const tx of filtered) {
            const date = new Date(tx.date).toLocaleDateString("en-CA");
            if (!byDate[date]) byDate[date] = { income: 0, expense: 0 };
            byDate[date][tx.type] += tx.amount;
        }

        const sortedDates = Object.keys(byDate).sort();

        return {
            categories: sortedDates,
            incomeSeries: sortedDates.map((d) => byDate[d].income),
            expenseSeries: sortedDates.map((d) => byDate[d].expense)
        };
    }, [ filtered ]);

    // chart display configuration options
    const options: ApexOptions = {
        chart: { type: "area", height: 420, toolbar: { show: false } },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 3 },
        fill: {
            type: "gradient",
            gradient: { opacityFrom: 0.5, opacityTo: 0, stops: [ 0, 100 ] }
        },
        colors: [ "#22c55e", "#ef4444" ],
        xaxis: {
            categories: chartData.categories,
            labels: { style: { colors: "#9ca3af", fontSize: "14px" } }
        },
        yaxis: {
            labels: {
                formatter: (val) => formatCurrency(val),
                style: { colors: "#9ca3af", fontSize: "14px" }
            }
        },
        legend: { labels: { colors: "#9ca3af" } },
        tooltip: {
            y: {
                formatter: (val) => formatCurrency(val)
            }
        }
    };

    // chart data series: income and expense
    const series = [
        { name: "Income", data: chartData.incomeSeries },
        { name: "Expense", data: chartData.expenseSeries }
    ];

    // calculate net balance (income - expense)
    const netTotal = filtered.reduce(
        (sum, tx) => sum + tx.amount * (tx.type === "income" ? 1 : -1),
        0
    );

    return (
        <div
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 mt-6 relative">
            {/* chart header with net total and dropdown */ }
            <div className="flex items-start justify-between mb-4 relative">
                <div>
                    <span className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                        { formatCurrency(netTotal) }
                    </span>
                    <h3 className="text-base font-light text-gray-500 dark:text-gray-400">
                        Net Total (for the selected period)
                    </h3>
                </div>

                <div className="flex items-center space-x-2">
                    {/* dropdown for selecting chart range */ }
                    <div className="relative">
                        <button
                            onClick={ () => setShowDropdown(!showDropdown) }
                            className="inline-flex items-center p-2 text-sm font-medium text-gray-500 rounded-lg hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            { getRangeLabel() }
                            <ChevronDownIcon className="w-4 h-4 ml-2"/>
                        </button>

                        { showDropdown && (
                            <div
                                className="absolute right-0 z-50 mt-2 w-48 bg-white dark:bg-gray-700 rounded shadow divide-y divide-gray-100 dark:divide-gray-600">
                                <ul className="py-1 text-sm text-gray-700 dark:text-gray-400">
                                    { RANGE_OPTIONS.map((label) => (
                                        <li key={ label }>
                                            <button
                                                onClick={ () => {
                                                    setShowDropdown(false);
                                                    if (label === "Custom...") {
                                                        setShowCustomPopup(true);
                                                    } else {
                                                        setSelectedRange(label);
                                                        setShowCustomPopup(false);
                                                    }
                                                } }
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                            >
                                                { label }
                                            </button>
                                        </li>
                                    )) }
                                </ul>
                            </div>
                        ) }
                    </div>

                    {/* link to full transactions page */ }
                    <Link
                        to="/transactions"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-[2px]"
                    >
                        View all
                    </Link>
                </div>
            </div>

            {/* popup for choosing custom date range */ }
            { showCustomPopup && (
                <div
                    className="absolute right-6 top-20 z-50 p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Select custom range</h4>

                    <div className="flex flex-col space-y-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">From:</label>
                        <input
                            type="date"
                            value={ customFrom }
                            onChange={ (e) => {
                                setCustomFrom(e.target.value);
                                if (customTo && e.target.value >= customTo) {
                                    setCustomTo(""); // reset invalid "to"
                                }
                            } }
                            max={ customTo ? customTo : undefined }
                            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm dark:text-white"
                        />
                        <label className="text-xs text-gray-500 dark:text-gray-400">To:</label>
                        <input
                            type="date"
                            value={ customTo }
                            onChange={ (e) => {
                                setCustomTo(e.target.value);
                                if (customFrom && e.target.value <= customFrom) {
                                    setCustomFrom(""); // reset invalid "from"
                                }
                            } }
                            min={ customFrom ? customFrom : undefined }
                            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            onClick={ () => setShowCustomPopup(false) }
                            className="text-sm px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={
                                !customFrom ||
                                !customTo ||
                                customFrom === customTo
                            }
                            onClick={ () => {
                                setSelectedRange("Custom...");
                                setShowCustomPopup(false);
                            } }
                            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            ) }

            {/* main ApexChart rendering */ }
            <Chart options={ options } series={ series } type="area" height={ 475 }/>
        </div>
    );
}