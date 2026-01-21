export class SignUpUserOrganizationResponse {
    userId: string;
    profileId: string;
    companyName: string;
    email: string;
    password: string;
    profilePicture?: string;

    constructor(
        userId: string, profileId: string, companyName: string,
        email: string, password: string, profilePicture?: string) {
        this.userId = userId;
        this.profileId = profileId;
        this.companyName = companyName;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
    }
}