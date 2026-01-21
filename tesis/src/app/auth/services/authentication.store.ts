import { defineStore } from "pinia";
import { AuthenticationService } from "./authentication.service";
import type { SignInRequest } from "../model/sign-in/sign-in.request";
import type { SignInResponse } from "../model/sign-in/sign-in.response";
import type { SignUpRequest } from "../model/sign-up/sign-up.request";
import { SignUpResponse } from "../model/sign-up/sign-up.response";
import { computed, ref } from "vue";
import router from "@/app/shared/router";
import { ROUTE_CONSTANTS } from "@/app/shared/router/route-constants";

/**
 * Authentication store definition
 * @summary
 * This store is used to manage the user authentication state.
 * It provides getters to access the current user id, username, and token.
 * It also provides actions to sign in, sign up, and sign out.
 */

const authenticationService: AuthenticationService = new AuthenticationService();

export const useAuthenticationStore = defineStore('authentication', () => {
    //Data to store
    const signedIn = ref(false);
    const userId = ref('');
    const userEmail = ref('');
    //Getters
    const isSignedIn = computed(() => signedIn);
    const currentUserId = computed(() => userId);
    const currentUserEmail = computed(() => userEmail);
    const currentToken = computed(() => localStorage.getItem('token') || null); //returns null if not found
    //functions
    async function signIn(signInRequest: SignInRequest): Promise<boolean> {
        try {
            const signInResponse: SignInResponse = await authenticationService.signIn(signInRequest);
            signedIn.value = true;
            userId.value = signInResponse.id;
            userEmail.value = signInResponse.userEmail;
            localStorage.setItem('token', signInResponse.token);
            await router.push(ROUTE_CONSTANTS.NEWS_PAGE);
            return true;
        } catch (error) {
            console.error(error);
            await router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
            return false;
        }
    }
    async function signUp(signUpRequest: SignUpRequest): Promise<boolean> {
        try {
            const response = await authenticationService.signUp(signUpRequest);
            const signUpResponse = new SignUpResponse(response.id, response.userEmail, response.type);
            await router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
            return true;
        } catch (error) {
            console.error(error);
            await router.push(ROUTE_CONSTANTS.SIGN_UP_EMPLOYEE);
            return false;
        }
    }

    async function signOut(): Promise<void> {
        signedIn.value = false;
        userId.value = '';
        userEmail.value = '';
        localStorage.removeItem('token');
        await router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
    }

    return {
        /*Data*/
        signedIn, userId, userEmail,
        /*Getters*/
        isSignedIn, currentUserId, currentUserEmail, currentToken,
        /*Functions*/
        signIn, signUp, signOut
    }
});