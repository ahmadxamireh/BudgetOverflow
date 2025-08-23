import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
    getTransactions,
    getSomeTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    type Transaction
} from "../../api/transactions";

// define the response shape for paginated transactions (from getTransactions())
interface TransactionsResponse {
    data: Transaction[]; // array of all transactions
    pagination: {
        page: number; // current page
        limit: number; // max items per page
        total: number; // total items
        pages: number; // total pages
    };
}

// define the shape of redux state for transactions
interface TransactionsState {
    items: TransactionsResponse; // holds transactions and pagination meta
    allItems: Transaction[]; // full list
    loading: boolean; // loading indicator
    error: string | null; // error message or null
}

// initial state
const initialState: TransactionsState = {
    items: {
        data: [], // no paginated transactions initially
        pagination: {
            page: 1,
            limit: 5,
            total: 0,
            pages: 1
        }
    },
    allItems: [], // full list starts empty
    loading: false,
    error: null
};

// async thunk to fetch transactions from server
export const fetchTransactions = createAsyncThunk<TransactionsResponse>(
    "transactions/fetch",
    async (): Promise<TransactionsResponse> => {
        return await getTransactions(); // returns { data: Transaction[], pagination: {...} }
    }
);

// fetch some transactions based on page and limit
export const fetchSomeTransactions = createAsyncThunk<
    TransactionsResponse, // returned
    { page?: number; limit?: number } | undefined // accepts optional page/limit
>(
    "transactions/fetchSome",
    async ({ page = 1, limit = 10 } = {}) => {
        return await getSomeTransactions(page, limit); // call API with pagination
    }
);

// async thunk to create a new transaction
export const addTransaction = createAsyncThunk<
    Transaction, // return value when fulfilled
    Omit<Transaction, "id" | "createdAt"> // payload type (excludes id + createdAt)
>(
    "transactions/add",
    async (tx): Promise<Transaction> => {
        return await createTransaction(tx); // send new tx data to backend, returns { message, data: Transaction }
    }
);

// async thunk to edit/update an existing transaction
export const editTransaction = createAsyncThunk<
    Transaction, // return type
    { id: number; updates: Partial<Transaction> } // payload type: id + patch data
>(
    "transactions/edit",
    async ({ id, updates }): Promise<Transaction> => {
        return await updateTransaction(id, updates); // patch specific transaction, returns { message, data: Transaction }
    }
);

// async thunk to delete a transaction
export const removeTransaction = createAsyncThunk<
    number, // returns deleted transaction id
    number  // takes id as input
>(
    "transactions/delete",
    async (id): Promise<number> => {
        await deleteTransaction(id); // call delete endpoint
        return id; // return ID so we can remove it in state
    }
);

// create the slice with extraReducers to handle each thunk state
const transactionsSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {}, // no regular reducers needed
    extraReducers: (builder) => {
        builder
            // --- full fetch ---
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<TransactionsResponse>) => {
                state.allItems = action.payload.data;
                state.loading = false;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load transactions";
            })

            // --- paginated fetch ---
            .addCase(fetchSomeTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSomeTransactions.fulfilled, (state, action: PayloadAction<TransactionsResponse>) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchSomeTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load transactions";
            })

            // --- create ---
            .addCase(addTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
                state.items.data.push(action.payload);
            })

            // --- edit ---
            .addCase(editTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
                const index = state.items.data.findIndex((tx) => tx.id === action.payload.id);
                if (index !== -1) state.items.data[index] = action.payload;
            })

            // --- delete ---
            .addCase(removeTransaction.fulfilled, (state, action: PayloadAction<number>) => {
                state.items.data = state.items.data.filter((tx) => tx.id !== action.payload);
            });
    }
});

// export the reducer to register in redux store
export default transactionsSlice.reducer;