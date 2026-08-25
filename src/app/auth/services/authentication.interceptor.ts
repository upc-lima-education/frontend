import type { InternalAxiosRequestConfig } from "axios";
import { useAuthenticationStore } from "./authentication.store";

export const authenticationInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const authenticationStore = useAuthenticationStore();
    const token = authenticationStore.currentAccessToken;
    
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};