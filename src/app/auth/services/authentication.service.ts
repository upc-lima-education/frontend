import http from "@/app/shared/services/base.service";
import { SignUpResponse } from "../model/sign-up/sign-up.response";
import { SignUpRequest } from "../model/sign-up/sign-up.request";
import { SignInRequest } from "../model/sign-in/sign-in.request";
import { SignInResponse } from "../model/sign-in/sign-in.response";
import { UserResponse } from "../model/user.response";
import { PasswordResetRequest, PasswordResetResponse } from "../model/password/password-reset.response";
import { GoogleTokenResponse } from "../model/google-token.response";

export class AuthenticationService {
    private endpoint = "/auth";

    /**
     * Register a new user
     * POST /api/v1/auth/sign-up
     */
    async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
        console.log('🔄 AuthService: SignUp request:', signUpRequest);
        
        const response = await http.post(`${this.endpoint}/sign-up`, signUpRequest);
        console.log('📦 AuthService: SignUp response:', response.data);
        
        return new SignUpResponse(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.expiresIn,
            new UserResponse(
                response.data.user.id,
                response.data.user.email,
                response.data.user.emailVerified || false,
                response.data.user.firstName || response.data.user.name,
                response.data.user.firstName || response.data.user.givenName,
                response.data.user.lastName || response.data.user.familyName,
                response.data.user.picture || null,
                response.data.user.locale || 'es'
            )
        );
    }

    /**
     * Sign in with email and password
     * POST /api/v1/auth/sign-in
     */
    async signIn(signInRequest: SignInRequest): Promise<SignInResponse> {
        console.log('🔄 AuthService: SignIn request:', signInRequest);
        
        const response = await http.post(`${this.endpoint}/sign-in`, signInRequest);
        console.log('📦 AuthService: SignIn response:', response.data);
        
        return new SignInResponse(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.expiresIn,
            new UserResponse(
                response.data.user.id,
                response.data.user.email,
                response.data.user.emailVerified || false,
                response.data.user.firstName || response.data.user.name,
                response.data.user.firstName || response.data.user.givenName,
                response.data.user.lastName || response.data.user.familyName,
                response.data.user.picture || null,
                response.data.user.locale || 'es'
            )
        );
    }

    /**
     * Request password reset
     * POST /api/v1/auth/forgot-password
     */
    async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
        console.log('🔄 AuthService: Password reset request for:', email);
        
        const response = await http.post(`${this.endpoint}/forgot-password`, { email });
        console.log('📦 AuthService: Password reset response:', response.data);
        
        return new PasswordResetResponse(
            response.data.message || 'Password reset email sent',
            email
        );
    }

    /**
     * Build Google OAuth authorization URL.
     * GET /api/v1/auth/google/url?userType=employee|organization&mode=signup|login
     * Backend encodes userType and mode in OAuth state (Google returns state unchanged).
     */
    async getGoogleAuthUrl(options?: { userType?: 'employee' | 'organization'; mode?: 'signup' | 'login' }): Promise<string> {
        const params = new URLSearchParams();
        if (options?.userType) {
            params.set('userType', options.userType);
        }
        if (options?.mode) {
            params.set('mode', options.mode);
        }
        const query = params.toString();
        const path = query ? `${this.endpoint}/google/url?${query}` : `${this.endpoint}/google/url`;

        const response = await http.get(path);
        return response.data.authUrl || response.data.url;
    }

    /**
     * Exchange Google authorization code for tokens
     * This is handled by the backend callback, so this method is not needed
     * The frontend just redirects to Google and the backend handles the callback
     */
    async exchangeGoogleCode(code: string): Promise<SignInResponse> {
        // This method is not used in the current flow
        // Google OAuth is handled entirely by the backend callback
        throw new Error('Google OAuth is handled by backend callback');
    }

    /**
     * Verify Google ID token
     * POST /api/v1/auth/google/verify
     */
    async verifyGoogleToken(idToken: string): Promise<UserResponse> {
        const response = await http.post(`${this.endpoint}/google/verify`, { idToken });
        return new UserResponse(
            response.data.id,
            response.data.email,
            response.data.emailVerified,
            response.data.name,
            response.data.givenName,
            response.data.familyName,
            response.data.picture,
            response.data.locale
        );
    }

    /**
     * Get current authenticated user
     * GET /api/v1/auth/me
     * Requires: Authorization header with Bearer token
     */
    async getCurrentUser(token: string): Promise<UserResponse> {
        console.log('🔄 AuthService: Getting current user with token');
        
        const response = await http.get(`${this.endpoint}/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('📦 AuthService: Current user response:', response.data);
        
        return new UserResponse(
            response.data.user.id,
            response.data.user.email,
            response.data.user.emailVerified || false,
            response.data.user.firstName || response.data.user.name,
            response.data.user.firstName || response.data.user.givenName,
            response.data.user.lastName || response.data.user.familyName,
            response.data.user.picture || null,
            response.data.user.locale || 'es'
        );
    }
}