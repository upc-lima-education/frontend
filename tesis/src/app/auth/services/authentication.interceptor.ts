import { useAuthenticationStore } from "./authentication.store";

export const authenticationInterceptor = (config: any) => {
    const authenticationStore = useAuthenticationStore();
    const isSignedIn = authenticationStore.isSignedIn;
    if (isSignedIn) {
        config.headers.Authorization = `Bearer ${authenticationStore.currentToken}`;
    }
    return config;
}