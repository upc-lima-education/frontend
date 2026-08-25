export interface UserResponse {
    id: string;
    email: string;
    emailVerified: boolean;
    profileType?: string | null;
    isActive: boolean;
    createdAt: string;
}