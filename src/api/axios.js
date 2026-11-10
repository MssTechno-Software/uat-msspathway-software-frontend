import axios from "axios";
import {
    clearAuthSession,
    getAccessToken,
} from "../services/authSession";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Attach the current tab's session token to API requests.
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token.trim()}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle expired or unauthorized authentication sessions.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || "";

        // Keep invalid login credentials on the login page.
        const isLoginRequest = requestUrl.includes("/auth/login");

        if (status === 401 && !isLoginRequest) {
            clearAuthSession();

            window.dispatchEvent(
                new Event("session-expired")
            );
        }

        return Promise.reject(error);
    }
);
export default api;