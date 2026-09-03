import axios from "axios";
import { authenticationInterceptor } from "@/app/auth/services/authentication.interceptor";

// Default to http://localhost:5000 for local .NET development
// Update this to match your backend URL in environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

/**
 * The API stores local uploads as keys under backend wwwroot (for example,
 * `profiles/<userId>/profile-picture.png`). Resolve those keys against the
 * backend origin instead of the Vite origin.
 */
export function resolveBackendAssetUrl(value?: string | null, version?: string | null): string {
    if (!value) return '';
    if (/^(?:https?:|data:|blob:)/i.test(value)) return value;

    const backendOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    const assetUrl = `${backendOrigin}/${value.replace(/^\/+/, '')}`;
    return version ? `${assetUrl}?v=${encodeURIComponent(version)}` : assetUrl;
}

const http = axios.create({
    baseURL: API_BASE_URL,
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
