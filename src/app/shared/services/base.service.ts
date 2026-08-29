import axios from "axios";
import { authenticationInterceptor } from "@/app/auth/services/authentication.interceptor";

// Default to http://localhost:5000 for local .NET development
// Update this to match your backend URL in environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const http = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add authentication interceptor to automatically include token in requests
http.interceptors.request.use(authenticationInterceptor);

let refreshRequest: Promise<string | null> | null = null;
http.interceptors.response.use(
    response => response,
    async error => {
        const original = error.config;
        if (error.response?.status !== 401 || original?._retried || String(original?.url).includes('/auth/refresh')) {
            return Promise.reject(error);
        }
        original._retried = true;
        const { useAuthenticationStore } = await import('@/app/auth/services/authentication.store');
        const store = useAuthenticationStore();
        refreshRequest ??= store.refreshSession().finally(() => { refreshRequest = null; });
        const token = await refreshRequest;
        if (!token) return Promise.reject(error);
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
    },
);

// Export the http object
export default http;
