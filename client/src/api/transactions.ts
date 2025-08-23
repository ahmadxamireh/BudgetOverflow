// base URL from environment config (e.g. VITE_API_URL=http://localhost:3000)
const API_BASE: string = import.meta.env.VITE_API_URL;
import { fetchWithRefresh } from "./fetchWithRefresh";

// full transaction type returned by the backend
export interface Transaction {
    id: number;                   // unique transaction ID
    title: string;                // short title or label
    amount: number;               // transaction amount (must be > 0)
    type: "income" | "expense";   // transaction type
    date: string;                 // calendar date in YYYY-MM-DD format
    note: string | null;          // optional note field (free text)
    categoryId: number | null;    // FK to category (null allowed)
    createdAt: string;            // ISO timestamp of creation
}

// metadata returned alongside paginated data
export interface PaginationMeta {
    page: number;  // current page
    limit: number; // max items per page
    total: number; // total items
    pages: number; // total pages
}

// response structure for paginated transactions
export interface TransactionsResponse {
    data: Transaction[];        // list of transactions
    pagination: PaginationMeta; // pagination info
}

// response structure when creating or updating a transaction
interface TransactionResponse {
    message: string;   // success message
    data: Transaction; // transaction object
}

// fetch all transactions for the user
export const getTransactions = async (): Promise<TransactionsResponse> => {
    // send GET request to /api/transactions
    const res: Response = await fetchWithRefresh(`${ API_BASE }/api/transactions`, {
        credentials: "include"
    });

    // handle error if fetch failed
    if (!res.ok) throw new Error("Failed to fetch transactions");

    // parse and return the json response
    return (await res.json()) as TransactionsResponse;
};

// fetch transactions based on page and limit
export const getSomeTransactions = async (
    page = 1,
    limit = 5
): Promise<TransactionsResponse> => {
    // send GET request with pagination query params
    const res: Response = await fetchWithRefresh(`${ API_BASE }/api/transactions?page=${ page }&limit=${ limit }`, {
        credentials: "include"
    });

    // handle error if fetch failed
    if (!res.ok) throw new Error("Failed to fetch transactions");

    // parse and return the json response
    return (await res.json()) as TransactionsResponse;
};

// create a new transaction
export const createTransaction = async (
    payload: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> => {
    // send POST request with transaction payload
    const res: Response = await fetchWithRefresh(`${ API_BASE }/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
    });

    // handle error if creation failed
    if (!res.ok) throw new Error("Failed to create transaction");

    // extract and return transaction data from response
    const result: TransactionResponse = await res.json();
    return result.data;
};

// update an existing transaction by id (partial updates supported)
export const updateTransaction = async (
    id: number,
    update: Partial<Transaction>
): Promise<Transaction> => {
    // send PATCH request to update the transaction
    const res: Response = await fetchWithRefresh(`${ API_BASE }/api/transactions/${ id }`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(update)
    });

    // handle error if update failed
    if (!res.ok) throw new Error("Failed to update transaction");

    // extract and return transaction data from response
    const result: TransactionResponse = await res.json();
    return result.data;
};

// delete a transaction by ID
export const deleteTransaction = async (id: number): Promise<void> => {
    // send DELETE request to delete the transaction
    const res: Response = await fetchWithRefresh(`${ API_BASE }/api/transactions/${ id }`, {
        method: "DELETE",
        credentials: "include"
    });

    // handle error if deletion failed
    if (!res.ok) throw new Error("Failed to delete transaction");
};