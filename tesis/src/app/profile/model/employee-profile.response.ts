export class SignUpUserEmployeeResponse {
    userId: string;
    profileId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;

    constructor(
        userId: string, profileId: string, firstName: string,
        lastName: string, email: string, password: string,
        profilePicture?: string) {
        this.userId = userId;
        this.profileId = profileId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
    }
}