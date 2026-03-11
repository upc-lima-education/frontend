import { defineStore } from "pinia";
import { AuthenticationService } from "./authentication.service";
import type { SignInRequest } from "../model/sign-in/sign-in.request";
import type { SignInResponse } from "../model/sign-in/sign-in.response";
import type { SignUpRequest } from "../model/sign-up/sign-up.request";
import { UserResponse } from "../model/user.response";
import { computed, ref } from "vue";
import router from "@/app/shared/router";
import { ROUTE_CONSTANTS } from "@/app/shared/router/route-constants";

/**
 * Authentication store definition
 * @summary
 * This store manages the user authentication state and persists tokens.
 * It stores both accessToken and refreshToken for OAuth compliance.
 * User data includes full UserResponse structure from the backend.
 */

const authenticationService: AuthenticationService = new AuthenticationService();

export const useAuthenticationStore = defineStore('authentication', () => {
    // State
    const signedIn = ref(false);
    const user = ref<UserResponse | null>(null);
    const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
    const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));

    // Computed properties
    const isSignedIn = computed(() => signedIn.value);
    const currentUser = computed(() => user.value);
    const currentUserId = computed(() => user.value?.id || '');
    const currentUserEmail = computed(() => user.value?.email || '');
    const currentAccessToken = computed(() => accessToken.value);

    // Actions
    async function signIn(signInRequest: SignInRequest): Promise<boolean> {
        try {
            const signInResponse: SignInResponse = await authenticationService.signIn(signInRequest);
            
            // Update state
            signedIn.value = true;
            user.value = signInResponse.user;
            accessToken.value = signInResponse.accessToken;
            refreshToken.value = signInResponse.refreshToken;
            
            // Persist tokens
            localStorage.setItem('accessToken', signInResponse.accessToken);
            localStorage.setItem('refreshToken', signInResponse.refreshToken);
            localStorage.setItem('expiresIn', signInResponse.expiresIn.toString());
            
            // Redirect to news page
            await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
            return true;
        } catch (error) {
            console.error('Sign in failed:', error);
            signOut();
            await router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
            return false;
        }
    }

    async function signUp(signUpRequest: SignUpRequest): Promise<boolean> {
        try {
            console.log('🔄 Iniciando sign-up...');
            const signUpResponse = await authenticationService.signUp(signUpRequest);
            console.log('✅ Sign-up exitoso:', signUpResponse.user?.email);
            
            // Update state
            signedIn.value = true;
            user.value = signUpResponse.user;
            accessToken.value = signUpResponse.accessToken;
            refreshToken.value = signUpResponse.refreshToken;
            
            // Persist tokens
            localStorage.setItem('accessToken', signUpResponse.accessToken);
            localStorage.setItem('refreshToken', signUpResponse.refreshToken);
            localStorage.setItem('expiresIn', signUpResponse.expiresIn.toString());
            
            // Redirect to news page after signup
            console.log('🔄 Redirigiendo a noticias...');
            await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
            return true;
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            // No hacer redirect aquí, dejar que el componente maneje el error
            return false;
        }
    }

    async function signOut(): Promise<void> {
        console.log('🚪 Iniciando logout...');
        
        // Limpiar estado del store primero
        signedIn.value = false;
        user.value = null;
        accessToken.value = null;
        refreshToken.value = null;
        
        // Limpiar localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expiresIn');
        
        console.log('🚪 Sesión cerrada. LocalStorage limpiado.');
        
        // Redirigir a la página de login
        try {
            await router.push('/sign-in');
            console.log('✅ Redirigido a /sign-in');
        } catch (error) {
            console.error('❌ Error al redirigir:', error);
        }
    }

    /**
     * Request password reset via email
     */
    async function requestPasswordReset(email: string): Promise<boolean> {
        try {
            await authenticationService.requestPasswordReset(email);
            return true;
        } catch (error) {
            console.error('Password reset request failed:', error);
            return false;
        }
    }

    /**
     * Load user data from the backend if token exists
     * Usa idToken para GET /me (idToken es el JWT validado)
     */
    async function loadCurrentUser(): Promise<boolean> {
        try {
            const token = localStorage.getItem('idToken') || accessToken.value;
            if (!token) {
                console.log('❌ No token found');
                return false;
            }
            
            console.log('🔄 Obteniendo usuario con token');
            user.value = await authenticationService.getCurrentUser(token);
            signedIn.value = true;
            
            console.log('✅ Usuario cargado:', user.value?.email);
            return true;
        } catch (error) {
            console.error('❌ Failed to load current user:', error);
            signOut();
            return false;
        }
    }

    return {
        // State
        signedIn,
        user,
        accessToken,
        refreshToken,
        
        // Computed
        isSignedIn,
        currentUser,
        currentUserId,
        currentUserEmail,
        currentAccessToken,
        
        // Actions
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        loadCurrentUser
    };
});