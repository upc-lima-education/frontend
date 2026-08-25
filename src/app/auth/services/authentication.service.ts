import http from "@/app/common/services/base.service";
import type { SignUpRequest } from "../model/sign-up.request";
import type { AuthenticationResponse } from "../model/authentication.response";
import type { SignInRequest } from "../model/sign-in.request";
import type { UserResponse } from "../model/user.response";
import type { ExternalAuthenticationRequest } from "../model/external-authentication.request";

export class AuthenticationService {
    private endpoint = "/auth";

    async signUp(request: SignUpRequest): Promise<AuthenticationResponse> {
        const response = await http.post<AuthenticationResponse>(`${this.endpoint}/sign-up`, request);
        return response.data;
    }

    async signIn(request: SignInRequest): Promise<AuthenticationResponse> {
        const response = await http.post<AuthenticationResponse>(`${this.endpoint}/sign-in`, request);
        return response.data;
    }

    async getCurrentUser(): Promise<UserResponse> {
        const response = await http.get<UserResponse>(`${this.endpoint}/me`);
        return response.data;
    }

    async getGoogleAuthUrl(): Promise<string> {
        const response = await http.get<string>('/auth/url');
        return response.data;
    }

    async authenticateGoogle(request: ExternalAuthenticationRequest): Promise<AuthenticationResponse> {
        const response = await http.post<AuthenticationResponse>('/auth/authenticate', request);
        return response.data;
    }

    /*
    TODO: DELETE THIS
    */

    /*
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

    async signUpOld(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
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

    async signInOld(signInRequest: SignInRequest): Promise<SignInResponse> {
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

    async requestPasswordResetOld(email: string): Promise<PasswordResetResponse> {
        console.log('🔄 AuthService: Password reset request for:', email);

        const response = await http.post(`${this.endpoint}/forgot-password`, { email });
        console.log('📦 AuthService: Password reset response:', response.data);

        return new PasswordResetResponse(
            response.data.message || 'Password reset email sent',
            email
        );
    }

    async getGoogleAuthUrlOld(options?: { userType?: 'employee' | 'organization'; mode?: 'signup' | 'login' }): Promise<string> {
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

    async getCurrentUserOld(token: string): Promise<UserResponse> {
        console.log('🔄 AuthService: Getting current user with token');

        const response = await http.get(`${this.endpoint}/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('📦 AuthService: Current user response:', response.data);

        return this.mapUser(response.data.user);
    }

    async signOut(token: string): Promise<void> {
        await http.post(`${this.endpoint}/sign-out`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    async getUserById(id: string): Promise<UserResponse> {
        const response = await http.get(`${this.endpoint}/users/${id}`);
        return this.mapUser(response.data);
    }

    async getUserRole(id: string): Promise<string> {
        const response = await http.get(`${this.endpoint}/users/${id}/role`);
        return response.data?.role ?? response.data;
    }
    */
}

export const authenticationService = new AuthenticationService();