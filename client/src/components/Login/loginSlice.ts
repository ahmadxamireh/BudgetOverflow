import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// define the shape of login slice state
interface LoginState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

// initial state for login slice
const initialState: LoginState = {
    loading: false,
    error: null,
    success: false,
}

// create the login slice with reducers to manage UI state
const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        // called when login begins
        startLogin(state) {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        // called when login completes successfully
        loginSuccess(state) {
            state.loading = false;
            state.error = null;
            state.success = true;
        },
        // called when login fails
        loginFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload; // set error message
            state.success = false;
        },
        // resets the state to initial values
        resetLoginState(state) {
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    }
});

// export actions for dispatching in components
export const { startLogin, loginSuccess, loginFailure, resetLoginState } = loginSlice.actions;

// export the reducer to register in the redux store
export default loginSlice.reducer;