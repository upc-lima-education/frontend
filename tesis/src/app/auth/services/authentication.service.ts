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
        const response = await http.post(`${this.endpoint}/sign-up`, signUpRequest);
        return new SignUpResponse(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.expiresIn,
            new UserResponse(
                response.data.user.id,
                response.data.user.email,
                response.data.user.emailVerified,
                response.data.user.name,
                response.data.user.givenName,
                response.data.user.familyName,
                response.data.user.picture,
                response.data.user.locale
            )
        );
    }

    /**
     * Sign in with email and password
     * POST /api/v1/auth/sign-in
     */
    async signIn(signInRequest: SignInRequest): Promise<SignInResponse> {
        const response = await http.post(`${this.endpoint}/sign-in`, signInRequest);
        return new SignInResponse(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.expiresIn,
            new UserResponse(
                response.data.user.id,
                response.data.user.email,
                response.data.user.emailVerified,
                response.data.user.name,
                response.data.user.givenName,
                response.data.user.familyName,
                response.data.user.picture,
                response.data.user.locale
            )
        );
    }

    /**
     * Request password reset
     * POST /api/v1/auth/password-reset
     */
    async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
        const request = new PasswordResetRequest(email);
        const response = await http.post(`${this.endpoint}/password-reset`, request);
        return new PasswordResetResponse(response.data.message, response.data.email);
    }

    /**
     * Get Google authentication URL
     * GET /api/v1/auth/google/url
     */
    async getGoogleAuthUrl(): Promise<string> {
        const response = await http.get(`${this.endpoint}/google/url`);
        return response.data.url;
    }

    /**
     * Exchange Google authorization code for tokens
     * POST /api/v1/auth/google/token
     * Then GET /api/v1/me to get user data
     */
    async exchangeGoogleCode(code: string): Promise<SignInResponse> {
        try {
            console.log('🔄 Service: POST /auth/google/token con código:', code);
            
            // Paso 1: Obtener tokens
            const tokenResponse = await http.post(`${this.endpoint}/google/token`, { code });
            
            console.log('📦 Service: Token response status:', tokenResponse.status);
            console.log('📦 Service: Token response data:', tokenResponse.data);
            
            const googleTokens = new GoogleTokenResponse(
                tokenResponse.data.accessToken,
                tokenResponse.data.idToken,
                tokenResponse.data.expiresIn,
                tokenResponse.data.tokenType,
                tokenResponse.data.refreshToken
            );
            
            console.log('✅ Service: GoogleTokenResponse creado');
            console.log('🔄 Service: Obteniendo datos del usuario con idToken...');
            
            // Paso 2: Obtener datos del usuario con idToken
            const userResponse = await http.get("/me", {
                headers: {
                    Authorization: `Bearer ${googleTokens.idToken}`
                }
            });
            
            console.log('📦 Service: User response:', userResponse.data);
            
            const user = new UserResponse(
                userResponse.data.id,
                userResponse.data.email,
                userResponse.data.emailVerified,
                userResponse.data.name,
                userResponse.data.givenName,
                userResponse.data.familyName,
                userResponse.data.picture,
                userResponse.data.locale
            );
            
            // Paso 3: Retornar respuesta completa
            const signInResponse = new SignInResponse(
                googleTokens.accessToken,
                googleTokens.refreshToken,
                googleTokens.expiresIn,
                user
            );
            
            console.log('✅ Service: SignInResponse completa creada');
            return signInResponse;
        } catch (error) {
            console.error('❌ Service: Error en exchangeGoogleCode:', error);
            throw error;
        }
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
     * GET /api/v1/me
     * Requires: Authorization header with Bearer token
     */
    async getCurrentUser(token: string): Promise<UserResponse> {
        const response = await http.get("/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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
}