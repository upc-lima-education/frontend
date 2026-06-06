export class SignUpUserOrganizationResponse {
    userId: string;
    profileId: string;
    companyName: string;
    email: string;
    password: string;
    profilePicture?: string;
    description?: string;
    keywords?: string[];
    ruc?: string;
    isVerified?: boolean;
    district?: string;
    sector?: string;

    constructor(
        userId: string, profileId: string, companyName: string,
        email: string, password: string, profilePicture?: string,
        description?: string, keywords?: string[], ruc?: string,
        isVerified?: boolean, district?: string, sector?: string) {
        this.userId = userId;
        this.profileId = profileId;
        this.companyName = companyName;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
        this.description = description;
        this.keywords = keywords;
        this.ruc = ruc;
        this.isVerified = isVerified;
        this.district = district;
        this.sector = sector;
    }
}