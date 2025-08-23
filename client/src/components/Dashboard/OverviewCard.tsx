import { ArrowUpIcon, ArrowDownIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";

interface Props {
    title: string;
    value: string;
    trend: string; // e.g. "+12%" or "-8%" or "--"
}

export default function OverviewCard({ title, value, trend }: Props) {
    const trimmedTrend = trend.trim();
    const isPlaceholder = trimmedTrend === "--";
    const isPositive = trimmedTrend.startsWith("+");

    // determine the trend class
    const trendClass = isPlaceholder
        ? "text-gray-500 dark:text-gray-400"
        : isPositive
            ? "text-green-500 dark:text-green-400"
            : "text-red-500 dark:text-red-400";

    return (
        <div
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
                {/* value + title */ }
                <div className="flex-shrink-0">
                    <span
                        className={ `text-xl font-bold leading-none sm:text-2xl text-gray-900 dark:text-white` }
                    >
                        { value }
                    </span>
                    <h3 className="text-base font-light text-gray-500 dark:text-gray-400">
                        { title }
                    </h3>
                </div>

                {/* trend + arrow */ }
                <div className="flex flex-col items-end justify-center flex-1">
                    <div className={ `flex items-center text-base font-medium ${ trendClass }` }>
                        { trend }
                        {/* show arrow only if not placeholder */ }
                        { !isPlaceholder &&
                            (isPositive
                                    ? title === "Total Budget"
                                        ? <ArrowTrendingUpIcon className="w-5 h-5 ml-1"/>
                                        : <ArrowUpIcon className="w-5 h-5 ml-1"/>
                                    : title === "Total Budget"
                                        ? <ArrowTrendingDownIcon className="w-5 h-5 ml-1"/>
                                        : <ArrowDownIcon className="w-5 h-5 ml-1"/>
                            ) }
                    </div>
                    {/* conditional note for income */ }
                    { title.startsWith("Income") && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            (compared to last month)
                        </p>
                    ) }
                    {/* conditional note for expenses */ }
                    { title.startsWith("Expenses") && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            (% of income spent)
                        </p>
                    ) }
                </div>
            </div>
        </div>
    );
}