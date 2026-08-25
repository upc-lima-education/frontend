import type { SuggestedProfileData } from "./suggested-profile-data";
import type { UserResponse } from "./user.response";

export interface AuthenticationResponse {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    suggestedProfileData?: SuggestedProfileData | null;
}