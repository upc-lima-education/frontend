export class SignUpRequest {
    email: string;
    password: string;
    name?: string;
    givenName?: string;
    familyName?: string;

    constructor(
        email: string,
        password: string,
        name?: string,
        givenName?: string,
        familyName?: string
    ) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.givenName = givenName;
        this.familyName = familyName;
    }
}