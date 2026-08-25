import type { ProfileType } from "@/app/profiles/enums/profile-type.enum";

export interface ExternalAuthenticationRequest {
    code: string;
    profileType?: ProfileType | null;
}