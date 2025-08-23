import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getCategories, type Category } from "../../api/categories";

// define the shape of the redux state for categories
interface CategoriesState {
    items: Category[]; // list of categories
    loading: boolean;  // true while fetching
    error: string | null; // error message or null
}

// initial state for the categories slice
const initialState: CategoriesState = {
    items: [],
    loading: false,
    error: null,
};

// async thunk to fetch categories from the backend
export const fetchCategories = createAsyncThunk<Category[]>(
    "categories/fetch",
    async () => {
        return await getCategories(); // must return Category[]
    }
);

// create the slice using createSlice utility
const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {}, // no local reducers needed
    extraReducers: (builder) => {
        builder
            // handle pending state of fetchCategories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // handle fulfilled state of fetchCategories
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.items = action.payload;
                state.loading = false;
            })
            // handle rejected state of fetchCategories
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load categories";
            });
    }
});

// export the reducer to be included in the redux store
export default categoriesSlice.reducer;