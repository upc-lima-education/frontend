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
    const userType = ref<'employee' | 'organization' | null>(localStorage.getItem('userType') as 'employee' | 'organization' | null);
    const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
    const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));

    // Computed properties
    const isSignedIn = computed(() => signedIn.value);
    const currentUser = computed(() => user.value);
    const currentUserId = computed(() => user.value?.id || '');
    const currentUserEmail = computed(() => user.value?.email || '');
    const currentUserType = computed(() => userType.value);
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

            // Persist the role so currentUserType is reliable across the app
            // (navbar, profile, route guard) even on a fresh sign-in.
            if (signInResponse.user?.userType) {
                setUserType(signInResponse.user.userType);
            }

            // Persist tokens
            localStorage.setItem('accessToken', signInResponse.accessToken);
            localStorage.setItem('refreshToken', signInResponse.refreshToken);
            localStorage.setItem('expiresIn', signInResponse.expiresIn.toString());

            // Refrescar el rol AUTORITATIVO desde /me: la respuesta de sign-in no
            // siempre incluye un userType fiable, y /me sí distingue
            // organización vs candidato. Best-effort: no rompe el login si falla.
            try {
                const me = await authenticationService.getCurrentUser(signInResponse.accessToken);
                user.value = me;
                if (me?.userType) setUserType(me.userType);
            } catch (meError) {
                console.warn('No se pudo refrescar el usuario desde /me tras el sign-in:', meError);
            }

            // Inicio compartido; sus acciones se adaptan al rol autoritativo.
            await router.push(ROUTE_CONSTANTS.HOME_PAGE);
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
            
            console.log('🔄 Redirigiendo al inicio...');
            await router.push(ROUTE_CONSTANTS.HOME_PAGE);
            return true;
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            // No hacer redirect aquí, dejar que el componente maneje el error
            return false;
        }
    }

    async function signOut(): Promise<void> {
        console.log('🚪 Iniciando logout...');

        // backend-v2/clean no expone /auth/sign-out. La sesión JWT se cierra
        // eliminando credenciales y estado exclusivamente en el cliente.

        // Limpiar estado del store primero
        signedIn.value = false;
        user.value = null;
        userType.value = null;
        accessToken.value = null;
        refreshToken.value = null;
        
        // Limpiar localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expiresIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('profileId');
        
        console.log(' Sesión cerrada. LocalStorage limpiado.');
        
        // Redirigir a la página de login
        try {
            await router.push('/sign-in');
            console.log(' Redirigido a /sign-in');
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
            return await authenticationService.requestPasswordReset(email);
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
            const token = accessToken.value;
            if (!token) {
                console.log('❌ No token found');
                return false;
            }
            
            console.log('🔄 Obteniendo usuario con token');
            user.value = await authenticationService.getCurrentUser(token);
            signedIn.value = true;

            // Mantener el rol sincronizado con el backend (/me).
            if (user.value?.userType) {
                setUserType(user.value.userType);
            }
            
            console.log('✅ Usuario cargado:', user.value?.email);
            return true;
        } catch (error) {
            console.error('❌ Failed to load current user:', error);
            signOut();
            return false;
        }
    }

    async function refreshSession(): Promise<string | null> {
        const currentRefreshToken = refreshToken.value;
        if (!currentRefreshToken) return null;
        try {
            const response = await authenticationService.refreshSession(currentRefreshToken);
            accessToken.value = response.accessToken;
            refreshToken.value = response.refreshToken;
            user.value = response.user;
            signedIn.value = true;
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('expiresIn', response.expiresIn.toString());
            if (response.user?.userType) setUserType(response.user.userType);
            return response.accessToken;
        } catch (error) {
            console.error('No se pudo renovar la sesión:', error);
            await signOut();
            return null;
        }
    }

    async function authenticateGoogle(code: string, requestedRole?: 'employee' | 'organization'): Promise<boolean> {
        try {
            const response = await authenticationService.authenticateGoogle(
                code,
                requestedRole === 'organization' ? 'Company' : requestedRole === 'employee' ? 'Candidate' : undefined,
            );
            accessToken.value = response.accessToken;
            refreshToken.value = response.refreshToken;
            user.value = response.user;
            signedIn.value = true;
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('expiresIn', response.expiresIn.toString());
            if (response.user?.userType) setUserType(response.user.userType);
            return true;
        } catch (error) {
            console.error('Falló la autenticación con Google:', error);
            return false;
        }
    }

    /**
     * Set user type (employee or organization)
     */
    function setUserType(type: 'employee' | 'organization'): void {
        userType.value = type;
        localStorage.setItem('userType', type);
    }

    /**
     * Set access token (used by OAuth callback)
     */
    function setAccessToken(token: string): void {
        accessToken.value = token;
        localStorage.setItem('accessToken', token);
    }

    /**
     * Set refresh token (used by OAuth callback)
     */
    function setRefreshToken(token: string): void {
        refreshToken.value = token;
        localStorage.setItem('refreshToken', token);
    }

    return {
        // State
        signedIn,
        user,
        userType,
        accessToken,
        refreshToken,
        
        // Computed
        isSignedIn,
        currentUser,
        currentUserId,
        currentUserEmail,
        currentUserType,
        currentAccessToken,
        
        // Actions
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        loadCurrentUser,
        refreshSession,
        authenticateGoogle,
        setUserType,
        setAccessToken,
        setRefreshToken
    };
});
