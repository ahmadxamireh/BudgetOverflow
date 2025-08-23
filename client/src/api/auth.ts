import { fetchWithRefresh } from "./fetchWithRefresh";

// read api base url from environment variable
const API_BASE = import.meta.env.VITE_API_URL;

// define the shape of registration request body
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

// define the expected response shape for successful registration
export interface RegisterResponse {
    message: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        createdAt: string;
    };
}

// define error response shape
interface ErrorResponse {
    error: string;
}

// define the shape of login request body
export interface LoginPayload {
    email: string;
    password: string;
}

// send registration request to backend
export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse["user"]> => {
    // send post request to register endpoint
    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // allow sending/receiving cookies
        body: JSON.stringify(payload),
    });

    // handle error if registration fails
    if (!res.ok) {
        let message = "Registration failed";
        try {
            const data = (await res.json()) as ErrorResponse;
            message = data.error || message;
        } catch {}
        throw new Error(message);
    }

    // return user object from successful response
    const data = await res.json();
    return data.user;
};

// send login request to backend
export const loginUser = async (payload: LoginPayload): Promise<void> => {
    // send post request to login endpoint
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    // handle error if login fails
    if (!res.ok) {
        let message = "Login failed";
        try {
            const data = await res.json();
            message = data.error || message;
        } catch {}
        throw new Error(message);
    }
    // no return value needed, cookies are stored automatically
};

// get current user using fetchWithRefresh to retry if needed
export const getCurrentUser = async (): Promise<RegisterResponse["user"]> => {
    // send get request to /me endpoint with credentials
    const res = await fetchWithRefresh(`${API_BASE}/api/auth/me`, {
        credentials: "include"
    });

    // throw error if request fails
    if (!res.ok) throw new Error("Not authenticated");

    // return parsed user object
    return (await res.json()) as RegisterResponse["user"];
};

// send request to refresh access token
export const refreshAccessToken = async (): Promise<boolean> => {
    // send post request to refresh endpoint
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // required to send refreshToken cookie
    });

    // return true if refresh succeeded
    return res.ok;
};

// send request to update first name and last name
export const updateUserProfile = async (
    payload: { firstName: string; lastName: string }
): Promise<RegisterResponse["user"]> => {
    // send patch request to profile endpoint
    const res = await fetchWithRefresh(`${API_BASE}/api/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    // handle error if request fails
    if (!res.ok) {
        let message = "Failed to update profile";
        try {
            const data = await res.json();
            message = data.error || message;
        } catch {}
        throw new Error(message);
    }

    // return updated user object
    return await res.json();
};

// send request to change password
export const changeUserPassword = async (
    payload: { currentPassword: string; newPassword: string }
): Promise<void> => {
    // send post request to change-password endpoint
    const res = await fetchWithRefresh(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    // handle error if request fails
    if (!res.ok) {
        let message = "Failed to change password";
        try {
            const data = await res.json();
            message = data.error || message;
        } catch {}
        throw new Error(message);
    }
    // no return value needed if successful
};

// send logout request to backend
export const logoutUser = async (): Promise<void> => {
    // send post request to logout endpoint
    await fetchWithRefresh(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // send cookie to clear on server
    });
};