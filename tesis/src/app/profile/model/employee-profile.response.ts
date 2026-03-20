export class SignUpUserEmployeeResponse {
    userId: string;
    profileId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;
    description?: string;
    keywords?: string[];
    ruc?: string;
    isVerified?: boolean;
    district?: string;

    constructor(
        userId: string, profileId: string, firstName: string,
        lastName: string, email: string, password: string,
        profilePicture?: string, description?: string, keywords?: string[],
        ruc?: string, isVerified?: boolean, district?: string) {
        this.userId = userId;
        this.profileId = profileId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
        this.description = description;
        this.keywords = keywords;
        this.ruc = ruc;
        this.isVerified = isVerified;
        this.district = district;
    }
}