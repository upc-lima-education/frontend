export class UserResponse {
    id: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    locale?: string;

    constructor(
        id: string,
        email: string,
        emailVerified: boolean,
        name?: string,
        givenName?: string,
        familyName?: string,
        picture?: string,
        locale?: string
    ) {
        this.id = id;
        this.email = email;
        this.emailVerified = emailVerified;
        this.name = name;
        this.givenName = givenName;
        this.familyName = familyName;
        this.picture = picture;
        this.locale = locale;
    }
}
