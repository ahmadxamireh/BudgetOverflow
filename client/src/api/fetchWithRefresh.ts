import { refreshAccessToken } from "./auth";

// wrapper around fetch to retry once if access token is expired
export const fetchWithRefresh = async (
    input: RequestInfo,
    init?: RequestInit
): Promise<Response> => {
    // first attempt
    let res = await fetch(input, init);

    // if token expired, try to refresh and retry once
    if (res.status === 401) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            res = await fetch(input, init); // retry once after refresh
        }
    }

    // return the original or retried response
    return res;
};