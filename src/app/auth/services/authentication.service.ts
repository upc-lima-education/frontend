import http from "@/app/shared/services/base.service";
import { SignUpResponse } from "../model/sign-up/sign-up.response";
import { SignUpRequest } from "../model/sign-up/sign-up.request";
import { SignInRequest } from "../model/sign-in/sign-in.request";
import { SignInResponse } from "../model/sign-in/sign-in.response";
import { UserResponse } from "../model/user.response";
import { PasswordResetRequest, PasswordResetResponse } from "../model/password/password-reset.response";

export class AuthenticationService {
    private endpoint = "/auth";

    /**
     * Mapea el objeto crudo de usuario del backend a UserResponse.
     * Centraliza el orden de argumentos (antes estaba corrido y dejaba
     * userType siempre en 'employee') y normaliza el rol: el backend usa
     * 'candidate'/'organization' (a veces capitalizado) -> 'employee'/'organization'.
     */
    private mapUser(u: any): UserResponse {
        const userType: 'employee' | 'organization' =
            String(u?.userType).toLowerCase() === 'organization' ? 'organization' : 'employee';
        return new UserResponse(
            u.id,
            u.email,
            u.emailVerified || false,
            u.firstName || u.name || u.givenName,
            u.lastName || u.familyName,
            u.companyName,
            userType,
            u.picture || undefined,
            u.locale || 'es',
            u.createdAt
        );
    }

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
            this.mapUser(response.data.user)
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
            this.mapUser(response.data.user)
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

        return this.mapUser(response.data.user);
    }

    /**
     * Sign out on the backend, invalidating the session
     * POST /api/v1/auth/sign-out
     */
    async signOut(token: string): Promise<void> {
        await http.post(`${this.endpoint}/sign-out`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    /**
     * Get a user by id
     * GET /api/v1/auth/users/{id}
     */
    async getUserById(id: string): Promise<UserResponse> {
        const response = await http.get(`${this.endpoint}/users/${id}`);
        return this.mapUser(response.data);
    }

    /**
     * Get a user's role
     * GET /api/v1/auth/users/{id}/role
     */
    async getUserRole(id: string): Promise<string> {
        const response = await http.get(`${this.endpoint}/users/${id}/role`);
        return response.data?.role ?? response.data;
    }
}