export class SignUpRequest {
    email: string;
    password: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    userType?: 'employee' | 'organization';

    constructor(
        email: string,
        password: string,
        name?: string,
        givenName?: string,
        familyName?: string,
        userType?: 'employee' | 'organization'
    ) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.givenName = givenName;
        this.familyName = familyName;
        this.userType = userType;
    }
}