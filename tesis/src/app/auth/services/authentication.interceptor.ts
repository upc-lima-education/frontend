import { useAuthenticationStore } from "./authentication.store";

export const authenticationInterceptor = (config: any) => {
    const authenticationStore = useAuthenticationStore();
    const token = authenticationStore.currentAccessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};