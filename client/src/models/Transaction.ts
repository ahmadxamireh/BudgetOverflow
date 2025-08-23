// define the shape of a transaction object used across the app
export type Transaction = {
    id: number;                   // unique identifier for the transaction
    title: string;                // brief description of the transaction
    amount: number;               // transaction amount (must be positive)
    type: "income" | "expense";   // type of transaction (income or expense)
    date: string;                 // date of the transaction (YYYY-MM-DD)
    note: string | null;          // optional note field for extra details
    categoryId: number | null;    // linked category ID or null if uncategorized
};