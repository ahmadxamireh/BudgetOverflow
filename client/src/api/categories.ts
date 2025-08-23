// base URL from environment (e.g. VITE_API_URL=http://localhost:3000)
const API_BASE: string = import.meta.env.VITE_API_URL;
import { fetchWithRefresh } from "./fetchWithRefresh";

// category object shape from backend
export interface Category {
    id: number;             // unique category ID
    name: string;           // category display name
    userId: number | null;  // null for global category, user ID for custom
}

// fetch all categories accessible to the logged-in user
export const getCategories = async (): Promise<Category[]> => {
    try {
        // send GET request to /api/categories with cookies for authentication
        const res: Response = await fetchWithRefresh(`${ API_BASE }/api/categories`, {
            credentials: "include", // send cookie for auth
        });

        // throw an error if the response was unsuccessful
        if (!res.ok) throw new Error("Failed to fetch categories");

        // parse response JSON which includes { message, data }
        const json = await res.json();

        // return only the array of categories from the response
        return json.data as Category[];
    } catch (err) {
        // log any unexpected error to the console
        console.error("getCategories error:", err);

        // rethrow the error so calling code can handle it
        throw err;
    }
};