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
    const rawUser = localStorage.getItem('user');
    let initialUser: UserResponse | null = null;
    try {
        if (rawUser) initialUser = JSON.parse(rawUser);
    } catch {}

    const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
    const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
    // Es una copia de la última identidad confirmada por auth; nunca es una
    // fuente para inferir el rol de otra sesión.
    const userType = ref<'employee' | 'organization' | null>(
        initialUser?.userType || (localStorage.getItem('pendingUserRole') as 'employee' | 'organization' | null) || (rawUser ? 'employee' : null)
    );
    const signedIn = ref<boolean>(Boolean(accessToken.value && initialUser));
    const user = ref<UserResponse | null>(initialUser);
    const sessionResolved = ref(false);

    function setUser(newUser: UserResponse | null): void {
        user.value = newUser;
        if (newUser) {
            try {
                localStorage.setItem('user', JSON.stringify(newUser));
            } catch {}
        } else {
            localStorage.removeItem('user');
        }
    }

    // Computed properties
    const isSignedIn = computed(() => signedIn.value);
    const currentUser = computed(() => user.value);
    const currentUserId = computed(() => user.value?.id || '');
    const currentUserEmail = computed(() => user.value?.email || '');
    const currentUserType = computed(() => userType.value);
    const currentAccessToken = computed(() => accessToken.value);

    /**
     * `auth/me`, sign-in y refresh resuelven el profileId real en clean.
     * Guardarlo aquí evita que cada vista intente deducirlo a partir del userId.
     */
    function syncProfileId(authenticatedUser: UserResponse | null): void {
        if (authenticatedUser?.profileId) {
            localStorage.setItem('profileId', authenticatedUser.profileId);
        } else {
            localStorage.removeItem('profileId');
        }
    }

    function applyAuthenticatedUser(authenticatedUser: UserResponse | null): void {
        const resolvedRole = authenticatedUser?.userType
            || (localStorage.getItem('pendingUserRole') as 'employee' | 'organization' | null)
            || 'employee';
        if (authenticatedUser && !authenticatedUser.userType) {
            authenticatedUser.userType = resolvedRole;
        }
        setUser(authenticatedUser);
        userType.value = authenticatedUser ? resolvedRole : null;
        syncProfileId(authenticatedUser);
    }

    function authenticatedLandingRoute(): string {
        return userType.value === 'employee'
            ? ROUTE_CONSTANTS.JOB_SEARCH
            : ROUTE_CONSTANTS.HOME_PAGE;
    }

    // Actions
    async function signIn(signInRequest: SignInRequest): Promise<boolean> {
        try {
            const signInResponse: SignInResponse = await authenticationService.signIn(signInRequest);
            
            // Update state
            signedIn.value = true;
            applyAuthenticatedUser(signInResponse.user);
            accessToken.value = signInResponse.accessToken;
            refreshToken.value = signInResponse.refreshToken;


            // Persist tokens
            localStorage.setItem('accessToken', signInResponse.accessToken);
            localStorage.setItem('refreshToken', signInResponse.refreshToken);
            localStorage.setItem('expiresIn', signInResponse.expiresIn.toString());

            // /me confirma el perfil real antes de habilitar vistas por rol.
            try {
                const me = await authenticationService.getCurrentUser(signInResponse.accessToken);
                applyAuthenticatedUser(me);
            } catch (meError) {
                console.warn('No se pudo refrescar el usuario desde /me tras el sign-in:', meError);
            }
            sessionResolved.value = true;

            // El candidato entra directamente a la búsqueda; la empresa a su
            // espacio de vacantes. El rol procede de /auth/me, no del navegador.
            await router.push(authenticatedLandingRoute());
            return true;
        } catch (error) {
            console.error('Sign in failed:', error);
            signOut();
            await router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
            return false;
        }
    }

    async function signUp(signUpRequest: SignUpRequest, chosenRole?: 'employee' | 'organization' | null): Promise<boolean> {
        try {
            console.log('🔄 Iniciando sign-up...');
            const signUpResponse = await authenticationService.signUp(signUpRequest);
            console.log('✅ Sign-up exitoso:', signUpResponse.user?.email);
            
            if (chosenRole) {
                localStorage.setItem('pendingUserRole', chosenRole);
                if (signUpResponse.user) {
                    signUpResponse.user.userType = chosenRole;
                }
            }

            // Update state
            signedIn.value = true;
            applyAuthenticatedUser(signUpResponse.user);
            accessToken.value = signUpResponse.accessToken;
            refreshToken.value = signUpResponse.refreshToken;
            sessionResolved.value = true;
            // Persist tokens
            localStorage.setItem('accessToken', signUpResponse.accessToken);
            localStorage.setItem('refreshToken', signUpResponse.refreshToken);
            localStorage.setItem('expiresIn', signUpResponse.expiresIn.toString());
            
            const target = authenticatedLandingRoute();
            console.log('🔄 Redirigiendo a:', target);
            await router.push(target);
            return true;
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            // No hacer redirect aquí. Propagar la respuesta para que la vista
            // diferencie un correo existente (409) de un problema de red.
            throw error;
        }
    }

    async function signOut(): Promise<void> {
        console.log('🚪 Iniciando logout...');

        // backend-v2/clean no expone /auth/sign-out. La sesión JWT se cierra
        // eliminando credenciales y estado exclusivamente en el cliente.

        // Limpiar estado del store primero
        signedIn.value = false;
        setUser(null);
        userType.value = null;
        accessToken.value = null;
        refreshToken.value = null;
        sessionResolved.value = false;
        
        // Limpiar localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expiresIn');
        // Limpieza de la clave heredada: ya no se usa para decidir el rol.
        localStorage.removeItem('userType');
        localStorage.removeItem('profileId');
        
        console.log('🚪 Sesión cerrada. LocalStorage limpiado.');
        
        // Redirigir a la página de login
        try {
            await router.push('/sign-in');
            console.log('🔄 Redirigido a /sign-in');
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
            const currentUserData = await authenticationService.getCurrentUser(token);
            applyAuthenticatedUser(currentUserData);
            signedIn.value = true;
            sessionResolved.value = true;
            
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
            applyAuthenticatedUser(response.user);
            signedIn.value = true;
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('expiresIn', response.expiresIn.toString());
            sessionResolved.value = true;
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
            applyAuthenticatedUser(response.user);
            signedIn.value = true;
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('expiresIn', response.expiresIn.toString());
            sessionResolved.value = true;
            return true;
        } catch (error) {
            console.error('Falló la autenticación con Google:', error);
            return false;
        }
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
        sessionResolved,
        
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
        setAccessToken,
        setRefreshToken
    };
});
