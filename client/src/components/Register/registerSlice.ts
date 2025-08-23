import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// define the shape of register slice state
interface RegisterState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

// initial state for register slice
const initialState: RegisterState = {
    loading: false,
    error: null,
    success: false,
}

// register slice to manage local UI state
const registerSlice = createSlice({
    name: "register",
    initialState,
    reducers: {
        // called when registration begins
        startRegister(state) {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        // called when registration completes successfully
        registerSuccess(state) {
            state.loading = false;
            state.error = null;
            state.success = true;
        },
        // called when registration fails
        registerFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload; // set error message
            state.success = false;
        },
        // resets the state to initial values
        resetRegisterState(state) {
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    }
});

// export actions for dispatching in components
export const { startRegister, registerSuccess, registerFailure, resetRegisterState } = registerSlice.actions;

// export the reducer to register in the redux store
export default registerSlice.reducer;