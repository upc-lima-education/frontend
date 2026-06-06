export class UserResponse {
    id: string;
    email: string;
    emailVerified: boolean;
    firstName?: string;      // Para employees
    lastName?: string;       // Para employees
    companyName?: string;    // Para organizations
    userType: 'employee' | 'organization';
    picture?: string;
    locale?: string;
    createdAt?: string;

    constructor(
        id: string,
        email: string,
        emailVerified: boolean,
        firstName?: string,
        lastName?: string,
        companyName?: string,
        userType?: 'employee' | 'organization',
        picture?: string,
        locale?: string,
        createdAt?: string
    ) {
        this.id = id;
        this.email = email;
        this.emailVerified = emailVerified;
        this.firstName = firstName;
        this.lastName = lastName;
        this.companyName = companyName;
        this.userType = userType || 'employee';
        this.picture = picture;
        this.locale = locale;
        this.createdAt = createdAt;
    }
}
