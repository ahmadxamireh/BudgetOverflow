import type { Transaction } from "../api/transactions";
import type { Category } from "../api/categories";

// define export options: either "lifetime" or a custom date range
type ExportOptions =
    | { range: "lifetime" }
    | { from: string; to: string };

// define a type guard to check if export option is "lifetime"
function isLifetimeRange(opt: ExportOptions): opt is { range: "lifetime" } {
    return "range" in opt && opt.range === "lifetime";
}

// export transaction data as a downloadable CSV file
export default function exportTransactionsToCSV(
    transactions: Transaction[],
    categories: Category[],
    options: ExportOptions
): void {
    // return early if no transactions are available
    if (!transactions || transactions.length === 0) return;

    // helper to get category name from categoryId
    const getCategoryName = (id: number | null): string => {
        return categories.find((cat) => cat.id === id)?.name ?? "Uncategorized";
    };

    // optionally filter transactions based on provided date range
    let filtered = transactions;
    if (!isLifetimeRange(options)) {
        const fromDate = new Date(options.from + "T00:00:00");
        const toDate = new Date(options.to + "T23:59:59");

        filtered = transactions.filter((tx) => {
            const txDate = new Date(tx.date);
            return txDate >= fromDate && txDate <= toDate;
        });
    }

    // return early if no transactions remain after filtering
    if (filtered.length === 0) return;

    // csv header row
    const header = [ "Title", "Amount", "Type", "Date", "Note", "Category" ];

    // build csv rows from each transaction
    const rows = filtered.map((tx) => [
        tx.title,
        tx.amount,
        tx.type,
        new Date(tx.date).toLocaleDateString("en-GB"),
        tx.note ?? "",
        getCategoryName(tx.categoryId ?? null)
    ]);

    // create CSV string, escape inner quotes properly
    const csv = [ header, ...rows ]
        .map((row) =>
            row.map(String).map((cell) => `"${ cell.replace(/"/g, '""') }"`).join(",")
        )
        .join("\n");

    // create a blob with UTF-8 BOM for Excel compatibility
    const blob = new Blob([ "\uFEFF" + csv ], { type: "text/csv;charset=utf-8;" });

    // create a temporary URL for the blob
    const url = URL.createObjectURL(blob);

    // create a hidden anchor element to trigger download
    const link = document.createElement("a");
    link.href = url;

    // generate a filename based on the export range
    const filename = isLifetimeRange(options)
        ? "BudgetOverflow_Lifetime.csv"
        : `BudgetOverflow_${ options.from }_to_${ options.to }.csv`;

    // set the download attribute and trigger download
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // cleanup the temporary element
    document.body.removeChild(link);
}