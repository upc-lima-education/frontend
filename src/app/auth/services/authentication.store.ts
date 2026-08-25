import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "@/app/common/router";
import { ROUTE_CONSTANTS } from "@/app/common/router/route-constants";
import type { UserResponse } from "../model/user.response";
import type { SignInRequest } from "../model/sign-in.request";
import type { SignUpRequest } from "../model/sign-up.request";
import { authenticationService } from "./authentication.service";
import type { ProfileType } from "@/app/profiles/enums/profile-type.enum";

export const useAuthenticationStore = defineStore('authentication', () => {
    // State
    const signedIn = ref<boolean>(false);
    const user = ref<UserResponse | null>(null);
    const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
    const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));

    // Computed
    const isSignedIn = computed(() => signedIn.value);
    const currentUser = computed(() => user.value);
    const currentUserId = computed(() => user.value?.id || '');
    const currentUserEmail = computed(() => user.value?.email || '');
    const currentProfileType = computed(() => user.value?.profileType || localStorage.getItem('profileType') || '');
    const currentAccessToken = computed(() => accessToken.value);

    function saveSession(token: string, refresh: string, profileType?: string | null) {
        accessToken.value = token;
        refreshToken.value = refresh;
        signedIn.value = true;

        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refresh);
        if (profileType) {
            localStorage.setItem('profileType', profileType);
        }
    }

    // Actions
    async function signIn(signInRequest: SignInRequest): Promise<boolean> {
        try {
            const authResponse = await authenticationService.signIn(signInRequest);

            saveSession(
                authResponse.accessToken,
                authResponse.refreshToken,
                authResponse.user?.profileType
            );
            user.value = authResponse.user;

            await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
            return true;
        } catch (error) {
            console.error('Sign in failed:', error);
            signOut();
            return false;
        }
    }

    async function signUp(signUpRequest: SignUpRequest): Promise<boolean> {
        try {
            const authResponse = await authenticationService.signUp(signUpRequest);

            saveSession(
                authResponse.accessToken,
                authResponse.refreshToken,
                authResponse.user?.profileType
            );
            user.value = authResponse.user;

            await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
            return true;
        } catch (error) {
            console.error('Sign up failed:', error);
            return false;
        }
    }

    async function loadCurrentUser(): Promise<boolean> {
        try {
            if (!accessToken.value) return false;

            const userData = await authenticationService.getCurrentUser();
            user.value = userData;
            signedIn.value = true;

            if (userData.profileType) {
                localStorage.setItem('profileType', userData.profileType);
            }
            return true;
        } catch (error) {
            console.error('Failed to load current user:', error);
            signOut();
            return false;
        }
    }

    function signOut(): void {
        signedIn.value = false;
        user.value = null;
        accessToken.value = null;
        refreshToken.value = null;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('profileType');

        router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
    }
    /*
    TODO
    async function requestPasswordReset(request: PasswordResetRequest): Promise<boolean> {
        try {
            await authenticationService.requestPasswordReset(request);
            return true;
        } catch (error) {
            console.error('Password reset request failed:', error);
            return false;
        }
    }
    */

    /*External*/
    async function authenticateGoogle(code: string, profileType?: ProfileType | null): Promise<boolean> {
        try {
            const authResponse = await authenticationService.authenticateGoogle({ code, profileType });

            saveSession(
                authResponse.accessToken,
                authResponse.refreshToken,
                authResponse.user?.profileType
            );
            user.value = authResponse.user;

            await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
            return true;
        } catch (error) {
            console.error('Error during google authentication: ', error);
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
        currentProfileType,
        currentAccessToken,

        // Actions
        signIn,
        signUp,
        signOut,
        /*requestPasswordReset,*/
        authenticateGoogle,
        loadCurrentUser
    };
});