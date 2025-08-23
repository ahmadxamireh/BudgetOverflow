import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// define the shape of the authenticated user
interface AuthUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

// define the shape of the auth slice state
interface AuthState {
    user: AuthUser | null; // null when not logged in
    sessionLoaded: boolean;
}

// initial state
const initialState: AuthState = {
    user: null,
    sessionLoaded: false
};

// auth slice
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // set or clear the logged-in user
        setUser(state, action: PayloadAction<AuthUser | null>) {
            state.user = action.payload;
        },
        // logout action clears the user
        logout: (state) => {
            state.user = null;
        },
        // mark the session as loaded (used once on app boot)
        setSessionLoaded(state) {
            state.sessionLoaded = true;
        }
    }
});

// export individual actions for dispatch
export const { setUser, logout, setSessionLoaded } = authSlice.actions;

// export the reducer to be added to the Redux store
export default authSlice.reducer;